"use server";

import { redirect } from "next/navigation";
import { writeAccount, clearAccount, validate } from "@/lib/account";

export type JoinState = { errors: Record<string, string>; values: Record<string, string> };

export async function createAccount(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const mobile = String(formData.get("mobile") ?? "");

  const errors = validate(name, email, mobile);
  if (Object.keys(errors).length > 0) {
    return { errors, values: { name, email, mobile } };
  }

  await writeAccount({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    joined: new Date().toISOString(),
  });

  redirect("/today");
}

/**
 * The demo account.
 *
 * Somebody following the demo link should land in an account that belongs to
 * a person, not in a signed-out shell that greets them as "there" and sends
 * them back to the form the moment they tap Me. So the link signs them into a
 * real account with a real name on it. The plants and photographs are seeded
 * on the device the first time Today loads.
 *
 * The number below is a documentation number that reaches nobody. Real
 * contact details live in .env and never in a file that ships.
 */
export async function useDemoAccount() {
  await writeAccount({
    name: "Vicky Sharma",
    email: "vicky@rooted.demo",
    mobile: "+91 99999 00000",
    joined: new Date(Date.now() - 119 * 86_400_000).toISOString(),
  });
  redirect("/today");
}

export async function signOut() {
  await clearAccount();
  redirect("/");
}
