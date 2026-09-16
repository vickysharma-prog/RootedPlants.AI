"use client";

import { useEffect, useState } from "react";

/**
 * A photograph that lives on the device.
 *
 * These never came from a URL, so there is nothing for next/image to optimise
 * and no server that has ever seen them. The object URL is made when the frame
 * goes on screen and released when it leaves, because a page of thumbnails
 * that forgets to do that holds every photograph in memory until the tab dies.
 */
export function BlobImage({
  blob,
  alt,
  className = "",
  style,
}: {
  blob?: Blob;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  if (!url)
    return <span className={className} style={{ background: "var(--surface)", ...style }} aria-hidden />;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} style={style} />;
}
