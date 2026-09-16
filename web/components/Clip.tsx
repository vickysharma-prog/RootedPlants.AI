/**
 * A clip that sits in the page rather than on it.
 *
 * A bright rectangle with a hairline around it reads as a card pasted onto
 * the page. So there is no hairline, the footage is taken down towards the
 * page's own light, and its four edges are feathered into the background
 * colour. What is left is a window, not a frame.
 *
 * Muted, looping, no controls: a photograph that moves, not a video somebody
 * has to operate. The poster frame paints first so the block never opens as a
 * hole, and it is inert to a screen reader because the words beside it say
 * what it shows.
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
    <div className={`relative overflow-hidden rounded-[22px] ${className}`} style={{ aspectRatio: ratio }}>
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
        style={{ filter: "saturate(0.72) brightness(0.62) contrast(1.04)" }}
      />

      {/* The edges dissolve into the page instead of stopping against it. */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(10,15,11,0.92) 0%, rgba(10,15,11,0) 22%, rgba(10,15,11,0) 74%, rgba(10,15,11,0.96) 100%)",
            "linear-gradient(to right, rgba(10,15,11,0.9) 0%, rgba(10,15,11,0) 16%, rgba(10,15,11,0) 84%, rgba(10,15,11,0.9) 100%)",
          ].join(", "),
        }}
      />

      {/* A hint of the page's own green over the top, so the footage belongs
          to this world rather than being borrowed from another one. */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(18, 34, 22, 0.28)" }}
      />
    </div>
  );
}
