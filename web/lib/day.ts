import { cookies } from "next/headers";

export const DAY_COOKIE = "rooted_day";

/**
 * The demo's day counter.
 *
 * A watering due on Saturday cannot be shown in a five minute video, so the
 * demo moves the day instead of waiting for it. Everything the schedule
 * computes runs through this, so moving it moves the whole app.
 */
export async function dayOffset(): Promise<number> {
  const raw = (await cookies()).get(DAY_COOKIE)?.value;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function dateFor(offset: number): Date {
  return new Date(Date.now() + offset * 86_400_000);
}

export function longDate(offset: number): string {
  return dateFor(offset).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
