import Image from "next/image";

/**
 * A plant, as a photograph.
 *
 * People know their plants by sight and not by name, so the picture is the
 * identifier and the name is the caption. On a dark page a bright crop shouts,
 * so the photograph is sunk slightly and edged with a hairline: present, not
 * competing with the type.
 */
export function PlantPhoto({
  src,
  alt,
  size = 62,
  radius = 14,
  priority = false,
  dim = false,
}: {
  src: string;
  alt: string;
  size?: number;
  radius?: number;
  priority?: boolean;
  dim?: boolean;
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
        style={{ filter: dim ? "saturate(0.7) brightness(0.72)" : "saturate(0.92) brightness(0.9)" }}
      />
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          boxShadow: "inset 0 0 0 1px rgba(237,233,222,0.13)",
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
      style={{ filter: "saturate(0.9) brightness(0.82)" }}
    />
  );
}
