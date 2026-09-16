/**
 * Real forest, moving, behind everything.
 *
 * Three shots, one per kind of page, so moving through the site is moving
 * through a place rather than past the same picture again. Each is a short
 * loop, muted, held well back under a heavy veil: atmosphere, not a video
 * playing at you. Leaf shadow drifts across on top and dust rises through it.
 *
 * A poster frame paints immediately, so the page is never a black rectangle
 * while the video loads, and the poster alone is a perfectly good background
 * if the video never arrives.
 *
 * Pexels licence, no attribution required. Recorded in public/video/sources.json.
 */

const SCENES = {
  /** Dense green, camera moving through it. The landing. */
  jungle: { src: "/video/jungle.mp4", poster: "/video/jungle-poster.jpg" },
  /** Looking up through tall trunks. Sign up. */
  trunks: { src: "/video/trunks.mp4", poster: "/video/trunks-poster.jpg" },
  /** Drifting above the canopy. The written pages. */
  canopy: { src: "/video/canopy.mp4", poster: "/video/canopy-poster.jpg" },
} as const;

export type Scene = keyof typeof SCENES;

const MOTES = [
  { x: 14, d: 0, s: 15 },
  { x: 29, d: 4.1, s: 19 },
  { x: 43, d: 8.7, s: 16 },
  { x: 57, d: 2.3, s: 21 },
  { x: 71, d: 11.4, s: 17 },
  { x: 86, d: 6.2, s: 20 },
];

export function ForestBackdrop({ scene = "jungle" }: { scene?: Scene }) {
  const { src, poster } = SCENES[scene];

  return (
    <div className="forest" aria-hidden>
      <video
        className="forest-video"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />

      <div className="forest-dapple" />
      <div className="forest-light" />

      <div className="forest-motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${m.x}%`,
              animationDelay: `${m.d}s`,
              animationDuration: `${m.s}s`,
            }}
          />
        ))}
      </div>

      <div className="forest-veil" />
    </div>
  );
}
