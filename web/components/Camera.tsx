"use client";

import { useEffect, useRef, useState } from "react";
import { fromFile, shrink } from "@/lib/store";

export type Shot = { full: Blob; thumb: Blob; fromCamera: boolean };

/**
 * The viewfinder.
 *
 * The proof photograph is taken here, inside the app, rather than chosen from
 * a gallery. That is the whole reason this component exists instead of a file
 * picker: a frame that arrives straight off the camera cannot be a picture of
 * last week, and the verifier is told which door the photograph came through.
 *
 * The plant's first photograph is laid over the live frame at low opacity, so
 * lining today's shot up with it is something you do by eye in two seconds
 * rather than a rule you are told about afterwards.
 *
 * A camera that will not open is not a dead end. The picker is still there,
 * the photograph is still checked, and the verification card says plainly that
 * this one did not come from the camera.
 */
export function Camera({
  ghost,
  instruction,
  onShot,
}: {
  ghost?: string;
  instruction: string;
  onShot: (shot: Shot) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"opening" | "live" | "closed">("opening");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let dead = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } } })
      .then((s) => {
        if (dead) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
        setState("live");
      })
      .catch(() => !dead && setState("closed"));

    return () => {
      dead = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function press() {
    const v = video.current;
    if (!v || busy) return;
    setBusy(true);
    const { full, thumb } = await shrink(v, v.videoWidth, v.videoHeight);
    onShot({ full, thumb, fromCamera: true });
  }

  async function picked(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    const { full, thumb } = await fromFile(file);
    onShot({ full, thumb, fromCamera: false });
  }

  return (
    <div className="app-column pb-10">
      <p className="prose mt-2 text-[16px] text-cream">{instruction}</p>

      <div
        className="relative mt-6 overflow-hidden rounded-[20px] border border-line bg-bg-lift"
        style={{ aspectRatio: "3 / 4" }}
      >
        <video
          ref={video}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          aria-label="Camera"
        />

        {ghost && state === "live" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ghost}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen"
            aria-hidden
          />
        )}

        {/* A frame to aim inside. Nothing is enforced by it: it is there so
            the shot lines up with the last one without anybody thinking. */}
        <span
          className="pointer-events-none absolute inset-[9%] rounded-[14px] border border-dashed"
          style={{ borderColor: "rgba(237,233,222,0.22)" }}
          aria-hidden
        />

        {state !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="text-[14.5px] leading-relaxed text-body">
              {state === "opening"
                ? "Opening the camera"
                : "Allow the camera to photograph this here, or choose a photo below."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-5">
        <label className="cursor-pointer text-[14px] text-faint underline-offset-4 hover:text-body hover:underline">
          Choose a photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => picked(e.target.files?.[0])}
          />
        </label>

        <button
          type="button"
          onClick={press}
          disabled={state !== "live" || busy}
          aria-label="Take the photograph"
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border transition disabled:opacity-35"
          style={{ borderColor: "var(--moss)" }}
        >
          <span
            className="block h-[56px] w-[56px] rounded-full transition"
            style={{ background: busy ? "var(--moss-deep)" : "var(--cream)" }}
          />
        </button>

        <span className="w-[86px]" />
      </div>
    </div>
  );
}
