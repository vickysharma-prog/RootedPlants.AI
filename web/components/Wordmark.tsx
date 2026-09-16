/**
 * The wordmark, with a mark that grows.
 *
 * Five strokes rising left to right, each one stretching on its own delay and
 * settling. It is the product in one gesture: something small, kept, getting
 * taller. Small enough to sit beside the name without asking for attention.
 */
export function Wordmark() {
  const bars = [
    { h: 7, d: 0 },
    { h: 11, d: 0.18 },
    { h: 15, d: 0.36 },
    { h: 19, d: 0.54 },
    { h: 13, d: 0.72 },
  ];

  return (
    <div className="flex items-center gap-2.5">
      <span className="display text-[21px] tracking-[-0.01em]">Rooted</span>
      <span className="flex h-5 items-end gap-[3px]" aria-hidden>
        {bars.map((b, i) => (
          <span
            key={i}
            className="grow-bar block w-[2px] rounded-full bg-gold"
            style={{ height: b.h, animationDelay: `${b.d}s` }}
          />
        ))}
      </span>
      <style>{`
        .grow-bar {
          transform-origin: bottom;
          animation: grow-bar 3.4s cubic-bezier(0.34, 0.9, 0.3, 1) infinite;
        }
        @keyframes grow-bar {
          0%, 68%, 100% { transform: scaleY(0.42); opacity: 0.5; }
          22%, 46% { transform: scaleY(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .grow-bar { animation: none; }
        }
      `}</style>
    </div>
  );
}
