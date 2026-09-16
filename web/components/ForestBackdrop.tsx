import Image from "next/image";

/**
 * Real forest, moving slowly behind everything.
 *
 * Four photographs, each on a long slow push, cross-fading into the next. The
 * push is the camera moving. On top of it the canopy sways, a fraction of a
 * degree, out of phase per scene, while soft leaf shadow drifts across. With
 * the forest sound on, that is what makes the trees read as moving.
 *
 * Every photograph here is CC0 or public domain. Provenance is recorded in
 * public/forest/sources.json.
 */

const SCENES = [
  { src: "/forest/hero.jpg", alt: "Sunlight through tall forest trunks", move: "push" },
  { src: "/forest/fog.jpg", alt: "Bare trees in heavy fog", move: "drift" },
  { src: "/forest/moss.jpg", alt: "Mossy forest floor under old trees", move: "pull" },
  { src: "/forest/mist.jpg", alt: "Mist hanging in a treeline", move: "drift-back" },
];

const MOTES = [
  { x: 14, d: 0, s: 15 },
  { x: 29, d: 4.1, s: 19 },
  { x: 43, d: 8.7, s: 16 },
  { x: 57, d: 2.3, s: 21 },
  { x: 71, d: 11.4, s: 17 },
  { x: 86, d: 6.2, s: 20 },
];

export function ForestBackdrop() {
  return (
    <div className="forest" aria-hidden>
      {SCENES.map((s, i) => (
        <div key={s.src} className={`scene scene-${i + 1}`}>
          <Image
            src={s.src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            className={`scene-img move-${s.move}`}
          />
        </div>
      ))}

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
