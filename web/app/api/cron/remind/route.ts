import { all, dueNow, put } from "@/lib/reminders";
import { configured, notify } from "@/lib/notify";

/**
 * The clock.
 *
 * Runs once a day, a little after eight in the morning in India, finds
 * everything that has come due and not been sent, sends it on whichever
 * channels that person left switched on, and marks it as sent.
 *
 * Once a day rather than hourly, and not only because the free plan allows one:
 * nobody wants to be told about a plant every hour, and watering is a morning
 * job anyway. Marking what has been sent is what keeps a daily clock from
 * repeating itself if it runs twice.
 *
 * This is the part that makes the product what it claims to be. Everything
 * else in here waits for somebody to open the app, and the whole premise is
 * that they will not.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel signs its cron requests. Anything else needs the secret, so this
  // cannot be used as a way to make somebody else's phone buzz.
  //
  // With no secret set this used to let anybody through, which was harmless
  // only for as long as there was nothing configured to send. It fails closed
  // now: the moment a channel can actually reach somebody, a secret is
  // required, so adding keys without one cannot quietly open a door.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const fromVercel = request.headers.get("user-agent")?.includes("vercel-cron");
  const canSend = Object.values(configured()).some(Boolean);

  if (!fromVercel) {
    if (!secret && canSend)
      return Response.json({ error: "no-cron-secret-set" }, { status: 401 });
    if (secret && auth !== `Bearer ${secret}`)
      return Response.json({ error: "not-authorised" }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const people = await all();
  const report: Array<{ to: string; plant: string; channels: string[] }> = [];

  for (const sub of people) {
    const due = dueNow(sub, Date.now());
    if (!due.length) continue;

    for (const d of due) {
      const sent = await notify(
        {
          name: sub.name,
          email: sub.email,
          mobile: sub.mobile,
          plant: d.plant,
          task: d.task,
          why: d.why,
          dueIn: Math.round((new Date(d.dueAt).getTime() - Date.now()) / 86_400_000),
        },
        sub.channels,
        `${origin}/today`,
      );

      if (sent.some((s) => s.ok)) d.sentAt = new Date().toISOString();
      report.push({
        to: sub.id,
        plant: d.plant,
        channels: sent.filter((s) => s.ok).map((s) => s.channel),
      });
    }

    await put(sub);
  }

  return Response.json({ checked: people.length, sent: report });
}
