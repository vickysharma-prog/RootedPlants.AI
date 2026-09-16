import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { Wordmark } from "@/components/Wordmark";

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
    <>
      <ForestBackdrop />

      <main className="on-forest flex flex-1 flex-col px-6 pt-16 pb-12">
        <Wordmark />

        <h1 className="display rise-in mt-14 text-[46px]">
          Everybody plants
          <br />
          a tree.
          <span className="block text-body italic">
            Nobody finds out
            <br />
            what happened to it.
          </span>
        </h1>

        <p className="prose rise-in mt-8 max-w-[24rem] text-body" style={{ animationDelay: "0.1s" }}>
          You plant it, you take the photo, you post it. Then a year of small
          boring jobs decides whether it lives, and nothing is holding you to
          them.
        </p>

        <p
          className="prose rise-in mt-4 max-w-[24rem] text-cream"
          style={{ animationDelay: "0.16s" }}
        >
          Rooted holds you to them, and pays you for it.
        </p>

        <div className="rise-in mt-11 flex flex-col gap-3" style={{ animationDelay: "0.22s" }}>
          <Link
            href="/join"
            className="flex h-[56px] items-center justify-center rounded-full bg-cream text-[15.5px] font-semibold tracking-[0.01em] text-bg"
          >
            Start with one plant
          </Link>
          <Link
            href="/today"
            className="group flex h-[52px] items-center justify-center gap-2 text-[15px] font-medium text-body"
          >
            <span className="border-b border-line pb-0.5">See it working</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <section className="mt-16">
          {STEPS.map((s) => (
            <article key={s.n} className="row flex gap-5">
              <span className="num mt-[7px] shrink-0 text-[13px] text-gold-dim">{s.n}</span>
              <div>
                <h2 className="display text-[23px] leading-snug">{s.title}</h2>
                <p className="mt-1.5 text-[14.5px] leading-[1.7] text-body">{s.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="row mt-4 border-t-0">
          <p className="display text-[27px] leading-[1.22]">
            We reward people for spending money.
          </p>
          <p className="display mt-2 text-[27px] leading-[1.22] text-moss italic">
            Rooted rewards them for keeping something alive.
          </p>
        </section>

        <div className="flex-1" />

        <footer className="mt-16">
          <div className="rule" />
          <p className="mt-6 text-[13.5px] leading-[1.75] text-faint">
            Care schedules follow live local weather. Every completed job is
            verified against where the plant was registered, when the photo was
            taken, and the plant&apos;s own first photograph.
          </p>
          <p className="label mt-6">NextStep Hacks 2026 &middot; Earth Forward</p>
        </footer>
      </main>
    </>
  );
}
