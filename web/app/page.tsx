import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";

export default function Landing() {
  return (
    <>
      <ForestBackdrop />

      <main className="on-forest flex flex-1 flex-col px-6 pt-20 pb-10">
        <p className="font-display text-[13px] font-bold tracking-[0.22em] text-[#9ec9ad] uppercase">
          Rooted
        </p>

        <h1 className="mt-6 font-display text-[40px] leading-[1.06] font-extrabold tracking-[-0.03em]">
          Everybody plants a tree.
          <br />
          <span className="text-[#f0c979]">Nobody finds out</span> what happened to it.
        </h1>

        <p className="mt-5 max-w-[22rem] text-[15.5px] leading-relaxed text-[#cfd3c4]">
          You plant it, you take the photo, you post it. Then a year of small
          boring jobs decides whether it lives, and nothing is holding you to
          them.
        </p>

        <p className="mt-4 max-w-[22rem] text-[15.5px] leading-relaxed text-[#cfd3c4]">
          Rooted holds you to them, and pays you for it.
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <Link
            href="/join"
            className="flex h-[54px] items-center justify-center rounded-2xl bg-[#f2efe4] text-[16px] font-semibold text-[#0b1c17] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
          >
            Plant something
          </Link>
          <Link
            href="/today"
            className="flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-[#f2efe4]/25 text-[15px] font-semibold text-[#f2efe4]"
          >
            See it working
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="mt-12 flex flex-col gap-5">
          <Beat
            n="01"
            title="Register it once"
            body="A photo, the species, and the spot. That spot is what every later check is measured against."
          />
          <Beat
            n="02"
            title="It watches the weather"
            body="Rain where your plant is pushes the next watering out. A heat spell pulls it in."
          />
          <Beat
            n="03"
            title="Prove it, get paid"
            body="Photograph the job as you do it. The photo is checked, the points land, and they turn into real rewards."
          />
        </div>

        <div className="mt-12 rounded-3xl border border-[#f2efe4]/15 bg-[#0a1a15]/55 p-6">
          <p className="font-display text-[21px] leading-snug font-bold tracking-[-0.01em]">
            We reward people for spending money.
          </p>
          <p className="mt-2 font-display text-[21px] leading-snug font-bold tracking-[-0.01em] text-[#9ec9ad]">
            Rooted rewards them for keeping something alive.
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-[#8d9285]">
          Built for NextStep Hacks 2026, Earth Forward
        </p>
      </main>
    </>
  );
}

function Beat({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 font-display text-[13px] font-bold tracking-widest text-[#f0c979]">
        {n}
      </span>
      <div>
        <h2 className="font-display text-[17px] font-bold tracking-[-0.01em]">{title}</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#b9beac]">{body}</p>
      </div>
    </div>
  );
}
