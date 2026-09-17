"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Forest sound, on a tap.
 *
 * Browsers will not play audio until somebody asks for it, and that is the
 * right rule: nobody wants a page that starts making noise at them. So this
 * is an offer, not a surprise. It fades in rather than cutting in, loops, and
 * remembers nothing between visits.
 *
 * The bars move while it plays, so the control shows its own state without a
 * label. Recording of wind through trees, CC0.
 *
 * It runs through a gain node rather than the element's own volume, because
 * that volume stops at 1 and the recording itself is quiet. Wind through trees
 * is a quiet thing, so the file is faithful and too faint to hear over a room.
 * The gain lifts it past what the element alone can do.
 */
export function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = new Audio("/audio/forest.mp3");
    el.loop = true;
    el.volume = 1;
    el.preload = "none";
    el.crossOrigin = "anonymous";
    audioRef.current = el;
    setReady(true);
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, []);

  /** Built on the first tap, because a context made before one stays suspended. */
  function gain() {
    if (gainRef.current) return gainRef.current;
    const el = audioRef.current;
    if (!el) return null;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const node = ctx.createGain();
      node.gain.value = 0;
      ctx.createMediaElementSource(el).connect(node);
      node.connect(ctx.destination);
      gainRef.current = node;
      return node;
    } catch {
      // No Web Audio. The element's own volume still works, just quieter.
      return null;
    }
  }

  // Fade rather than cut, in both directions. A hard start reads as a mistake.
  function fade(to: number, then?: () => void) {
    const el = audioRef.current;
    if (!el) return;
    const node = gainRef.current;
    const from = node ? node.gain.value : el.volume;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const v = from + (to - from) * k;
      if (node) node.gain.value = v;
      else el.volume = Math.min(1, v);
      if (k < 1) requestAnimationFrame(step);
      else then?.();
    };
    requestAnimationFrame(step);
  }

  /** Loud enough to sit under a room, not loud enough to make anybody jump. */
  const LEVEL = 2.6;

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;

    if (on) {
      fade(0, () => el.pause());
      setOn(false);
      return;
    }

    try {
      const node = gain();
      if (node) node.gain.value = 0;
      else el.volume = 0;
      await el.play();
      fade(node ? LEVEL : 1);
      setOn(true);
    } catch {
      // Autoplay refused or the file is unavailable. The page is unaffected.
      setOn(false);
    }
  }

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn forest sound off" : "Turn forest sound on"}
      className="group flex items-center gap-2.5 text-left"
    >
      <span className="flex h-5 items-end gap-[3px]" aria-hidden>
        {[8, 14, 11, 17, 9].map((h, i) => (
          <span
            key={i}
            className={on ? "sound-bar" : ""}
            style={{
              display: "block",
              width: 2,
              height: h,
              borderRadius: 999,
              background: on ? "var(--moss)" : "var(--faint)",
              animationDelay: `${i * 0.13}s`,
              transform: on ? undefined : "scaleY(0.4)",
              transformOrigin: "bottom",
              transition: "transform .3s, background .3s",
            }}
          />
        ))}
      </span>
      <span
        className="label"
        style={{ color: on ? "var(--moss)" : "var(--faint)", transition: "color .3s" }}
      >
        {on ? "Sound on" : "Sound"}
      </span>

      <style>{`
        .sound-bar {
          animation: sound-bar 1.5s ease-in-out infinite;
        }
        @keyframes sound-bar {
          0%, 100% { transform: scaleY(0.38); }
          50% { transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sound-bar { animation: none; }
        }
      `}</style>
    </button>
  );
}
