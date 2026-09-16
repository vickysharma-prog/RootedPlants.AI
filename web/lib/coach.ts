"use client";

import type { TaskKind } from "./data";

/**
 * The voice over your shoulder.
 *
 * Somebody standing in a garden holding a watering can should not have to
 * read a page of rules, take a photograph, and find out afterwards that it was
 * too dark. So the app watches the live frame and says, out loud, the one
 * thing that would make this shot pass: get the soil in, hold still, find more
 * light, that is it, take it.
 *
 * Everything it says is measured off the frame in front of it. It never
 * encourages a shot it has not checked, and it never invents a problem to have
 * something to say. When the frame is good it says so once and then goes
 * quiet, because a coach that talks continuously is one people mute.
 */

export type Guide = {
  /** The single most useful thing to say right now. */
  line: string;
  /** True when nothing is wrong and the shutter is worth pressing. */
  ready: boolean;
  /** Changes only when the advice changes, so the voice does not repeat. */
  key: string;
};

const SAMPLE = 128;

/** A centre crop at native resolution, so sharpness survives the downscale. */
function read(source: CanvasImageSource, w: number, h: number) {
  const side = Math.min(w, h) * 0.8;
  const c = document.createElement("canvas");
  c.width = SAMPLE;
  c.height = SAMPLE;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, SAMPLE, SAMPLE);
  return ctx.getImageData(0, 0, SAMPLE, SAMPLE);
}

const luma = (d: Uint8ClampedArray, i: number) =>
  (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

function brightness(img: ImageData) {
  let sum = 0;
  for (let i = 0; i < img.data.length; i += 4) sum += luma(img.data, i);
  return sum / (img.data.length / 4);
}

/**
 * How much detail there is, as the average step between neighbouring pixels.
 *
 * A photograph of a moving hand or a lens that has not focused has almost no
 * step anywhere. This is not a focus score in any formal sense, and it is not
 * reported as one: it is only ever used to say "hold still".
 */
function detail(img: ImageData) {
  const { width: w, height: h, data } = img;
  let sum = 0;
  let n = 0;
  for (let y = 1; y < h; y++)
    for (let x = 1; x < w; x++) {
      const i = (y * w + x) * 4;
      sum += Math.abs(luma(data, i) - luma(data, i - 4));
      sum += Math.abs(luma(data, i) - luma(data, i - w * 4));
      n += 2;
    }
  return sum / n;
}

/** Fraction of a band where green leads the other channels. */
function green(img: ImageData, y0: number, y1: number) {
  const { width: w, data } = img;
  let n = 0;
  let total = 0;
  for (let y = Math.floor(y0 * SAMPLE); y < Math.floor(y1 * SAMPLE); y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 1] > data[i] * 1.06 && data[i + 1] > data[i + 2] * 1.06) n++;
      total++;
    }
  return total ? n / total : 0;
}

export function guide(
  source: CanvasImageSource,
  w: number,
  h: number,
  kind: TaskKind,
): Guide {
  if (!w || !h) return { line: "Opening the camera", ready: false, key: "opening" };

  const img = read(source, w, h);
  const light = brightness(img);
  const sharp = detail(img);
  const leaf = green(img, 0, 0.62);
  const base = green(img, 0.62, 1);

  if (light < 0.16)
    return { line: "Too dark to check. Turn towards the light.", ready: false, key: "dark" };

  if (light > 0.88)
    return { line: "Blown out. Step out of the direct sun.", ready: false, key: "bright" };

  if (sharp < 0.012)
    return { line: "Hold still for a second.", ready: false, key: "blur" };

  if (leaf < 0.05)
    return { line: "Point it at the plant.", ready: false, key: "noplant" };

  // For watering and feeding, the soil is the evidence. If the lower part of
  // the frame is as leafy as the upper part, the pot is out of shot.
  if ((kind === "water" || kind === "fertilise") && base > leaf * 0.85)
    return { line: "Tilt down so the soil is in frame.", ready: false, key: "nosoil" };

  if (kind === "pest" && leaf < 0.22)
    return { line: "Closer. Get the underside of a leaf.", ready: false, key: "pestclose" };

  if (kind === "pest" && sharp < 0.02)
    return { line: "Hold it steady, it has to be sharp.", ready: false, key: "pestsharp" };

  if (kind === "checkin" && leaf < 0.14)
    return { line: "Closer, until the leaves fill the frame.", ready: false, key: "closer" };

  return { line: "That is it. Take it.", ready: true, key: "ready" };
}

/* ---------------------------------------------------------------- speech */

/**
 * Saying it out loud.
 *
 * Built into the browser, so there is no voice to download and nothing leaves
 * the device. It speaks a line once and will not repeat itself until the
 * advice actually changes, and anything already queued is dropped so the voice
 * is never a sentence behind what the camera is seeing.
 */
export function say(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.pitch = 1;
  u.volume = 0.9;
  synth.speak(u);
}

export function hush() {
  window.speechSynthesis?.cancel();
}
