"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The moment the work turns into points.
 *
 * This is the only place in the app that raises its voice, and it earns it:
 * somebody just walked outside, watered a plant, photographed it and had four
 * checks agree. The card rises, the number lands, and leaves drift up past it.
 *
 * Leaves rather than confetti. Confetti belongs to a different product, and
 * this one has spent every other screen being a forest at dusk. The celebration
 * should feel like the same place, just briefly pleased with you.
 *
 * They cross the whole screen rather than the card. Inside the card they were
 * tasteful and easy to miss, and the one thing this moment has to do is leave
 * nobody wondering whether the points arrived.
 *
 * Under prefers-reduced-motion nothing moves: the card is simply there, the
 * number is simply its final value, and nothing drifts.
 */

type Leaf = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  spin: number;
  tone: string;
};

const TONES = ["var(--moss)", "var(--moss-deep)", "var(--gold)", "var(--verified)"];

export function Celebration({
  points,
  code,
  title,
  line,
  children,
}: {
  /** Points earned. Counts up from zero. */
  points?: number;
  /** A redemption code, shown instead of a number. */
  code?: string;
  title: string;
  line: string;
  children?: React.ReactNode;
}) {
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const leaves = useMemo<Leaf[]>(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: 2 + (i * 96) / 34 + Math.random() * 4,
        delay: Math.random() * 1.3,
        duration: 4 + Math.random() * 2.6,
        drift: (Math.random() - 0.5) * 140,
        size: 8 + Math.random() * 10,
        spin: (Math.random() - 0.5) * 620,
        tone: TONES[i % TONES.length],
      })),
    [],
  );

  return (
    <div className="relative">
      {!still && (
        <div
          className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
          aria-hidden
        >
          {leaves.map((l, i) => (
            <span
              key={i}
              className="leaf"
              style={
                {
                  left: `${l.left}%`,
                  width: l.size,
                  height: l.size * 1.5,
                  background: l.tone,
                  animationDelay: `${l.delay}s`,
                  animationDuration: `${l.duration}s`,
                  "--drift": `${l.drift}px`,
                  "--spin": `${l.spin}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className={still ? "" : "lift"}>
        <div className="rule" />
        <p className="label mt-6" style={{ color: "var(--verified)" }}>
          {title}
        </p>
        {!code && <p className="mt-2 text-[15px] text-body">Points received</p>}
        {code ? (
          <p className="num mt-3 text-[34px] leading-none text-cream">{code}</p>
        ) : (
          <p className="num mt-2 text-[58px] leading-none text-gold">
            +<Counter to={points ?? 0} still={still} />
          </p>
        )}
        <p className="mt-3 text-[15px] text-body">{line}</p>
        {children}
      </div>

      <style>{`
        .leaf {
          position: absolute;
          bottom: -30px;
          border-radius: 60% 8% 60% 8%;
          opacity: 0;
          animation-name: leaf-rise;
          animation-timing-function: cubic-bezier(0.22, 0.7, 0.3, 1);
          animation-fill-mode: forwards;
        }
        @keyframes leaf-rise {
          0%   { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
          12%  { opacity: 0.85; }
          78%  { opacity: 0.6; }
          100% { opacity: 0; transform: translate3d(var(--drift), -105vh, 0) rotate(var(--spin)); }
        }
        .lift {
          animation: lift-in 0.72s cubic-bezier(0.2, 0.8, 0.25, 1) both;
        }
        @keyframes lift-in {
          from { opacity: 0; transform: translateY(26px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .leaf { display: none; }
          .lift { animation: none; }
        }
      `}</style>
    </div>
  );
}

/** Points that land rather than appear. */
function Counter({ to, still }: { to: number; still: boolean }) {
  const [n, setN] = useState(still ? to : 0);
  const started = useRef(0);

  useEffect(() => {
    if (still) return setN(to);
    let frame = 0;
    const step = (t: number) => {
      if (!started.current) started.current = t;
      const k = Math.min(1, (t - started.current) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, still]);

  return <>{n}</>;
}
