import Link from "next/link";
import { readAccount, firstName } from "@/lib/account";
import { signOut } from "@/app/join/actions";

/**
 * Who this Today screen belongs to.
 *
 * Signed out it says so plainly, because a screen full of somebody else's
 * plants with no explanation is confusing. Signed in it is a first name and a
 * way out, and nothing else.
 */
export async function AccountBar() {
  const account = await readAccount();

  if (!account) {
    return (
      <div className="flex items-center gap-3">
        <span className="label">Demo account</span>
        <Link href="/join" className="link-arrow inline-flex text-cream">
          <span className="link-text text-[13.5px] font-semibold">Make your own</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-semibold"
        style={{ background: "var(--surface-strong)", color: "var(--moss)" }}
        aria-hidden
      >
        {firstName(account)[0].toUpperCase()}
      </span>
      <span className="max-w-[10rem] truncate text-[14px] text-body">
        {firstName(account)}
      </span>
      <form action={signOut}>
        <button type="submit" className="label text-faint">
          Sign out
        </button>
      </form>
    </div>
  );
}
