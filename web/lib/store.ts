"use client";

import { SPECIES, POINTS, TASK_LABEL, multiplier, type TaskKind } from "./data";

/**
 * Everything the account owns, on the device.
 *
 * Plants, photographs and the points ledger live in IndexedDB rather than on a
 * server. That is a deliberate choice for what this is: the app works on a
 * phone with no signal, the photographs never leave the device unless somebody
 * asks them to, and there is no account to lose.
 *
 * One module, so the day a server holds this instead, one file changes and no
 * screen does.
 */

const DB = "rooted";
// Bumped whenever a stored record gains a field. The upgrade drops what is
// there and lets the seed run again, because a half-migrated plant with a
// missing clock schedules nonsense, and nothing here is precious enough to
// migrate: the photographs a real user has taken are the only thing that
// would be, and this is still before anybody has taken any.
const VERSION = 7;

export type StoredPlant = {
  id: string;
  name: string;
  speciesId: string;
  place: string;
  plantedOn: string;
  lat: number;
  lon: number;
  streak: number;
  points: number;
  /** Day offsets, negative, relative to the app's today. */
  lastWatered: number;
  lastFertilised: number;
  lastCheckin: number;
  lastPest: number;
  /** The photograph every later photograph is measured against. */
  baselinePhotoId: string;
  /** Set when the plant is reported lost. Keeps its record and its points. */
  lostOn?: string;
};

export type StoredPhoto = {
  id: string;
  plantId: string;
  /** ISO. */
  at: string;
  kind: TaskKind | "baseline";
  full: Blob;
  /** 256px copy, kept so verification never loads a full frame. */
  thumb: Blob;
  note?: string;
};

