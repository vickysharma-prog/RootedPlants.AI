import { cookies } from "next/headers";

/**
 * An account, kept in a cookie.
 *
 * No password, no provider, no database. You give your name and where
 * reminders should reach you, and the browser holds it from then on. It
 * survives reloads and restarts, it can be signed out, and it is read on the
 * server so the app can greet you by name.
 *
 * What that buys: anybody can be through the door in eight seconds, which is
 * what a person recording a demo needs and what a judge opening a link wants.
 * What it costs: an account lives on one device, and moving to another means
 * filling the form again. For what this is, that is the right trade.
 */

export type Account = {
  name: string;
  email: string;
  mobile?: string;
  joined: string;
};

const COOKIE = "rooted_account";
const YEAR = 60 * 60 * 24 * 365;

export async function readAccount(): Promise<Account | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Account;
    return parsed?.name && parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeAccount(account: Account) {
  (await cookies()).set(COOKIE, JSON.stringify(account), {
    path: "/",
    maxAge: YEAR,
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function clearAccount() {
  (await cookies()).delete(COOKIE);
}

export function firstName(account: Account): string {
  return account.name.trim().split(/\s+/)[0];
}

/** Deliberately forgiving. This is a front door, not a border. */
export function validate(name: string, email: string, mobile: string) {
  const errors: Record<string, string> = {};

  if (name.trim().length < 2) errors.name = "Tell us what to call you.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim()))
    errors.email = "That email does not look finished.";
  if (mobile.trim() && mobile.replace(/\D/g, "").length < 7)
    errors.mobile = "That number looks short. Leave it blank if you would rather not.";

  return errors;
}
