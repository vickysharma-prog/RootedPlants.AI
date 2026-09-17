"use client";

import { useEffect, useState } from "react";
import type { Check } from "@/lib/verify";

/**
 * Checks, arriving at reading speed.
 *
 * A wall of ticks appearing at once is a logo. One line landing after another
 * is somebody showing their working, and the working is the point: every line
 * names what it measured. Registering a plant and proving a task both use
 * this, because a photograph that does not hold up is a photograph that does
 * not hold up, and the app should say so the same way wherever it happens.
 */
export function CheckList({
  checks,
  onDone,
}: {
  checks: Check[];
  /** Called once every line is on screen, so nothing concludes early. */
  onDone?: () => void;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
  }, [checks]);

  useEffect(() => {
    if (shown >= checks.length) {
      if (checks.length) onDone?.();
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 380 : 580);
    return () => clearTimeout(t);
    // onDone is a callback, not state: including it would restart the stagger
    // every time the parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, checks.length]);

  return (
    <ul className="mt-2">
      {checks.slice(0, shown).map((c) => (
        <li key={c.key} className="row tick-in flex items-start gap-3.5">
          <Mark ok={c.ok} />
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-cream">{c.label}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-faint">{c.reason}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Mark({ ok }: { ok: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ok ? "var(--verified)" : "var(--overdue)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      {ok ? <path d="M4 12.5l5.2 5.2L20 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  );
}
