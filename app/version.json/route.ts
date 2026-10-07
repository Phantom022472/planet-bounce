// Tells open pages which version is live. See components/UpdateBanner.tsx.
export const dynamic = "force-static";

export function GET() {
  return Response.json({ id: process.env.NEXT_PUBLIC_BUILD_ID });
}
