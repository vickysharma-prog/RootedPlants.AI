import type { TaskKind } from "./data";

/**
 * Getting a reminder to somebody who has stopped thinking about the plant.
 *
 * The whole premise is that people forget. A product built on that cannot then
 * wait to be opened, so the reminder has to arrive where somebody already is:
 * a message on their phone, and an email they will see later.
 *
 * Every sender below is optional. Without its keys it reports that it is not
 * configured rather than throwing, because a missing key should cost you a
 * channel and never the whole reminder.
 *
 * Server only. None of these keys ever reach a browser.
 */

export type Channel = "email" | "whatsapp" | "sms";

export type Sent = {
  channel: Channel;
  ok: boolean;
  /** What happened, in words, so a failure is never silent. */
  detail: string;
};

export type Reminder = {
  /** Which job, so the plant can ask in its own words. */
  kind: TaskKind;
  name: string;
  email: string;
  /** Digits with a country code, as E.164 without the plus. */
  mobile: string;
  plant: string;
  task: string;
  /** Negative when overdue. */
  dueIn: number;
  why: string;
};

/* ------------------------------------------------------------------ words */

/**
 * The plant speaks first.
 *
 * A reminder that opens with a task reads like a chore, and a chore is the
 * thing people already ignore. This whole product rests on somebody caring
 * whether one particular plant lives, so the message leads with the plant
 * wanting something and the instruction follows it.
 *
 * One emoji, at the front, because that is what makes a notification legible
 * at a glance on a lock screen. Not a sprinkle of them through the sentence.
 */
const PLEA: Record<TaskKind, { icon: string; asks: string; line: string }> = {
  water: {
    icon: "\u{1F4A7}",
    asks: "is thirsty",
    line: "is asking for water",
  },
  fertilise: {
    icon: "\u{1F331}",
    asks: "is hungry",
    line: "could do with a feed",
  },
  pest: {
    icon: "\u{1F50D}",
    asks: "needs a look",
    line: "wants its leaves checked",
  },
  checkin: {
    icon: "\u{1F33F}",
    asks: "misses you",
    line: "has not been seen in a while",
  },
};

/**
 * One message, written once, sent everywhere.
 *
 * It names the plant, says what it wants and why now, and gives one link. A
 * reminder that needs reading twice is a reminder people turn off.
 */
export function compose(r: Reminder, url: string) {
  const late = r.dueIn < 0;
  const when = late
    ? `${-r.dueIn} ${-r.dueIn === 1 ? "day" : "days"} late`
    : r.dueIn === 0
      ? "due today"
      : `due in ${r.dueIn} days`;

  const plea = PLEA[r.kind] ?? PLEA.water;
  const first = r.name.trim().split(/\s+/)[0] || "there";

  const subject = `${plea.icon} ${r.plant} ${plea.asks}`;

  const body =
    `${first}, your ${r.plant.toLowerCase()} ${plea.line}.\n\n` +
    `${r.task}. ${r.why}\n` +
    `${late ? `It has been waiting ${-r.dueIn} ${-r.dueIn === 1 ? "day" : "days"}.` : `It is ${when}.`}\n\n` +
    `Two minutes, photographed as you do it. ${url}`;

  return { subject, body, when };
}

/* ----------------------------------------------------------------- email */

/** Resend. One POST, no SDK, so there is nothing to keep up to date. */
async function sendEmail(r: Reminder, url: string): Promise<Sent> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { channel: "email", ok: false, detail: "No email key configured." };

  const from = process.env.RESEND_FROM || "Rooted <onboarding@resend.dev>";
  const { subject, body } = compose(r, url);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [r.email],
        subject,
        text: body,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok
      ? { channel: "email", ok: true, detail: `Sent to ${r.email}.` }
      : {
          channel: "email",
          ok: false,
          detail: `Refused: ${data?.message ?? res.status}`,
        };
  } catch (err) {
    return { channel: "email", ok: false, detail: `Could not reach Resend: ${err}` };
  }
}

/* -------------------------------------------------------------- whatsapp */

/**
 * Twilio, over the form-encoded API their WhatsApp sandbox speaks.
 *
 * The sandbox needs the recipient to have joined it once from their own phone.
 * That is a property of the sandbox and not of the product: a live account
 * sends to anybody who has opted in the normal way.
 */
async function sendWhatsApp(r: Reminder, url: string): Promise<Sent> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from)
    return { channel: "whatsapp", ok: false, detail: "No WhatsApp keys configured." };

  const { body } = compose(r, url);

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:+${from.replace(/\D/g, "")}`,
        To: `whatsapp:+${r.mobile.replace(/\D/g, "")}`,
        Body: body,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok
      ? { channel: "whatsapp", ok: true, detail: `Sent to +${r.mobile}.` }
      : { channel: "whatsapp", ok: false, detail: `Refused: ${data?.message ?? res.status}` };
  } catch (err) {
    return { channel: "whatsapp", ok: false, detail: `Could not reach Twilio: ${err}` };
  }
}

/* ------------------------------------------------------------------- sms */

async function sendSms(r: Reminder, url: string): Promise<Sent> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM;
  if (!sid || !token || !from)
    return { channel: "sms", ok: false, detail: "No text message number configured." };

  const { body } = compose(r, url);

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: `+${r.mobile.replace(/\D/g, "")}`,
        Body: body,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok
      ? { channel: "sms", ok: true, detail: `Sent to +${r.mobile}.` }
      : { channel: "sms", ok: false, detail: `Refused: ${data?.message ?? res.status}` };
  } catch (err) {
    return { channel: "sms", ok: false, detail: `Could not reach Twilio: ${err}` };
  }
}

/* ------------------------------------------------------------------- all */

/**
 * The same reminder on every channel that is switched on and configured.
 *
 * They go out together rather than one after another, because a person who has
 * already seen the WhatsApp should not wait on an email API before their app
 * says it is done.
 */
export async function notify(
  r: Reminder,
  channels: Channel[],
  url: string,
): Promise<Sent[]> {
  const jobs: Array<Promise<Sent>> = [];
  if (channels.includes("email")) jobs.push(sendEmail(r, url));
  if (channels.includes("whatsapp")) jobs.push(sendWhatsApp(r, url));
  if (channels.includes("sms")) jobs.push(sendSms(r, url));
  return Promise.all(jobs);
}

/** Which channels this deployment could actually use, for the account screen. */
export function configured(): Record<Channel, boolean> {
  const twilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  return {
    email: Boolean(process.env.RESEND_API_KEY),
    whatsapp: twilio && Boolean(process.env.TWILIO_WHATSAPP_FROM),
    sms: twilio && Boolean(process.env.TWILIO_SMS_FROM),
  };
}
