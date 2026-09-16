/**
 * The wordmark, with five bars that grow.
 *
 * The bars are the same as before. What changed is what they do. A sound
 * meter bounces: every bar moving all the time, never arriving. This one
 * builds. Each bar rises in turn, left to right, to a taller height than the
 * one before it, and then they all hold there while you read the name.
 *
 * That is the difference between a level and a record of something kept. It
 * also stops the mark reading as a second copy of the sound control, which is
 * five bars a few centimetres away that genuinely do bounce.
 */

const BARS = [
  { h: 6, d: 0 },
  { h: 10, d: 0.16 },
  { h: 14, d: 0.32 },
  { h: 18, d: 0.48 },
  { h: 22, d: 0.64 },
];

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="display text-[21px] tracking-[-0.01em]">Rooted</span>

      <span className="flex h-[22px] items-end gap-[3px]" aria-hidden>
        {BARS.map((b, i) => (
          <span
            key={i}
            className="grow-bar block w-[2.5px] rounded-full"
            style={{
              height: b.h,
              animationDelay: `${b.d}s`,
              background: i === BARS.length - 1 ? "var(--moss)" : "var(--gold)",
            }}
          />
        ))}
      </span>

      <style>{`
        /* Grow, hold, clear. Six seconds, and five of them are the hold. */
        .grow-bar {
          transform-origin: bottom;
          transform: scaleY(0);
          animation: grow-bar 6s cubic-bezier(0.22, 0.9, 0.3, 1) infinite;
        }

        @keyframes grow-bar {
          0%   { transform: scaleY(0); opacity: 0; }
          8%   { transform: scaleY(1); opacity: 1; }
          84%  { transform: scaleY(1); opacity: 1; }
          92%  { transform: scaleY(1); opacity: 0; }
          93%  { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(0); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .grow-bar { animation: none; transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
