import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { SoundToggle } from "@/components/SoundToggle";
import { Clip } from "@/components/Clip";
import { JoinForm } from "@/components/JoinForm";
import { readAccount } from "@/lib/account";
import { redirect } from "next/navigation";
import { useDemoAccount } from "./actions";

export const metadata = { title: "Start with one plant - Rooted" };

export default async function Join() {
  // Somebody who already has an account on this device does not need the form.
  if (await readAccount()) redirect("/today");

  return (
    <div className="page">
      <ForestBackdrop scene="trunks" />

      <main className="on-forest column flex flex-1 flex-col pt-14 pb-12">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-body"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>
          <SoundToggle />
        </div>

        <p className="label rise-in mt-10">Step one of one</p>

        <h1 className="display h-sub rise-in mt-3" style={{ animationDelay: "0.06s" }}>
          Start with{" "}
          <span className="italic text-body">one plant.</span>
        </h1>

        <p className="prose-lg rise-in mt-5 max-w-[30rem] text-body" style={{ animationDelay: "0.12s" }}>
          One is enough. The neem in the backyard, the tulsi on the balcony, the
          sapling from last month&apos;s drive.
        </p>

        <div className="rise-in mt-10" style={{ animationDelay: "0.18s" }}>
          <JoinForm />
        </div>

        <div className="flex-1" />

        <figure className="mt-14 max-w-[40rem]">
          <Clip
            src="/video/watering.mp4"
            poster="/video/watering-poster.jpg"
            ratio="11 / 6"
          />
          <figcaption className="mt-4 text-[16px] leading-[1.68] text-body">
            This is the whole job.{" "}
            <span className="font-semibold text-cream">Two minutes, every few days</span>,
            photographed as you do it. That is what Rooted pays for.
          </figcaption>
        </figure>

        <div className="mt-16 max-w-[34rem]">
          <div className="rule" />
          <p className="mt-6 text-[16px] leading-[1.7] text-body">
            Your plant photographs{" "}
            <span className="font-semibold text-cream">stay private</span>.
            Anywhere a plant appears publicly it appears in an area, never at
            an address.
          </p>
          <p className="mt-7 text-[16.5px] text-body">
            Just looking?{" "}
            <form action={useDemoAccount} className="inline">
              <button type="submit" className="link-arrow inline-flex text-cream">
                <span className="link-text font-semibold">See the demo account</span>
              </button>
            </form>
          </p>
        </div>
      </main>
    </div>
  );
}
