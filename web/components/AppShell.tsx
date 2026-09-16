import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { ForestBackdrop } from "./ForestBackdrop";

/**
 * The room every screen inside the app sits in.
 *
 * Same forest, same column, same hairlines as the pages outside it. Signing in
 * should feel like walking further into the same building, not like being
 * handed off to a different product, so nothing about the furniture changes at
 * the door.
 */
export function AppShell({
  scene = "canopy",
  active,
  children,
}: {
  scene?: "jungle" | "trunks" | "canopy";
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ForestBackdrop scene={scene} />
      <div className="shell on-forest">
        {children}
        {active && <BottomNav active={active} />}
      </div>
    </>
  );
}

/** A screen that is not a tab: a title, a way back, and room to work. */
export function AppHeader({
  back,
  eyebrow,
  title,
  lede,
  right,
}: {
  back?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="app-column pt-10 pb-7">
      <div className="flex items-center justify-between gap-4">
        {back ? (
          <Link
            href={back}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-body"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>
        ) : (
          <span />
        )}
        {right}
      </div>

      {eyebrow && <p className="label mt-8">{eyebrow}</p>}
      <h1 className="display h-sub mt-2">{title}</h1>
      {lede && <p className="prose mt-4 max-w-[28rem] text-body">{lede}</p>}
    </header>
  );
}
