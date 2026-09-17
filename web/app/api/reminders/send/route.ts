import { readAccount } from "@/lib/account";
import { notify, type Channel, type Reminder } from "@/lib/notify";

/**
 * Send one now.
 *
 * The hourly clock is the real behaviour, and it is the right behaviour, but
 * nobody is going to sit through an hour of a five minute video waiting for it
 * to strike. This sends the same message the clock would, through the same
 * code, on a tap.
 *
 * It only ever messages the account that is signed in, using the address and
 * number that account was created with, so it cannot be pointed at anybody
 * else.
 */
export async function POST(request: Request) {
  const account = await readAccount();
  if (!account) return Response.json({ error: "not-signed-in" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    channels?: Channel[];
    plant?: string;
    task?: string;
    why?: string;
    dueIn?: number;
  };

  const reminder: Reminder = {
    name: account.name,
    email: account.email,
    mobile: account.mobile,
    plant: body.plant ?? "Your plant",
    task: body.task ?? "Water it",
    why: body.why ?? "It is due today.",
    dueIn: typeof body.dueIn === "number" ? body.dueIn : 0,
  };

  const origin = new URL(request.url).origin;
  const sent = await notify(
    reminder,
    (body.channels ?? ["email", "whatsapp", "sms"]) as Channel[],
    `${origin}/today`,
  );

  return Response.json({ sent });
}
