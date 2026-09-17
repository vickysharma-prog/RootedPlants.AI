"use client";

import { useCallback, useEffect, useState } from "react";
import { buildSchedule, type Task } from "./schedule";
import { FALLBACK, type Weather } from "./weather";
import { balance, ledger, plants, seedIfEmpty, type LedgerEntry, type StoredPlant } from "./store";

/**
 * The app's living state, read once and re-read whenever it changes.
 *
 * Every screen inside the app asks this rather than reaching into the store on
 * its own, so a verified task updates the plant, the points and the day's list
 * in one move instead of three screens disagreeing about what just happened.
 */

const cache = new Map<string, Weather>();

async function weatherFor(list: StoredPlant[]): Promise<Map<string, Weather>> {
  const out = new Map<string, Weather>();
  await Promise.all(
    list.map(async (p) => {
      const key = `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;
      if (!cache.has(key)) {
        try {
          const r = await fetch(`/api/weather?lat=${p.lat}&lon=${p.lon}`);
          cache.set(key, r.ok ? await r.json() : FALLBACK);
        } catch {
          cache.set(key, FALLBACK);
        }
      }
      out.set(p.id, cache.get(key)!);
    }),
  );
  return out;
}

export type Live = {
  ready: boolean;
  plants: StoredPlant[];
  due: Task[];
  next: Task[];
  points: number;
  history: LedgerEntry[];
  reload: () => void;
};

export function useRooted(offset: number): Live {
  const [state, setState] = useState<Omit<Live, "reload">>({
    ready: false,
    plants: [],
    due: [],
    next: [],
    points: 0,
    history: [],
  });

  const load = useCallback(async () => {
    await seedIfEmpty();
    const list = await plants();
    const w = await weatherFor(list);
    const { due, next } = buildSchedule(list, (p) => w.get(p.id) ?? FALLBACK, offset);
    setState({
      ready: true,
      plants: list,
      due,
      next,
      points: await balance(),
      history: await ledger(),
    });

    // Fire and forget. A reminder that cannot be registered is worth one
    // console-free failure, never a screen that will not load.
    void pushSchedule(due, next);
  }, [offset]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/**
 * Tell the server what is coming up, so a reminder can arrive without the app.
 *
 * Sent after the schedule is worked out, which is the only moment it is known.
 * It carries names and dates and nothing else: no photographs, no coordinates,
 * no points. If there is no store configured the call simply reports that and
 * nothing is kept.
 */
export async function pushSchedule(due: Task[], next: Task[]) {
  const channels = readChannels();
  const rows = [...due, ...next].slice(0, 12).map((t) => ({
    plant: t.plant.name,
    task: t.label,
    dueAt: new Date(Date.now() + t.dueIn * 86_400_000).toISOString(),
    why: t.why,
  }));

  try {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channels, due: rows }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** The channels this person left switched on, as the account screen set them. */
export function readChannels(): string[] {
  try {
    const raw = localStorage.getItem("rooted_channels");
    const on = raw ? (JSON.parse(raw) as Record<string, boolean>) : null;
    if (!on) return ["email", "whatsapp", "sms"];
    return Object.entries(on)
      .filter(([, v]) => v)
      .map(([k]) => k);
  } catch {
    return ["email", "whatsapp", "sms"];
  }
}

/** The streak the header shows: the longest run any plant is currently on. */
export function topStreak(list: StoredPlant[]): number {
  return list.reduce((n, p) => Math.max(n, p.streak), 0);
}
