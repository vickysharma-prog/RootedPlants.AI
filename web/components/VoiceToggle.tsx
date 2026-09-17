"use client";

import { useEffect, useState } from "react";
import { setVoice, voiceOn } from "@/lib/coach";

/**
 * The one control that silences the guide, wherever it appears.
 *
 * It reads and writes the same preference on every screen, so turning it off
 * once turns it off everywhere, and it stays off next time.
 */
export function VoiceToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    setOn(voiceOn());
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setOn(next);
        setVoice(next);
      }}
      aria-pressed={on}
      aria-label={on ? "Turn the guide's voice off" : "Turn the guide's voice on"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line ${className}`}
      style={{ color: on ? "var(--moss)" : "var(--faint)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5L6 9H3v6h3l5 4V5z" />
        {on ? <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" /> : <path d="M17 9l4 6M21 9l-4 6" />}
      </svg>
    </button>
  );
}
