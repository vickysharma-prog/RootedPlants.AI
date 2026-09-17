import type { Channel } from "./notify";

/**
 * The little the server is told, so a reminder can arrive without the app open.
 *
 * Plants, photographs and points live on the phone, and that is the right
 * place for them. But a reminder whose whole job is to reach somebody who has
 * stopped thinking about the plant cannot wait for them to open the app, so
 * something has to be on a server for a clock to run against.
 *
 * What goes here is the smallest thing that does that job: who to reach, what
 * the plant is called, and when it is next due. No photographs, no
 * coordinates, no points, no history. Those never leave the device.
 *
 * Backed by Upstash over REST, which is two environment variables and no
 * client library. Without them this reports itself as unavailable and the
 * account screen says so, rather than pretending to have saved something.
 */

export type Due = {
  plant: string;
  task: string;
  /** ISO. When this one wants doing. */
  dueAt: string;
  why: string;
  /** Set once sent, so a reminder goes out once rather than hourly. */
  sentAt?: string;
};

export type Subscriber = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  channels: Channel[];
  due: Due[];
  updatedAt: string;
};

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "rooted:subscribers";

export function storeReady(): boolean {
  return Boolean(URL_ && TOKEN);
}

async function command(...args: (string | number)[]): Promise<unknown> {
  if (!URL_ || !TOKEN) throw new Error("no store configured");
  const res = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`store said ${res.status}`);
  return (await res.json())?.result ?? null;
}

export async function all(): Promise<Subscriber[]> {
  if (!storeReady()) return [];
  try {
    const raw = (await command("HGETALL", KEY)) as string[] | Record<string, string> | null;
    if (!raw) return [];
    // Upstash returns a flat array for HGETALL over REST.
    const values = Array.isArray(raw)
      ? raw.filter((_, i) => i % 2 === 1)
      : Object.values(raw);
    return values.map((v) => JSON.parse(v as string) as Subscriber);
  } catch {
    return [];
  }
}

export async function put(sub: Subscriber): Promise<boolean> {
  if (!storeReady()) return false;
  try {
    await command("HSET", KEY, sub.id, JSON.stringify(sub));
    return true;
  } catch {
    return false;
  }
}

export async function get(id: string): Promise<Subscriber | null> {
  if (!storeReady()) return null;
  try {
    const raw = (await command("HGET", KEY, id)) as string | null;
    return raw ? (JSON.parse(raw) as Subscriber) : null;
  } catch {
    return null;
  }
}

export async function remove(id: string): Promise<void> {
  if (!storeReady()) return;
  try {
    await command("HDEL", KEY, id);
  } catch {
    // Nothing to do. A row that will not delete costs one stale reminder.
  }
}

/**
 * Who is overdue and has not been told yet.
 *
 * `graceHours` keeps the app from messaging somebody the minute a task turns
 * due. Anything sent already is left alone, which is what keeps the clock from
 * repeating itself.
 */
export function dueNow(sub: Subscriber, now = Date.now(), graceHours = 0): Due[] {
  const cutoff = now - graceHours * 3600_000;
  return sub.due.filter((d) => !d.sentAt && new Date(d.dueAt).getTime() <= cutoff);
}

/** An id that is stable for one person without being anything about them. */
export function idFor(email: string, mobile: string): string {
  const raw = `${email.trim().toLowerCase()}|${mobile.replace(/\D/g, "")}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
