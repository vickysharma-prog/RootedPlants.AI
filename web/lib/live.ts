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
  }, [offset]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/** The streak the header shows: the longest run any plant is currently on. */
export function topStreak(list: StoredPlant[]): number {
  return list.reduce((n, p) => Math.max(n, p.streak), 0);
}
