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
    mobile: mobile.trim() || undefined,
    joined: new Date().toISOString(),
  });

  redirect("/today");
}

export async function signOut() {
  await clearAccount();
  redirect("/");
}
