import { redirect } from "next/navigation";
import { MeBoard } from "@/components/MeBoard";
import { dayOffset } from "@/lib/day";
import { readAccount } from "@/lib/account";
import { signOut } from "../join/actions";

export const metadata = { title: "You - Rooted" };

export default async function Me() {
  const account = await readAccount();
  if (!account) redirect("/join");

  return (
    <MeBoard
      name={account.name}
      email={account.email}
      mobile={account.mobile}
      joined={new Date(account.joined).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })}
      offset={await dayOffset()}
      signOut={
        <form action={signOut}>
          <button type="submit" className="link-arrow inline-flex text-faint">
            <span className="link-text">Sign out</span>
          </button>
        </form>
      }
    />
  );
}
