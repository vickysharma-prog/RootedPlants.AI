/**
 * The wordmark, with a mark that grows itself.
 *
 * A seedling draws out of the ground: the stem first, then one leaf, then the
 * other, then the roots below the line. It holds, then starts again. Stroke
 * drawing rather than bars, because bars were the sound control's job and two
 * things on one screen should never share a gesture.
 *
 * The roots are the part worth keeping. The name is Rooted, and the half of a
 * plant that decides whether it lives is the half nobody draws.
 */
export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <span className="display text-[21px] tracking-[-0.01em]">Rooted</span>

      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        className="seedling"
        aria-hidden
      >
        {/* the ground */}
        <path
          className="s-ground"
          d="M4 19h24"
          stroke="var(--line)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* stem */}
        <path
          className="s-stem"
          d="M16 19V7.5"
          stroke="var(--moss)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        {/* leaves */}
        <path
          className="s-leaf s-leaf-a"
          d="M16 12.5c-4.6 0-7-2.2-7-6 4 0 7 2 7 6z"
          fill="var(--moss)"
        />
        <path
          className="s-leaf s-leaf-b"
          d="M16 9.5c4 0 6.2-2 6.2-5.3-3.5 0-6.2 1.9-6.2 5.3z"
          fill="var(--moss-deep)"
        />

        {/* roots */}
        <path
          className="s-root s-root-a"
          d="M16 19c0 3-1.6 4.8-4.4 6"
          stroke="var(--gold)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          className="s-root s-root-b"
          d="M16 19c0 3.6 1.4 5.6 4 7"
          stroke="var(--gold)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          className="s-root s-root-c"
          d="M16 19v8"
          stroke="var(--gold)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>

      <style>{`
        /* One cycle: stem, leaves, roots, hold, clear. */
        .seedling { overflow: visible; }

        .s-stem {
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
          animation: draw-stem 7s ease-in-out infinite;
        }

        .s-leaf {
          transform-box: fill-box;
          transform-origin: left bottom;
          transform: scale(0);
          animation: unfurl 7s cubic-bezier(0.3, 0.9, 0.35, 1) infinite;
        }
        .s-leaf-b { transform-origin: right bottom; }
        .s-leaf-a { animation-delay: 0.55s; }
        .s-leaf-b { animation-delay: 0.95s; }

        .s-root {
          stroke-dasharray: 10;
          stroke-dashoffset: 10;
          opacity: 0.85;
          animation: draw-root 7s ease-out infinite;
        }
        .s-root-a { animation-delay: 1.15s; }
        .s-root-c { animation-delay: 1.3s; }
        .s-root-b { animation-delay: 1.45s; }

        @keyframes draw-stem {
          0%   { stroke-dashoffset: 12; }
          14%  { stroke-dashoffset: 0; }
          82%  { stroke-dashoffset: 0; opacity: 1; }
          92%  { stroke-dashoffset: 0; opacity: 0; }
          93%  { stroke-dashoffset: 12; opacity: 0; }
          100% { stroke-dashoffset: 12; opacity: 1; }
        }

        @keyframes unfurl {
          0%   { transform: scale(0) rotate(-12deg); }
          12%  { transform: scale(1) rotate(0deg); }
          82%  { transform: scale(1); opacity: 1; }
          92%  { transform: scale(1); opacity: 0; }
          93%  { transform: scale(0); opacity: 0; }
          100% { transform: scale(0); opacity: 1; }
        }

        @keyframes draw-root {
          0%   { stroke-dashoffset: 10; }
          16%  { stroke-dashoffset: 0; }
          82%  { stroke-dashoffset: 0; opacity: 0.85; }
          92%  { stroke-dashoffset: 0; opacity: 0; }
          93%  { stroke-dashoffset: 10; opacity: 0; }
          100% { stroke-dashoffset: 10; opacity: 0.85; }
        }

        @media (prefers-reduced-motion: reduce) {
          .s-stem, .s-leaf, .s-root { animation: none; }
          .s-stem, .s-root { stroke-dashoffset: 0; }
          .s-leaf { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
