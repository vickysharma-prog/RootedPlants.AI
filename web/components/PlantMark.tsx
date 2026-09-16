/**
 * Stand-in artwork for a plant's photo.
 *
 * In the app a plant is identified by its own latest photo, because people
 * know their plants by sight and not by name. Until a plant has one, it gets
 * a drawing sized to its age, so the grid still reads at a glance.
 */
export function PlantMark({
  seed,
  size = 52,
  grown = 1,
}: {
  seed: string;
  size?: number;
  grown?: number;
}) {
  const shape = seed.charCodeAt(0) % 3;
  const trunkTop = 48 - 22 * grown;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d={`M32 48V${trunkTop}`}
        stroke="var(--brand-ink)"
        strokeWidth={2.6 + grown}
        strokeLinecap="round"
      />
      {shape === 0 && (
        <>
          <path
            d={`M32 ${trunkTop + 6}c-${7 * grown}-2-${11 * grown}-7-${11 * grown}-13 ${6 * grown} 0 ${11 * grown} 4 ${11 * grown} 13z`}
            fill="var(--brand-ink)"
            opacity="0.9"
          />
          <path
            d={`M32 ${trunkTop + 12}c${7 * grown}-3 ${10 * grown}-8 ${10 * grown}-14-${6 * grown} 0-${10 * grown} 5-${10 * grown} 14z`}
            fill="var(--brand)"
            opacity="0.75"
          />
        </>
      )}
      {shape === 1 && (
        <>
          <circle cx="25" cy={trunkTop + 2} r={5 * grown} fill="var(--brand-ink)" opacity="0.9" />
          <circle cx="39" cy={trunkTop} r={4.4 * grown} fill="var(--brand)" opacity="0.75" />
          <circle cx="32" cy={trunkTop - 6} r={4.8 * grown} fill="var(--brand-ink)" opacity="0.85" />
        </>
      )}
      {shape === 2 && (
        <path
          d={`M32 ${trunkTop + 4}c-${9 * grown} 0-${14 * grown}-5-${14 * grown}-12 ${8 * grown} 0 ${14 * grown} 4 ${14 * grown} 12z`}
          fill="var(--brand-ink)"
          opacity="0.9"
        />
      )}
      <path d="M22 48h20l-2.5 12h-15z" fill="var(--soil)" />
      <path d="M24 50h16l-.6 3H24.6z" fill="#000" opacity="0.18" />
    </svg>
  );
}

export function PlantThumb({
  seed,
  grown = 1,
  size = 64,
}: {
  seed: string;
  grown?: number;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-end justify-center overflow-hidden rounded-2xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(160deg, var(--brand-tint), var(--sand))",
      }}
    >
      <PlantMark seed={seed} size={size * 0.82} grown={grown} />
    </div>
  );
}