export type LedgerEntry = {
  id: string;
  at: string;
  plantId: string;
  plantName: string;
  kind: TaskKind | "bonus" | "redeem";
  points: number;
  label: string;
};

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of Array.from(db.objectStoreNames)) db.deleteObjectStore(name);
      db.createObjectStore("plants", { keyPath: "id" });
      db.createObjectStore("photos", { keyPath: "id" }).createIndex("plantId", "plantId");
      db.createObjectStore("ledger", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const id = () => crypto.randomUUID();

export const plants = () => run<StoredPlant[]>("plants", "readonly", (s) => s.getAll());
export const getPlant = (k: string) => run<StoredPlant | undefined>("plants", "readonly", (s) => s.get(k));
export const putPlant = (p: StoredPlant) => run<IDBValidKey>("plants", "readwrite", (s) => s.put(p));

export const photo = (k: string) => run<StoredPhoto | undefined>("photos", "readonly", (s) => s.get(k));
export const putPhoto = (p: StoredPhoto) => run<IDBValidKey>("photos", "readwrite", (s) => s.put(p));
export const photosFor = (plantId: string) =>
  run<StoredPhoto[]>("photos", "readonly", (s) => s.index("plantId").getAll(plantId)).then((rows) =>
    rows.sort((a, b) => a.at.localeCompare(b.at)),
  );

/** The most recent frame of each plant, for anywhere that shows a row of them. */
export async function latestPhotos(): Promise<Map<string, StoredPhoto>> {
  const all = await run<StoredPhoto[]>("photos", "readonly", (s) => s.getAll());
  const out = new Map<string, StoredPhoto>();
  for (const p of all.sort((a, b) => a.at.localeCompare(b.at))) out.set(p.plantId, p);
  return out;
}

export const ledger = () =>
  run<LedgerEntry[]>("ledger", "readonly", (s) => s.getAll()).then((rows) =>
    rows.sort((a, b) => b.at.localeCompare(a.at)),
  );
export const addLedger = (e: LedgerEntry) => run<IDBValidKey>("ledger", "readwrite", (s) => s.put(e));

export async function balance(): Promise<number> {
  return (await ledger()).reduce((n, e) => n + e.points, 0);
}

/* ---------------------------------------------------------------- photos */

/**
 * A camera frame becomes two JPEGs: one to keep and one to compare against.
 *
 * A modern phone hands back a 4032px frame weighing several megabytes. Storing
 * one of those per watering fills the device inside a month, and nothing on
 * screen is ever larger than a phone. So it is resized on the way in, once,
 * and the small copy is what verification reads.
 */
export const FULL_EDGE = 1280;
export const THUMB_EDGE = 256;

function draw(source: CanvasImageSource, w: number, h: number, edge: number) {
  const scale = Math.min(1, edge / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d")!.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

function toBlob(c: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => c.toBlob((b) => resolve(b!), "image/jpeg", quality));
}

export async function shrink(source: CanvasImageSource, w: number, h: number) {
  const full = await toBlob(draw(source, w, h, FULL_EDGE), 0.8);
  const thumb = await toBlob(draw(source, w, h, THUMB_EDGE), 0.75);
  return { full, thumb };
}

/** An uploaded file goes through exactly the same door as the camera. */
export async function fromFile(file: File) {
  const bitmap = await createImageBitmap(file);
  const out = await shrink(bitmap, bitmap.width, bitmap.height);
  bitmap.close();
  return out;
}

/* ---------------------------------------------------------------- health */

export type Health = {
  score: number;
  band: "Thriving" | "Steady" | "Watch it" | "At risk";
  line: string;
};

/**
 * Health, measured as care rather than guessed from a photograph.
 *
 * Nothing here pretends to diagnose a plant. What it knows is whether the
 * watering has been happening on the schedule that species wants, and how long
 * it has been since anybody looked. Those are the two things that kill a
 * sapling, and they are both things the app can actually see.
 */
export function health(p: StoredPlant, today: number): Health {
  const s = SPECIES.find((x) => x.id === p.speciesId);
  const want = s?.waterEvery ?? 4;
  const since = today - p.lastWatered;
  const overdue = Math.max(0, since - want);

  let score = 100;
  score -= Math.min(55, overdue * 14);
  score -= Math.max(0, 14 - p.streak) * 1.6;
  score = Math.max(6, Math.round(score));

  if (p.lostOn) return { score: 0, band: "At risk", line: "Reported lost." };
  if (score >= 82)
    return { score, band: "Thriving", line: `Watered on time, ${p.streak} in a row.` };
  if (score >= 62)
    return { score, band: "Steady", line: `On schedule. Next water in ${Math.max(0, want - since)} days.` };
  if (score >= 38)
    return { score, band: "Watch it", line: `Water is ${overdue} ${overdue === 1 ? "day" : "days"} overdue.` };
  return { score, band: "At risk", line: `No water for ${since} days. It wants it every ${want}.` };
}

export function pointsFor(kind: TaskKind, streak: number) {
  return Math.round(POINTS[kind] * multiplier(streak));
}

/* ------------------------------------------------------------ first run */

/**
 * Where this device is, or a sensible place if it will not say.
 *
 * Only ever used to stand the demo plants somewhere real. A person who
 * registers their own plant gives its spot explicitly, in the add flow.
 */
function fix(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    const fallback = { lat: 26.9124, lon: 75.7873 };
    if (!navigator.geolocation) return resolve(fallback);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(fallback),
      { timeout: 6000, maximumAge: 600_000 },
    );
  });
}

/**
 * A new account starts with the demo plants, so the app is never an empty
 * room and anybody following the demo link lands in a working account rather
 * than on an invitation to set one up.
 *
 * Each of them arrives with a photo history: a first photograph and two taken
 * since. Without it a plant's page is a heading over nothing, and the first
 * proof photo has no baseline to be measured against, which is the one thing
 * this app is supposed to be able to do.
 */
