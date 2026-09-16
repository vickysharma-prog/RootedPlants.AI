"use client";

import type { TaskKind } from "./data";

/**
 * The checks.
 *
 * This is the part of Rooted that has to be real, because the whole promise is
 * that points come from work that actually happened. Every check below is a
 * measurement on the photograph or on something the device can prove, and
 * every one of them reports the number it measured. None of them guess at
 * anything they did not see, and none of them claim more than they checked:
 * a location match says the photograph came from the right spot, not that it
 * is the right plant, because that is all a coordinate can know.
 */

export type Check = {
  key: string;
  label: string;
  /** What it actually measured, in the user's words. */
  reason: string;
  ok: boolean;
};

export type Verdict = {
  checks: Check[];
  passed: boolean;
};

/* ------------------------------------------------------------- pixel work */

async function pixels(blob: Blob, edge: number) {
  const bitmap = await createImageBitmap(blob);
  const c = document.createElement("canvas");
  c.width = edge;
  c.height = edge;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, edge, edge);
  bitmap.close();
  return ctx.getImageData(0, 0, edge, edge);
}

const luma = (d: Uint8ClampedArray, i: number) =>
  (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

/** Mean brightness of a rectangle given in fractions of the frame. */
function region(img: ImageData, x0: number, y0: number, x1: number, y1: number) {
  const { width: w, height: h, data } = img;
  let sum = 0;
  let n = 0;
  for (let y = Math.floor(y0 * h); y < Math.floor(y1 * h); y++)
    for (let x = Math.floor(x0 * w); x < Math.floor(x1 * w); x++) {
      sum += luma(data, (y * w + x) * 4);
      n++;
    }
  return n ? sum / n : 0;
}

/**
 * Average step between neighbouring pixels: how much fine detail is present.
 *
 * Used for one thing only, to say whether a close-up is sharp enough that
 * something the size of an aphid would be visible in it. It is not reported as
 * a focus measurement, because it is not one.
 */
function detail(img: ImageData) {
  const { width: w, height: h, data } = img;
  let sum = 0;
  let n = 0;
  for (let y = 1; y < h; y++)
    for (let x = 1; x < w; x++) {
      const i = (y * w + x) * 4;
      sum += Math.abs(luma(data, i) - luma(data, i - 4));
      n++;
    }
  return sum / n;
}

/** Fraction of the frame where green leads both other channels clearly. */
function greenness(img: ImageData) {
  const d = img.data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i + 1] > d[i] * 1.06 && d[i + 1] > d[i + 2] * 1.06) n++;
  return n / (d.length / 4);
}

/**
 * How much of the frame is arranged the way the baseline was.
 *
 * The frame is cut into an 8 by 8 grid and the brightness of each cell is
 * compared. A hash at this size cannot tell two plants apart, so this is never
 * reported as identity. It is reported as framing: whether the camera is
 * pointed at the same thing from roughly the same place, which is what makes
 * the soil comparison below meaningful at all.
 */
