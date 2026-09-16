import {
  PLANTS,
  species,
  pointsFor,
  TASK_LABEL,
  type Plant,
  type TaskKind,
} from "./data";
import { shift, weatherAt, why, type Weather } from "./weather";

export type Task = {
  id: string;
  plant: Plant;
  kind: TaskKind;
  /** Negative when it is overdue. */
  dueIn: number;
  points: number;
  label: string;
  why: string;
  weather: Weather;
};

/**
 * Everything due now, and what is coming next.
 *
 * `offset` is the demo's day counter. A watering due in three days cannot be
 * shown in a five minute video, so the demo moves the day rather than waiting
 * for it.
 */
export async function schedule(offset: number): Promise<{ due: Task[]; next: Task[] }> {
  const tasks = await Promise.all(PLANTS.map((p) => tasksFor(p, offset)));
  const all = tasks.flat().sort((a, b) => a.dueIn - b.dueIn);

  return {
    due: all.filter((t) => t.dueIn <= 0),
    next: all.filter((t) => t.dueIn > 0).slice(0, 2),
  };
}

async function tasksFor(p: Plant, offset: number): Promise<Task[]> {
  const sp = species(p.speciesId);
  const w = await weatherAt(p.lat, p.lon);

  const sinceWater = -Number(p.lastWatered) + offset;
  const sinceFeed = -Number(p.lastFertilised) + offset;

  const waterDueIn = sp.waterEvery + shift(w) - sinceWater;
  const feedDueIn = sp.fertiliseEvery - sinceFeed;

  const out: Task[] = [
    task(p, "water", waterDueIn, why(w, sinceWater), w),
    task(p, "fertilise", feedDueIn, "Last fed " + sinceFeed + " days ago", w),
  ];

  // A young plant gets a check-in in its first month, which is when losing it
  // is most likely and least visible.
  const age = ageInDays(p.plantedOn) + offset;
  if (age < 60 && sinceWater >= 1) {
    out.push(task(p, "checkin", 0, "First month, worth a look", w));
  }

  return out;
}

function task(
  p: Plant,
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
