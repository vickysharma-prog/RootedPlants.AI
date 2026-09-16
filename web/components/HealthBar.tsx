"use client";

import type { Health } from "@/lib/store";

const COLOUR: Record<Health["band"], string> = {
  Thriving: "var(--verified)",
  Steady: "var(--moss-deep)",
  "Watch it": "var(--gold)",
  "At risk": "var(--overdue)",
};

/**
 * How a plant is doing.
 *
 * The bar is care rather than diagnosis: whether the watering has been
 * happening on the schedule this species wants, and how long the run is. The
 * sentence under it says which of those moved the number, so nobody is left
 * looking at a score with no idea what would change it.
 *
 * It deliberately does not read the leaves and tell you the plant is sick. A
 * photograph can show a yellow leaf for a dozen reasons, and a number invented
 * from one is a number that gets trusted and should not be.
 */
export function HealthBar({ health, className = "", big = false }: { health: Health; className?: string; big?: boolean }) {
  const colour = COLOUR[health.band];

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="label"
          style={{ color: colour }}
        >
          {health.band}
        </span>
        <span className="num text-[12px] text-faint">{health.score}</span>
      </div>

      <div
        className="mt-2 w-full overflow-hidden rounded-full"
        style={{ height: big ? 6 : 3, background: "var(--line-soft)" }}
        role="meter"
        aria-valuenow={health.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Care score, ${health.band}`}
      >
        <span
          className="block h-full rounded-full transition-[width] duration-700"
          style={{ width: `${health.score}%`, background: colour }}
        />
      </div>

      {big && <p className="mt-3 text-[14.5px] leading-relaxed text-body">{health.line}</p>}
    </div>
  );
}
