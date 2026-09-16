/**
 * The clock the app trusts.
 *
 * A photograph carries whatever time its device claims, and a device clock is
 * something anybody can move. So the time on a verified task is taken here,
 * when the shutter is pressed, and the file is never asked.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ now: new Date().toISOString() });
}
