import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { Wordmark } from "@/components/Wordmark";
import { SoundToggle } from "@/components/SoundToggle";
import { Clip } from "@/components/Clip";

const STEPS = [
  {
    n: "01",
    title: "Register it once",
    body: "A photo, the species, and the spot. That spot is what every later check is measured against.",
  },
  {
    n: "02",
    title: "It watches your weather",
    body: "Rain where your plant is pushes the next watering out. A heat spell pulls it in.",
  },
  {
    n: "03",
    title: "Prove it as you do it",
    body: "Photograph the job while you do it. Location, time and the plant itself are all checked.",
  },
  {
    n: "04",
    title: "Get paid for keeping it",
    body: "Points land the moment the photo clears, and a streak is worth far more than one good week.",
  },
];

export default function Landing() {
  return (
    <div className="page">
      <ForestBackdrop scene="jungle" />

      <header className="on-forest column-wide flex items-center justify-between gap-6 pt-10 pb-2">
        <Wordmark />
        <SoundToggle />
      </header>

      <main className="on-forest column-wide flex flex-1 flex-col pt-12 pb-14">
        <section>
          <div>
            <h1
              className="display h-hero rise-in max-w-[17ch]"
              style={{ textWrap: "balance" }}
            >
              Everybody plants a tree.
              <span className="mt-1 block text-body italic">
                Nobody finds out what happened to it.
              </span>
            </h1>

            <p
              className="prose-lg rise-in mt-8 max-w-[34rem] text-body"
              style={{ animationDelay: "0.1s" }}
            >
              You plant it, you take the photo, you post it. Then a year of
              small boring jobs decides whether it lives, and nothing is holding
              you to them.
            </p>

            <p
              className="prose-lg rise-in mt-4 max-w-[34rem] text-cream"
              style={{ animationDelay: "0.16s" }}
            >
              Rooted holds you to them, and pays you for it.
            </p>

            <div
              className="rise-in mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "0.22s" }}
            >
              <Link
                href="/join"
                className="btn flex h-[56px] min-w-[15rem] items-center justify-center rounded-full bg-cream px-8 text-[15.5px] font-semibold tracking-[0.01em] text-bg"
              >
                <span className="btn-label">Start with one plant</span>
                <span className="btn-arrow">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/today"
                className="link-arrow flex h-[56px] items-center gap-2 px-2 text-[15px] font-medium text-body"
              >
                <span className="link-text">See it working</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <Clip src="/video/planting.mp4" poster="/video/planting-poster.jpg" ratio="11 / 6" />
          <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-body">
            A drive, a birthday, a festival, a company afternoon. Somewhere in
            this country a sapling goes into the ground every few seconds.
          </p>
          <p className="mt-4 max-w-[34rem] text-[17px] leading-[1.7] text-cream">
            What happens over the next two years is what decides whether it was
            worth doing, and nobody is watching that part.
          </p>
        </section>

        {/* Four steps, two across. */}
        <section className="mt-20">
          <p className="label">How it works</p>
          <div className="mt-6">
            {STEPS.map((s) => (
              <article key={s.n} className="row flex gap-6">
                <span className="num mt-[8px] shrink-0 text-[13px] text-gold-dim">{s.n}</span>
                <div className="max-w-[34rem]">
                  <h2 className="display text-[26px] leading-snug">{s.title}</h2>
                  <p className="mt-2 text-[15.5px] leading-[1.72] text-body">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* The line the whole thing rests on. */}
        <section className="mt-24 border-t border-line-soft pt-14">
          <p className="display h-quote max-w-[24ch] leading-[1.18]">
            Spend money, earn points. Pay the credit card bill on time, earn
            more.
          </p>
          <p className="display h-quote mt-5 max-w-[24ch] leading-[1.18] text-moss italic">
            Rooted pays you for keeping something alive.
          </p>
        </section>

        <div className="flex-1" />

        <footer className="mt-24">
          <div className="rule" />
          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/how-it-works" className="link-arrow inline-flex text-cream">
                <span className="link-text text-[14.5px]">How it works</span>
              </Link>
              <Link href="/accessibility" className="link-arrow inline-flex text-body">
                <span className="link-text text-[14.5px]">Accessibility</span>
              </Link>
              <Link href="/privacy" className="link-arrow inline-flex text-body">
                <span className="link-text text-[14.5px]">Privacy</span>
              </Link>
            </nav>
            <p className="label">NextStep Hacks 2026 &middot; Earth Forward</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
