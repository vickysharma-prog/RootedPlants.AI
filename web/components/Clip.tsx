/**
 * A clip that plays in the page rather than behind it.
 *
 * Muted, looping, no controls: it is a photograph that moves, not a video
 * somebody has to operate. A poster frame paints first so the block never
 * opens as a hole in the page, and the whole thing is inert to a screen
 * reader because the caption beside it says what it shows.
 */
export function Clip({
  src,
  poster,
  ratio = "16 / 9",
  className = "",
}: {
  src: string;
  poster: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <video
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        aria-hidden
        style={{ filter: "saturate(0.92) brightness(0.86) contrast(1.02)" }}
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(237,233,222,0.14)" }}
      />
    </div>
  );
}
