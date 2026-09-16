"use client";

import { useEffect, useRef, useState } from "react";
import { fromFile, shrink } from "@/lib/store";
import { guide, hush, say, type Guide } from "@/lib/coach";
import type { TaskKind } from "@/lib/data";

export type Shot = { full: Blob; thumb: Blob; fromCamera: boolean };

/**
 * The viewfinder, with someone talking you through it.
 *
 * The proof photograph is taken here, inside the app, rather than chosen from
 * a gallery. That is the whole reason this component exists instead of a file
 * picker: a frame that arrives straight off the camera cannot be a picture of
 * last week, and the verifier is told which door the photograph came through.
 *
 * While it is open the app reads the live frame a few times a second and says
 * the one thing that would make this shot pass. Out loud, because the person
 * holding the phone is also holding a watering can and is not reading. The
 * ring around the shutter turns green when there is nothing left to fix, so
 * the same answer is there for anybody who has the sound off.
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
  kind,
  onShot,
}: {
  ghost?: string;
  instruction: string;
  kind: TaskKind;
  onShot: (shot: Shot) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"opening" | "live" | "closed">("opening");
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(true);
  const [tip, setTip] = useState<Guide>({ line: "", ready: false, key: "" });
  const spoken = useRef("");

  useEffect(() => {
    try {
      setVoice(localStorage.getItem("rooted_voice") !== "off");
    } catch {}
  }, []);

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
      hush();
    };
  }, []);

  // Read the frame a few times a second. Often enough that turning the phone
  // gets an answer, slow enough that the voice is not babbling.
  useEffect(() => {
    if (state !== "live") return;
    const tick = setInterval(() => {
      const v = video.current;
      if (!v || v.readyState < 2) return;
      setTip(guide(v, v.videoWidth, v.videoHeight, kind));
    }, 700);
    return () => clearInterval(tick);
  }, [state, kind]);

  useEffect(() => {
    if (!voice || !tip.key || tip.key === spoken.current) return;
    spoken.current = tip.key;
    say(tip.line);
  }, [tip, voice]);

  function toggleVoice() {
    setVoice((on) => {
      const next = !on;
      if (!next) hush();
      spoken.current = "";
      try {
        localStorage.setItem("rooted_voice", next ? "on" : "off");
      } catch {}
      return next;
    });
  }

  async function press() {
    const v = video.current;
    if (!v || busy) return;
    setBusy(true);
    hush();
    const { full, thumb } = await shrink(v, v.videoWidth, v.videoHeight);
    onShot({ full, thumb, fromCamera: true });
  }

  async function picked(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    hush();
    const { full, thumb } = await fromFile(file);
    onShot({ full, thumb, fromCamera: false });
  }

  return (
    <div className="app-column pb-10">
      <div className="flex items-start justify-between gap-5">
        <p className="prose mt-2 max-w-[26rem] text-[16px] text-cream">{instruction}</p>
        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={voice}
          aria-label={voice ? "Turn the guide's voice off" : "Turn the guide's voice on"}
          className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line"
          style={{ color: voice ? "var(--moss)" : "var(--faint)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            {voice ? <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" /> : <path d="M17 9l4 6M21 9l-4 6" />}
          </svg>
        </button>
      </div>

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
          className="pointer-events-none absolute inset-[9%] rounded-[14px] border border-dashed transition-colors duration-500"
          style={{ borderColor: tip.ready ? "rgba(158,201,173,0.55)" : "rgba(237,233,222,0.22)" }}
          aria-hidden
        />

        {state === "live" && tip.line && (
          <p
            className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pt-10 pb-5 text-center text-[16px] font-medium transition-colors duration-300"
            style={{
              color: tip.ready ? "var(--verified)" : "var(--cream)",
              background: "linear-gradient(to top, rgba(6,10,7,0.82), transparent)",
            }}
            aria-live="polite"
          >
            {tip.line}
          </p>
        )}

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
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 transition-colors duration-500 disabled:opacity-35"
          style={{ borderColor: tip.ready ? "var(--moss)" : "var(--line)" }}
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
