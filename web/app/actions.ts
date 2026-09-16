"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DAY_COOKIE } from "@/lib/day";

/** Move the demo's day forward, so a schedule can be shown moving. */
export async function jumpDays(days: number) {
  const jar = await cookies();
  const now = Number(jar.get(DAY_COOKIE)?.value) || 0;
  jar.set(DAY_COOKIE, String(now + days), { path: "/", maxAge: 60 * 60 * 24 });
  revalidatePath("/", "layout");
}

export async function resetDay() {
  const jar = await cookies();
  jar.set(DAY_COOKIE, "0", { path: "/", maxAge: 60 * 60 * 24 });
  revalidatePath("/", "layout");
}
