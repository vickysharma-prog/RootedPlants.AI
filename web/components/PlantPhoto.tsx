import Image from "next/image";

/**
 * A plant, as a photograph.
 *
 * People know their plants by sight and not by name, so the picture is the
 * identifier and the name is the caption. The hairline inset keeps the edge
 * crisp against a light card, which a plain rounded crop does not do.
 */
export function PlantPhoto({
  src,
  alt,
  size = 64,
  radius = 16,
  priority = false,
}: {
  src: string;
  alt: string;
  size?: number;
  radius?: number;
  priority?: boolean;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Image
        src={src}
        alt={alt}
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="h-full w-full object-cover"
      />
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.09)",
        }}
      />
    </div>
  );
}

/** The same photograph filling whatever box it is given. */
export function PlantCover({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="430px"
      priority={priority}
      className="object-cover"
    />
  );
}