function framing(a: ImageData, b: ImageData) {
  const cells: number[][] = [[], []];
  for (const [k, img] of [a, b].entries())
    for (let gy = 0; gy < 8; gy++)
      for (let gx = 0; gx < 8; gx++)
        cells[k].push(region(img, gx / 8, gy / 8, (gx + 1) / 8, (gy + 1) / 8));

  const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
  const [ma, mb] = [mean(cells[0]), mean(cells[1])];
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < 64; i++) {
    const x = cells[0][i] - ma;
    const y = cells[1][i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

/* ------------------------------------------------------------- distance */

export function metresApart(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/* --------------------------------------------------------------- the run */

export type Evidence = {
  kind: TaskKind;
  /** The shot just taken, 256px. */
  thumb: Blob;
  /** That plant's first photograph, 256px. Absent on a plant's first proof. */
  baseline?: Blob;
  /** Straight from the camera stream, never a file the user chose. */
  fromCamera: boolean;
  here?: { lat: number; lon: number; accuracy: number };
  plantAt: { lat: number; lon: number };
  /** Taken on our side, never read off the file. */
  serverTime?: string;
};

const ALLOWED_METRES = 120;

export async function verify(e: Evidence): Promise<Verdict> {
  const checks: Check[] = [];

  checks.push({
    key: "source",
    label: "Photographed in the app",
    reason: e.fromCamera
      ? "The frame came straight off the camera, so there was no older picture to hand it."
      : "This came from a file rather than the camera.",
    ok: e.fromCamera,
  });

  checks.push({
    key: "time",
    label: "Timed on our side",
    reason: e.serverTime
      ? `Stamped ${new Date(e.serverTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} by the server, not by the file.`
      : "The server clock could not be reached, so the time is unproven.",
    ok: Boolean(e.serverTime),
  });

  if (e.here) {
    const d = Math.round(metresApart(e.here.lat, e.here.lon, e.plantAt.lat, e.plantAt.lon));
    checks.push({
      key: "place",
      label: "Taken at the plant's spot",
      reason:
        d <= ALLOWED_METRES
          ? `${d}m from where this plant was registered.`
          : `${d}m from where this plant was registered, further than the ${ALLOWED_METRES}m this allows.`,
      ok: d <= ALLOWED_METRES,
    });
  } else {
    checks.push({
      key: "place",
      label: "Taken at the plant's spot",
      reason: "Location was not shared, so the spot could not be confirmed.",
      ok: false,
    });
  }

  const now = await pixels(e.thumb, 128);

  // A pest photograph is a close-up of one leaf. It is not meant to look like
  // the plant's wide first photograph and is never compared to it: what it has
  // to show is leaf, close and sharp enough that something small would be
  // visible on it.
  if (e.kind === "pest") {
    const g = greenness(now);
    const close = detail(now);
    const ok = g >= 0.2 && close >= 0.02;
    checks.push({
      key: "closeup",
      label: "Close enough to see trouble",
      reason: ok
        ? `${Math.round(g * 100)}% of the frame is leaf, sharp enough that scale or aphids would show.`
        : g < 0.2
          ? `Only ${Math.round(g * 100)}% of the frame is leaf, so this is too far back to see anything on them.`
          : "The leaves are not sharp enough for anything small on them to show.",
      ok,
    });
    return { checks, passed: checks.every((c) => c.ok) };
  }

  if (e.baseline) {
    const base = await pixels(e.baseline, 128);
    const f = framing(now, base);
    checks.push({
      key: "framing",
      label: "Framed like the first photo",
      reason:
        f >= 0.45
          ? `The layout of the shot matches this plant's first photograph closely enough to compare them.`
          : `The shot is framed differently from this plant's first photograph, so there is nothing to compare against.`,
      ok: f >= 0.45,
    });

    if (e.kind === "water") {
      const wet = region(now, 0.25, 0.62, 0.75, 0.98);
      const dry = region(base, 0.25, 0.62, 0.75, 0.98);
      const drop = dry > 0 ? (dry - wet) / dry : 0;
      checks.push({
        key: "soil",
        label: "Soil is darker than dry",
        reason:
          drop >= 0.05
            ? `The soil reads ${Math.round(drop * 100)}% darker than this plant's dry baseline, which is what wet soil does.`
            : `The soil is no darker than this plant's dry baseline.`,
        ok: drop >= 0.05,
      });
    }

    if (e.kind === "checkin") {
      const g = greenness(now);
      const g0 = greenness(base);
      checks.push({
        key: "leaves",
        label: "Leaves are in frame",
        reason:
          g >= g0 * 0.5
            ? `${Math.round(g * 100)}% of the frame is leaf, close to this plant's usual ${Math.round(g0 * 100)}%.`
            : `Only ${Math.round(g * 100)}% of the frame is leaf, against this plant's usual ${Math.round(g0 * 100)}%.`,
        ok: g >= g0 * 0.5,
      });
    }

    if (e.kind === "fertilise") {
      const soil = region(now, 0.25, 0.62, 0.75, 0.98);
      const base0 = region(base, 0.25, 0.62, 0.75, 0.98);
      const change = Math.abs(soil - base0) / (base0 || 1);
      checks.push({
        key: "surface",
        label: "Something is on the soil",
        reason:
          change >= 0.04
            ? `The soil surface reads ${Math.round(change * 100)}% different from the bare baseline.`
            : `The soil surface looks unchanged from the bare baseline.`,
        ok: change >= 0.04,
      });
    }
  } else {
    checks.push({
      key: "baseline",
      label: "Saved as the baseline",
      reason:
        "This is this plant's first photograph, so it becomes the picture every later one is measured against.",
      ok: true,
    });
  }

  return { checks, passed: checks.every((c) => c.ok) };
}
