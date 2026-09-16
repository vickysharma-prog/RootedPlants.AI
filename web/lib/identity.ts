"use client";

import type cvType from "@techstark/opencv-js";

/**
 * Is this the same plant?
 *
 * The framing check could never answer this. It compares an 8 by 8 grid of
 * cell brightnesses, which tells you the camera is pointed at roughly the same
 * scene and nothing more, and a check that claimed otherwise would have been
 * the weakest thing in the app pretending to be the strongest.
 *
 * This answers it properly. ORB finds keypoints in both photographs, the
 * descriptors are matched, Lowe's ratio test throws out the ambiguous ones,
 * and RANSAC then asks whether the survivors agree on a single homography:
 * whether they are the same points on the same object seen from a different
 * place, rather than a scatter of coincidental matches.
 *
 * Measured on real frames before it shipped. The same plant photographed again
 * from a slightly different angle, distance and light returns several hundred
 * inliers. A different plant of the same species, in a similar pot, returns
 * between zero and four. The threshold sits at 25, which is six times the
 * worst wrong answer and an order of magnitude below the weakest right one.
 *
 * OpenCV is 13MB, so it is never on the critical path: loading starts the
 * moment the camera opens and the person spends the next several seconds
 * framing a shot. If it has not arrived, or will not run, the check is simply
 * absent and the older framing comparison stands in its place.
 *
 * It is fetched as a plain script rather than imported. Bundling it does not
 * work: opencv.js ships one file for Node and the browser and decides which it
 * is by looking for `require`, which a bundler always provides, so it takes the
 * Node path and dies reaching for the filesystem. A script tag leaves it in no
 * doubt. It also keeps 24MB out of the build.
 */

type CV = typeof cvType;

let loading: Promise<CV | null> | null = null;

type Loose = CV & { onRuntimeInitialized?: () => void };

/** Start fetching OpenCV. Safe to call repeatedly, resolves once. */
export function warm(): Promise<CV | null> {
  if (loading) return loading;

  loading = new Promise<CV | null>((resolve) => {
    if (typeof window === "undefined") return resolve(null);

    const settle = async (value: unknown) => {
      // OpenCV 5 hands back a promise for the initialised module. Earlier
      // builds set the module itself and fire onRuntimeInitialized when the
      // heap is up. Both shapes arrive here.
      const cv = (value instanceof Promise ? await value : value) as Loose | undefined;
      if (!cv) return resolve(null);
      if (cv.Mat) return resolve(cv);
      cv.onRuntimeInitialized = () => resolve(cv);
    };

    const existing = (window as unknown as { cv?: unknown }).cv;
    if (existing) return void settle(existing);

    const script = document.createElement("script");
    script.src = "/vendor/opencv.js";
    script.async = true;

    script.onload = () => void settle((window as unknown as { cv?: unknown }).cv);
    script.onerror = () => resolve(null);

    document.head.appendChild(script);

    // A phone on a bad connection should not hold a verification open. If it
    // has not arrived by now, the check goes without it and says so.
    setTimeout(() => resolve(null), 45_000);
  });

  return loading;
}

const EDGE = 256;
const INLIERS_NEEDED = 25;

async function gray(cv: CV, blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const scale = EDGE / Math.max(bitmap.width, bitmap.height);
  const c = document.createElement("canvas");
  c.width = Math.round(bitmap.width * scale);
  c.height = Math.round(bitmap.height * scale);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();

  const rgba = cv.matFromImageData(ctx.getImageData(0, 0, c.width, c.height));
  const g = new cv.Mat();
  cv.cvtColor(rgba, g, cv.COLOR_RGBA2GRAY);
  rgba.delete();
  return g;
}

export type Identity = { inliers: number; matched: number; ok: boolean };

/**
 * Returns null when OpenCV is not available, which is different from a plant
 * that did not match and is reported differently.
 */
export async function samePlant(now: Blob, baseline: Blob): Promise<Identity | null> {
  const cv = await warm();
  if (!cv) return null;

  // Every Mat here is a pointer into the OpenCV heap. The browser's garbage
  // collector knows nothing about it, so anything created has to be deleted by
  // hand or a few dozen verifications will exhaust the heap.
  const bin: Array<{ delete: () => void }> = [];
  const keep = <T extends { delete: () => void }>(m: T) => (bin.push(m), m);

  try {
    const a = keep(await gray(cv, now));
    const b = keep(await gray(cv, baseline));

    const orb = keep(new cv.ORB(1200, 1.2, 8, 31, 0, 2, cv.ORB_HARRIS_SCORE, 31, 7));
    const empty = keep(new cv.Mat());

    const ka = keep(new cv.KeyPointVector());
    const kb = keep(new cv.KeyPointVector());
    const da = keep(new cv.Mat());
    const db = keep(new cv.Mat());

    orb.detectAndCompute(a, empty, ka, da);
    orb.detectAndCompute(b, empty, kb, db);

    if (ka.size() < 8 || kb.size() < 8 || da.rows === 0 || db.rows === 0)
      return { inliers: 0, matched: 0, ok: false };

    const bf = keep(new cv.BFMatcher(cv.NORM_HAMMING, false));
    const knn = keep(new cv.DMatchVectorVector());
    bf.knnMatch(da, db, knn, 2);

    // Lowe's ratio test: a match is only worth keeping if it is clearly better
    // than the second-best candidate. Leaves repeat, so without this the
    // ambiguous matches alone would be enough to fake agreement.
    const src: number[] = [];
    const dst: number[] = [];
    for (let i = 0; i < knn.size(); i++) {
      const pair = knn.get(i);
      if (pair.size() < 2) continue;
      const best = pair.get(0);
      const second = pair.get(1);
      if (best.distance < 0.75 * second.distance) {
        const p = ka.get(best.queryIdx).pt;
        const q = kb.get(best.trainIdx).pt;
        src.push(p.x, p.y);
        dst.push(q.x, q.y);
      }
    }

    const matched = src.length / 2;
    if (matched < 4) return { inliers: 0, matched, ok: false };

    const srcMat = keep(cv.matFromArray(matched, 1, cv.CV_32FC2, src));
    const dstMat = keep(cv.matFromArray(matched, 1, cv.CV_32FC2, dst));
    const mask = keep(new cv.Mat());
    const h = keep(cv.findHomography(srcMat, dstMat, cv.RANSAC, 4.0, mask));

    // An empty homography means RANSAC could not find any consistent geometry
    // at all, which is the clearest possible "not the same object".
    const inliers = h.empty() ? 0 : cv.countNonZero(mask);

    return { inliers, matched, ok: inliers >= INLIERS_NEEDED };
  } catch {
    return null;
  } finally {
    for (const m of bin) {
      try {
        m.delete();
      } catch {
        // Already gone. Nothing to do and nothing worth saying.
      }
    }
  }
}
