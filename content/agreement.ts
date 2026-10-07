// DRAFT rental agreement. Planet Bounce must replace this with their own wording, ideally reviewed
// by their insurance agent or a lawyer, before taking real bookings. Bump the version when it changes
// (and AGREEMENT_VERSION in supabase/functions/create-booking).
export const agreementVersion = "draft-2026-10-07";

export const agreement: { heading: string; text: string }[] = [
  {
    heading: "Supervision",
    text: "A responsible adult must watch the inflatable at all times while it is in use. Follow the posted safety rules, including the limits on number, age and size of riders. No shoes, food, drinks, gum, silly string, sharp objects or pets inside.",
  },
  {
    heading: "Weather",
    text: "Do not use the inflatable in rain, lightning, or winds over 15 mph. If the weather turns, have everyone get out and unplug the blower. If weather makes setup unsafe, we will work with you to reschedule.",
  },
  {
    heading: "Power and setup",
    text: "Keep the blower running whenever anyone is inside, and do not move the inflatable once it is set up. Only Planet Bounce staff may set up, take down or relocate the equipment.",
  },
  {
    heading: "Payment",
    text: "A 50% deposit holds your date. The remaining balance is due before setup on the day of your party.",
  },
  {
    heading: "Damage and cleaning",
    text: "You are responsible for damage beyond normal wear, and for loss or theft while the equipment is in your care. Extra cleaning fees may apply for heavy mess, paint, glitter or similar.",
  },
  {
    heading: "Assumption of risk and release",
    text: "Using inflatables involves physical activity and some risk of injury. You accept these risks for yourself and your guests, agree to enforce the safety rules, and release Planet Bounce from claims arising from use of the equipment, except those caused by Planet Bounce's own negligence.",
  },
];
