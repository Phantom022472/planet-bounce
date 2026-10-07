-- Planet Bounce: rentals, bookings and availability.
-- Customers never read these tables directly. They only call get_unavailable_dates()
-- and the create-booking function; owners read everything through their app.

create extension if not exists btree_gist;

create table public.rentals (
  slug        text primary key,
  name        text not null,
  price_cents integer,              -- null = "call for price", not bookable online
  quantity    integer not null default 1 check (quantity > 0),
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create type public.booking_status as enum ('pending_payment', 'confirmed', 'cancelled', 'completed');

create table public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,               -- short code shown to the customer, e.g. PB-7K3Q
  status             public.booking_status not null default 'pending_payment',
  rental_slug        text not null references public.rentals(slug),
  start_date         date not null,
  end_date           date not null,
  dates              daterange generated always as (daterange(start_date, end_date, '[]')) stored,
  setup_time         text,
  surface            text check (surface in ('grass', 'concrete', 'indoor', 'other')),
  customer_name      text not null,
  customer_phone     text not null,
  customer_email     text not null,
  address_line       text not null,
  city               text not null,
  zip                text not null,
  notes              text,
  subtotal_cents     integer not null,
  tax_cents          integer not null,
  total_cents        integer not null,
  deposit_cents      integer not null,
  paid_cents         integer not null default 0,
  agreement_version  text not null,
  signer_name        text not null,
  signature_png      text not null,                      -- data URL of the drawn signature
  signed_at          timestamptz not null,
  signer_ip          text,
  stripe_session_id  text unique,
  hold_expires_at    timestamptz,                         -- unpaid bookings stop blocking the date after this
  created_at         timestamptz not null default now(),
  check (end_date >= start_date)
);

create index bookings_rental_dates on public.bookings using gist (rental_slug, dates);

alter table public.rentals enable row level security;
alter table public.bookings enable row level security;
-- No policies yet: only the service role (edge functions) can touch these tables.
-- Owner access policies arrive with the owners' app.

-- A booking blocks its dates when it is confirmed, or still inside its payment hold.
create or replace function public.booking_blocks(b public.bookings)
returns boolean language sql stable as $$
  select b.status = 'confirmed'
      or (b.status = 'pending_payment' and b.hold_expires_at > now())
$$;

-- Public: which dates are fully booked for one rental. Returns dates only, never customer data.
create or replace function public.get_unavailable_dates(p_slug text, p_from date, p_to date)
returns setof date
language sql stable security definer set search_path = public as $$
  select d::date
  from generate_series(p_from, least(p_to, p_from + 400), interval '1 day') d
  where (
    select count(*) from bookings b
    where b.rental_slug = p_slug and b.dates @> d::date and public.booking_blocks(b)
  ) >= coalesce((select quantity from rentals where slug = p_slug and active), 0)
$$;

revoke all on function public.get_unavailable_dates(text, date, date) from public;
grant execute on function public.get_unavailable_dates(text, date, date) to anon, authenticated;

-- Used by create-booking inside one transaction so two customers can't grab the same date.
create or replace function public.reserve_booking(p jsonb)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  r rentals;
  taken integer;
  result bookings;
begin
  select * into r from rentals where slug = p->>'rental_slug' and active for update;
  if r is null or r.price_cents is null then
    raise exception 'rental_not_bookable';
  end if;

  select count(*) into taken from bookings b
  where b.rental_slug = r.slug
    and b.dates && daterange((p->>'start_date')::date, (p->>'end_date')::date, '[]')
    and public.booking_blocks(b);
  if taken >= r.quantity then
    raise exception 'dates_unavailable';
  end if;

  insert into bookings (
    code, rental_slug, start_date, end_date, setup_time, surface,
    customer_name, customer_phone, customer_email, address_line, city, zip, notes,
    subtotal_cents, tax_cents, total_cents, deposit_cents,
    agreement_version, signer_name, signature_png, signed_at, signer_ip, hold_expires_at
  ) values (
    p->>'code', r.slug, (p->>'start_date')::date, (p->>'end_date')::date, p->>'setup_time', p->>'surface',
    p->>'customer_name', p->>'customer_phone', p->>'customer_email', p->>'address_line', p->>'city', p->>'zip', p->>'notes',
    (p->>'subtotal_cents')::int, (p->>'tax_cents')::int, (p->>'total_cents')::int, (p->>'deposit_cents')::int,
    p->>'agreement_version', p->>'signer_name', p->>'signature_png', now(), p->>'signer_ip',
    now() + interval '35 minutes'  -- longer than the 31-minute Stripe checkout, so a late payment never lands on a re-booked date
  ) returning * into result;
  return result;
end $$;

revoke all on function public.reserve_booking(jsonb) from public, anon, authenticated;

-- Starting inventory. Owners will manage this from their app.
insert into public.rentals (slug, name, price_cents, sort_order) values
  ('king-castle',   'King Castle',         20800, 1),
  ('jungle-jump',   'Jungle Jump',         null,  2),
  ('toxic-bounce',  'Toxic Bounce',        null,  3),
  ('rainbow-combo', 'Rainbow Combo',       null,  4),
  ('marble-splash', 'Marble Splash Combo', null,  5),
  ('axe-throwing',  'Axe Throwing',        null,  6);

-- Public: what the confirmation page shows. No names, addresses or contact details.
create or replace function public.get_booking_summary(p_code text)
returns table (code text, status public.booking_status, rental_name text, start_date date, end_date date,
               total_cents integer, deposit_cents integer, paid_cents integer)
language sql stable security definer set search_path = public as $$
  select b.code, b.status, r.name, b.start_date, b.end_date, b.total_cents, b.deposit_cents, b.paid_cents
  from bookings b join rentals r on r.slug = b.rental_slug
  where b.code = upper(p_code)
$$;

revoke all on function public.get_booking_summary(text) from public;
grant execute on function public.get_booking_summary(text) to anon, authenticated;
