import { species, pointsFor, TASK_LABEL, type TaskKind } from "./data";
import { shift, why, type Weather } from "./weather";

/**
 * What a plant wants, and when.
 *
 * Nothing here fetches anything. It takes the plants the account owns and the
 * weather over each of them, and returns the work. That keeps it usable on
 * either side of the wire: the browser holds the plants, the server holds the
 * weather, and this decides between them.
 */

export type Schedulable = {
  id: string;
  name: string;
  speciesId: string;
  plantedOn: string;
  lat: number;
  lon: number;
  streak: number;
  lastWatered: number;
  lastFertilised: number;
  lastCheckin: number;
  lastPest: number;
  lostOn?: string;
};

export type Task = {
  id: string;
  plant: Schedulable;
  kind: TaskKind;
  /** Negative when it is overdue. */
  dueIn: number;
  points: number;
  label: string;
  why: string;
  weather: Weather;
};

/**
 * `offset` is the demo's day counter. A watering due in three days cannot be
 * shown in a five minute video, so the demo moves the day rather than waiting
 * for it.
 */
export function buildSchedule(
  plants: Schedulable[],
  weather: (p: Schedulable) => Weather,
  offset: number,
  done: Set<string> = new Set(),
): { due: Task[]; next: Task[] } {
  const all = plants
    .filter((p) => !p.lostOn)
    .flatMap((p) => tasksFor(p, weather(p), offset))
    .filter((t) => !done.has(t.id))
    .sort((a, b) => a.dueIn - b.dueIn);

  return {
    due: all.filter((t) => t.dueIn <= 0),
    next: all.filter((t) => t.dueIn > 0).slice(0, 2),
  };
}

export function tasksFor(p: Schedulable, w: Weather, offset: number): Task[] {
  const sp = species(p.speciesId);

  const sinceWater = -p.lastWatered + offset;
  const sinceFeed = -p.lastFertilised + offset;

  const out: Task[] = [
    task(p, "water", sp.waterEvery + shift(w) - sinceWater, why(w, sinceWater), w),
    task(p, "fertilise", sp.fertiliseEvery - sinceFeed, "Last fed " + sinceFeed + " days ago", w),
  ];

  // A young plant gets a weekly look in its first two months, which is when
  // losing it is most likely and least visible.
  const age = ageInDays(p.plantedOn) + offset;
  if (age < 60) {
    out.push(task(p, "checkin", 7 - (offset - p.lastCheckin), "First weeks, worth a look", w));
  }

  // Pests arrive with warm wet weather, so the look comes round sooner after
  // rain and in the heat. Catching scale early is the difference between
  // wiping leaves and losing a plant.
  const pestEvery = w.rainLast3 >= 3 || w.maxTempToday >= 33 ? 10 : 18;
  out.push(
    task(
      p,
      "pest",
      pestEvery - (offset - p.lastPest),
      pestEvery === 10 ? "Warm and wet, when pests turn up" : "Routine look",
      w,
    ),
  );

  return out;
}

function task(
  p: Schedulable,
  kind: TaskKind,
  dueIn: number,
  reason: string,
  weather: Weather,
): Task {
  return {
    id: `${p.id}-${kind}`,
    plant: p,
    kind,
    dueIn: Math.round(dueIn),
    points: pointsFor(kind, p.streak),
    label: TASK_LABEL[kind],
    why: reason,
    weather,
  };
}

export function ageInDays(plantedOn: string): number {
  const ms = Date.now() - new Date(plantedOn + "T00:00:00Z").getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function dueLabel(dueIn: number): string {
  if (dueIn < -1) return `${-dueIn} days late`;
  if (dueIn === -1) return "1 day late";
  if (dueIn === 0) return "Today";
  if (dueIn === 1) return "Tomorrow";
  return `In ${dueIn} days`;
}
