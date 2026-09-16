import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { SoundToggle } from "@/components/SoundToggle";
import { Clip } from "@/components/Clip";
import type { Scene } from "@/components/ForestBackdrop";

/**
 * The shell every written page shares: the forest behind it, a way back, and
 * a column narrow enough to read comfortably.
 */
export function Page({
  eyebrow,
  title,
  lede,
  scene = "canopy",
  clip,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  scene?: Scene;
  clip?: { src: string; poster: string; ratio?: string; caption: string };
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <ForestBackdrop scene={scene} />

      <header className="on-forest column flex items-center justify-between gap-6 pt-10 pb-2">
        <Link href="/" className="display text-[19px] tracking-[-0.01em]">
          Rooted
        </Link>
        <SoundToggle />
      </header>

      <main className="on-forest column flex flex-1 flex-col pt-14 pb-14">
        <p className="label">{eyebrow}</p>
        <h1 className="display h-sub mt-3 max-w-[18ch]">{title}</h1>
        <p className="prose-lg mt-6 max-w-[34rem] text-body">{lede}</p>

        {clip && (
          <figure className="mt-12 max-w-[34rem]">
            <Clip src={clip.src} poster={clip.poster} ratio={clip.ratio ?? "11 / 7"} />
            <figcaption className="mt-3 text-[13.5px] leading-[1.7] text-faint">
              {clip.caption}
            </figcaption>
          </figure>
        )}

        <div className="mt-14 max-w-[34rem]">{children}</div>

        <div className="flex-1" />

        <footer className="mt-20">
          <div className="rule" />
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[14.5px] text-body"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H6M11 18l-6-6 6-6" />
            </svg>
            Back to Rooted
          </Link>
        </footer>
      </main>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="row">
      <h2 className="display h-row leading-snug">{heading}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-[1.75] text-body">
        {children}
      </div>
    </section>
  );
}
