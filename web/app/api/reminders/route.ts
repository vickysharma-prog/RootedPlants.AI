import { readAccount } from "@/lib/account";
import { idFor, put, storeReady, type Due, type Subscriber } from "@/lib/reminders";
import { configured, type Channel } from "@/lib/notify";

/**
 * The browser tells the server when things are next due.
 *
 * It sends no photographs, no coordinates and no points: a name, a way to
 * reach somebody, and a short list of what is coming up. That is the least
 * that lets a reminder arrive without the app being open, which is the whole
 * point of a reminder.
 *
 * Called whenever the schedule changes, so the server's copy is never much
 * older than the phone's.
 */
export async function POST(request: Request) {
  const account = await readAccount();
  if (!account) return Response.json({ error: "not-signed-in" }, { status: 401 });

  if (!storeReady())
    return Response.json({ saved: false, reason: "no-store", channels: configured() });

  const body = (await request.json().catch(() => ({}))) as {
    channels?: Channel[];
    due?: Due[];
  };

  const sub: Subscriber = {
    id: idFor(account.email, account.mobile),
    name: account.name,
    email: account.email,
    mobile: account.mobile,
    channels: (body.channels ?? ["email", "whatsapp", "sms"]).filter((c) =>
      ["email", "whatsapp", "sms"].includes(c),
    ),
    // Only what is coming, and only a handful. A year of schedule on a server
    // is a year of somebody's habits on a server.
    due: (body.due ?? []).slice(0, 12),
    updatedAt: new Date().toISOString(),
  };

  const saved = await put(sub);
  return Response.json({ saved, channels: configured(), watching: sub.due.length });
}

/** What this deployment can actually send, so the account screen can say so. */
export async function GET() {
  return Response.json({ store: storeReady(), channels: configured() });
}