export async function seedIfEmpty() {
  if ((await plants()).length) return;

  // The demo plants stand wherever this device is. They were pinned to one
  // city at first, which meant anybody opening the demo anywhere else failed
  // the location check on a plant the app had just handed them, and the
  // check looked broken when it was working perfectly. A few metres apart, so
  // they read as three plants around one home.
  const here = await fix();

  const demo: Omit<StoredPlant, "baselinePhotoId">[] = [
    { id: "neem-1", name: "Neem", speciesId: "neem", place: "backyard", plantedOn: "2026-06-14", lat: here.lat + 0.00018, lon: here.lon + 0.00021, streak: 12, points: 820, lastWatered: -5, lastFertilised: -20, lastCheckin: -30, lastPest: -4 },
    { id: "tulsi-1", name: "Tulsi", speciesId: "tulsi", place: "balcony", plantedOn: "2026-08-02", lat: here.lat - 0.00012, lon: here.lon + 0.00009, streak: 6, points: 310, lastWatered: -2, lastFertilised: -12, lastCheckin: -9, lastPest: -2 },
    { id: "money-1", name: "Money plant", speciesId: "money-plant", place: "living room", plantedOn: "2026-05-20", lat: here.lat + 0.00007, lon: here.lon - 0.00014, streak: 21, points: 1010, lastWatered: -3, lastFertilised: -38, lastCheckin: -40, lastPest: -5 },
    { id: "hibiscus-1", name: "Hibiscus", speciesId: "hibiscus", place: "balcony", plantedOn: "2026-07-09", lat: here.lat - 0.00022, lon: here.lon - 0.00006, streak: 9, points: 430, lastWatered: -1, lastFertilised: -16, lastCheckin: -5, lastPest: -6 },
    { id: "curry-1", name: "Curry leaf", speciesId: "curry-leaf", place: "kitchen window", plantedOn: "2026-04-28", lat: here.lat + 0.00003, lon: here.lon + 0.00026, streak: 15, points: 690, lastWatered: -2, lastFertilised: -21, lastCheckin: -70, lastPest: -7 },
    { id: "aloe-1", name: "Aloe", speciesId: "aloe", place: "windowsill", plantedOn: "2026-03-15", lat: here.lat - 0.00009, lon: here.lon + 0.00017, streak: 28, points: 540, lastWatered: -6, lastFertilised: -60, lastCheckin: -90, lastPest: -9 },
  ];

  const NOTES = ["The day it went in.", "Growing in.", "Latest look."];

  for (const p of demo) {
    const planted = new Date(p.plantedOn + "T09:00:00Z").getTime();
    const span = Math.max(1, Date.now() - planted);
    let baselinePhotoId = "";

    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(`/baselines/${p.id}-${i}.jpg`);
        if (!res.ok) continue;
        const { full, thumb } = await fromFile(new File([await res.blob()], "f.jpg"));
        const photoId = id();
        await putPhoto({
          id: photoId,
          plantId: p.id,
          at: new Date(planted + (span * i) / 2.6).toISOString(),
          kind: i === 0 ? "baseline" : "checkin",
          full,
          thumb,
          note: NOTES[i],
        });
        if (!baselinePhotoId) baselinePhotoId = photoId;
      } catch {
        // A missing frame costs the timeline one entry, never the plant.
      }
    }

    await putPlant({ ...p, baselinePhotoId });
  }

  // Four months of an account that has been running. Without this the profile
  // reads "verified 0" over a plant that is 119 days old, which is the one
  // thing on the screen that would tell somebody it is a mock-up.
  const past: Array<[string, string, TaskKind, number, number]> = [
    ["money-1", "Money plant", "water", 60, 3],
    ["neem-1", "Neem", "water", 52, 8],
    ["money-1", "Money plant", "fertilise", 100, 12],
    ["neem-1", "Neem", "pest", 49, 15],
    ["money-1", "Money plant", "water", 60, 19],
    ["tulsi-1", "Tulsi", "water", 36, 22],
    ["neem-1", "Neem", "water", 52, 26],
    ["tulsi-1", "Tulsi", "checkin", 18, 30],
    ["money-1", "Money plant", "water", 60, 34],
    ["neem-1", "Neem", "fertilise", 70, 41],
    ["money-1", "Money plant", "pest", 70, 48],
    ["neem-1", "Neem", "water", 52, 55],
  ];

  let counted = 0;
  for (const [plantId, plantName, kind, points, daysAgo] of past) {
    counted += points;
    await addLedger({
      id: id(),
      at: new Date(Date.now() - daysAgo * 864e5).toISOString(),
      plantId,
      plantName,
      kind,
      points,
      label: TASK_LABEL[kind],
    });
  }

  await addLedger({
    id: id(),
    at: new Date(Date.now() - 118 * 864e5).toISOString(),
    plantId: "money-1",
    plantName: "Money plant",
    kind: "bonus",
    points: 2140 - counted,
    label: "Carried over from your first weeks",
  });
}
