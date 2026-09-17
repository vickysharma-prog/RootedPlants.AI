"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { useRooted, topStreak, pushSchedule } from "@/lib/live";
import { ACTION } from "./AppShell";

const CHANNELS = [
  { key: "sms", label: "Text message", note: "The one that arrives whether or not the app is open." },
  { key: "whatsapp", label: "WhatsApp", note: "Same reminder, where most people already are." },
  { key: "email", label: "Email", note: "A weekly summary rather than each task." },
] as const;

/**
 * You, and how the app reaches you.
 *
 * The channels are the product, not a settings page. An app whose premise is
 * that people forget cannot wait to be opened, so the reminder has to go to
 * where somebody already is. All three are on by default and each can be
 * turned off on its own.
 */
export function MeBoard({
  name,
  email,
  mobile,
  joined,
  offset,
  signOut,
}: {
  name: string;
  email: string;
  mobile: string;
  joined: string;
  offset: number;
  signOut: React.ReactNode;
}) {
  const { ready: loaded, plants, points, history, due, next } = useRooted(offset);
  const [on, setOn] = useState<Record<string, boolean>>({ sms: true, whatsapp: true, email: true });
  const [ready, setReady] = useState<{ store: boolean; channels: Record<string, boolean> } | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Array<{ channel: string; ok: boolean; detail: string }>>([]);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => (r.ok ? r.json() : null))
      .then(setReady)
      .catch(() => setReady(null));
  }, []);

  /**
   * The morning clock is the real behaviour. Nobody is going to wait until
   * tomorrow in the middle of a demo to see it, so this sends the same message
   * through the same code, now.
   */
  async function sendNow() {
    setSending(true);
    setSent([]);
    const task = due[0] ?? next[0];
    try {
      const res = await fetch("/api/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channels: Object.entries(on).filter(([, v]) => v).map(([k]) => k),
          plant: task?.plant.name,
          task: task?.label,
          why: task?.why,
          dueIn: task?.dueIn,
        }),
      });
      const data = await res.json();
      setSent(Array.isArray(data.sent) ? data.sent : []);
    } catch {
      setSent([{ channel: "email", ok: false, detail: "Could not reach the server." }]);
    }
    setSending(false);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rooted_channels");
      if (raw) setOn(JSON.parse(raw));
    } catch {
      // A browser that will not keep preferences still gets all three.
    }
  }, []);

  function toggle(key: string) {
    setOn((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("rooted_channels", JSON.stringify(updated));
      } catch {}
      // The server keeps its own copy, so switching a channel off here has to
      // reach it or the clock will keep using the old answer.
      void pushSchedule(due, next);
      return updated;
    });
  }

  const verified = history.filter((e) => e.points > 0 && e.kind !== "bonus").length;

  return (
    <AppShell active="/me">
      <header className="app-column pt-10 pb-8">
        <p className="label">Since {joined}</p>
        <h1 className="display h-sub mt-2">{name}</h1>
        <p className="mt-3 text-[14.5px] text-faint">
          {email} · {mobile}
        </p>
      </header>

      <main className="app-column flex flex-1 flex-col pb-6">
        <dl className="grid grid-cols-4 gap-4">
          <Stat label="Plants" value={loaded ? plants.filter((p) => !p.lostOn).length : 0} />
          <Stat label="Verified" value={verified} />
          <Stat label="Streak" value={loaded ? topStreak(plants) : 0} />
          <Stat label="Points" value={loaded ? points : 0} />
        </dl>

        <section className="mt-12">
          <p className="label">Where reminders reach you</p>
          <p className="mt-3 max-w-[27rem] text-[14px] leading-relaxed text-body">
            A plant does not wait for you to remember it, so neither does this. The same
            reminder goes out on every channel you leave on.
          </p>

          <div className="mt-5">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => toggle(c.key)}
                aria-pressed={on[c.key]}
                className="row flex w-full items-center justify-between gap-5 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-[15.5px] text-cream">
                    {c.label}
                    {ready && !ready.channels?.[c.key] && (
                      <span className="label ml-2.5" style={{ color: "var(--gold)" }}>
                        not connected
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-faint">{c.note}</span>
                </span>
                <span
                  className="relative h-[26px] w-[46px] shrink-0 rounded-full transition"
                  style={{ background: on[c.key] ? "var(--moss-deep)" : "var(--line)" }}
                >
                  <span
                    className="absolute top-[3px] h-5 w-5 rounded-full transition-all duration-300"
                    style={{
                      left: on[c.key] ? 23 : 3,
                      background: on[c.key] ? "var(--cream)" : "var(--faint)",
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="rule" />
          <p className="mt-6 max-w-[27rem] text-[14px] leading-relaxed text-faint">
            {ready?.store
              ? "Your next few tasks are registered with the reminder service, so one arrives whether or not you open this."
              : "Reminders are not connected on this deployment yet, so nothing is being sent or stored."}
          </p>

          <button
            className={`${ACTION} mt-6 w-full`}
            type="button"
            onClick={sendNow}
            disabled={sending}
          >
            <span className="btn-label">{sending ? "Sending" : "Send me one now"}</span>
            <span className="btn-arrow" aria-hidden>
              →
            </span>
          </button>

          {sent.length > 0 && (
            <ul className="rise-in mt-6">
              {sent.map((r) => (
                <li key={r.channel} className="row flex items-start gap-3.5 py-3">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={r.ok ? "var(--verified)" : "var(--overdue)"}
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                    aria-hidden
                  >
                    {r.ok ? <path d="M4 12.5l5.2 5.2L20 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
                  </svg>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] capitalize text-cream">{r.channel}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-faint">
                      {r.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <p className="label">Your photographs</p>
          <p className="mt-3 max-w-[27rem] text-[14px] leading-relaxed text-body">
            Every photograph you have taken is on this device and has never been sent
            anywhere. Anywhere a plant appears publicly it appears in an area, never at an
            address.
          </p>
        </section>

        <section className="mt-12">
          <div className="rule" />
          <nav className="mt-6 flex flex-col items-start gap-4">
            <Link href="/how-it-works" className="link-arrow inline-flex text-body">
              <span className="link-text">How the checking works</span>
            </Link>
            <Link href="/privacy" className="link-arrow inline-flex text-body">
              <span className="link-text">Privacy</span>
            </Link>
            <Link href="/accessibility" className="link-arrow inline-flex text-body">
              <span className="link-text">Accessibility</span>
            </Link>
          </nav>
          <div className="mt-8">{signOut}</div>
        </section>
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="label text-faint">{label}</dt>
      <dd className="num mt-1.5 text-[24px] text-cream">{value.toLocaleString()}</dd>
    </div>
  );
}
