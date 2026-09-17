import { all, dueNow, put } from "@/lib/reminders";
import { notify } from "@/lib/notify";

/**
 * The clock.
 *
 * Runs on a schedule, finds everything that has come due and not been sent,
 * sends it on whichever channels that person left switched on, and marks it so
 * an hourly clock does not become an hourly nag.
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
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const fromVercel = request.headers.get("user-agent")?.includes("vercel-cron");
  if (secret && auth !== `Bearer ${secret}` && !fromVercel)
    return Response.json({ error: "not-authorised" }, { status: 401 });

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
