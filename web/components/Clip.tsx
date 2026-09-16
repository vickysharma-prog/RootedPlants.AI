/**
 * A clip with no edge.
 *
 * The first attempt feathered the four sides into the page colour. That only
 * works over a flat page, and this one has moving footage behind it, so a
 * dark gradient at the edges was just a dark rectangle drawn over a bright
 * forest. The border people could see was the fade itself.
 *
 * This masks instead. The clip is genuinely transparent towards its edges and
 * the backdrop shows through, so there is no border to notice because there
 * is no edge. No frame, no hairline, no corner: a window cut into the page.
 *
 * Muted, looping, no controls: a photograph that moves, not a video somebody
 * has to operate. The poster paints first so the block never opens as a hole,
 * and it is inert to a screen reader because the words beside it say what it
 * shows.
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
    <div className={`clip relative ${className}`} style={{ aspectRatio: ratio }}>
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
        style={{ filter: "saturate(0.88) brightness(0.84) contrast(1.03)" }}
      />

      {/* A wash of the page's own green, so the footage belongs to this world
          rather than being borrowed from another one. Light: enough to tie it
          to the page, not enough to take the picture away. Inside the mask, so
          it fades out with everything else. */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(18, 34, 22, 0.14)" }}
      />
    </div>
  );
}
