"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, AppHeader, ACTION } from "./AppShell";
import { Camera, type Shot } from "./Camera";
import { Celebration } from "./Celebration";
import { species, TASK_INSTRUCTION, TASK_LABEL, type TaskKind } from "@/lib/data";
import { verify, type Check } from "@/lib/verify";
import { say, useSpoken, voiceOn } from "@/lib/coach";
import { VoiceToggle } from "./VoiceToggle";
import { samePlant, warm } from "@/lib/identity";
import {
  addLedger,
  getPlant,
  id,
  photo as readPhoto,
  photosFor,
  pointsFor,
  seedIfEmpty,
  putPhoto,
  putPlant,
  type StoredPlant,
} from "@/lib/store";

type Stage = "brief" | "camera" | "checking" | "done";

/**
 * Doing the task.
 *
 * Four steps, and each one is a whole screen rather than a panel on a busy
 * one: here is the job, here is the camera, here is what was checked, here is
 * what it earned. A person doing this is standing in a garden holding a
 * watering can, so at every point there is exactly one thing to look at and
 * one thing to press.
 *
 * The instruction is shown before the shutter and is the same sentence the
 * checks below test. There is no hidden standard to fail: follow the line,
 * pass every time.
 */
export function CaptureFlow({ taskId, offset }: { taskId: string; offset: number }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("brief");
  const [plant, setPlant] = useState<StoredPlant | null>(null);
  const [ghost, setGhost] = useState<string>();
  const [checks, setChecks] = useState<Check[]>([]);
  const [shown, setShown] = useState(0);
  const [earned, setEarned] = useState(0);
  const [missing, setMissing] = useState(false);

  // "neem-1-water" is a plant id with the task on the end.
  useSpoken(
    plant ? `${stage}-${taskId}` : "",
    stage === "brief"
      ? TASK_INSTRUCTION[taskId.slice(taskId.lastIndexOf("-") + 1) as TaskKind] ?? ""
      : "",
  );

  const cut = taskId.lastIndexOf("-");
  const plantId = taskId.slice(0, cut);
  const kind = taskId.slice(cut + 1) as TaskKind;

  useEffect(() => {
    let url: string | undefined;
    // A task URL can be the first thing this device ever opens, from a
    // reminder or a shared link, so the account has to exist before the plant
    // is looked up rather than only when Today happens to run first.
    seedIfEmpty()
      .then(() => getPlant(plantId))
      .then(async (p) => {
      if (!p) return setMissing(true);
      setPlant(p);
      const base = p.baselinePhotoId ? await readPhoto(p.baselinePhotoId) : undefined;
      if (base) {
        url = URL.createObjectURL(base.full);
        setGhost(url);
      }
      });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [plantId]);

  const shot = useCallback(
    async (s: Shot) => {
      if (!plant) return;
      setStage("checking");

      const [here, serverTime] = await Promise.all([whereAmI(), serverNow()]);
      const base = plant.baselinePhotoId ? await readPhoto(plant.baselinePhotoId) : undefined;

      // A pest photograph is a close-up of one leaf, so there is nothing in it
      // to match against a picture of the whole plant. Everything else gets
      // asked the real question: is this that plant.
      const identity =
        base && kind !== "pest" ? await samePlant(s.thumb, base.full) : undefined;

      const verdict = await verify({
        kind,
        thumb: s.thumb,
        baseline: base?.thumb,
        fromCamera: s.fromCamera,
        here,
        plantAt: { lat: plant.lat, lon: plant.lon },
        serverTime,
        identity,
      });

      setChecks(verdict.checks);

      const photoId = id();
      await putPhoto({
        id: photoId,
        plantId: plant.id,
        at: serverTime ?? new Date().toISOString(),
        kind,
        full: s.full,
        thumb: s.thumb,
        note: verdict.passed ? TASK_LABEL[kind] : "Not verified",
      });

      if (verdict.passed) {
        const points = pointsFor(kind, plant.streak);
        setEarned(points);

        const updated: StoredPlant = {
          ...plant,
          streak: plant.streak + 1,
          points: plant.points + points,
          baselinePhotoId: plant.baselinePhotoId || photoId,
          ...(kind === "water" ? { lastWatered: offset } : {}),
          ...(kind === "fertilise" ? { lastFertilised: offset } : {}),
          ...(kind === "checkin" ? { lastCheckin: offset } : {}),
          ...(kind === "pest" ? { lastPest: offset } : {}),
        };
        await putPlant(updated);
        setPlant(updated);

        await addLedger({
          id: id(),
          at: serverTime ?? new Date().toISOString(),
          plantId: plant.id,
          plantName: plant.name,
          kind,
          points,
          label: TASK_LABEL[kind],
        });
      }

      if (voiceOn()) {
        const failed = verdict.checks.find((c) => !c.ok);
        say(
          verdict.passed
            ? `Verified. Well done. ${pointsFor(kind, plant.streak)} points.`
            : `That one did not pass. ${failed?.label ?? ""}. ${failed?.reason ?? ""} Take it again.`,
        );
      }

      setStage("done");
    },
    [plant, kind, offset],
  );

  // The checks arrive at reading speed rather than all at once. A wall of
  // ticks is a logo; one line landing after another is somebody showing their
  // working.
  useEffect(() => {
    if (stage !== "done" && stage !== "checking") return;
    if (shown >= checks.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 420 : 620);
    return () => clearTimeout(t);
  }, [stage, shown, checks.length]);

  if (missing)
    return (
      <AppShell active="/today">
        <AppHeader back="/today" title="That plant is not here." />
        <p className="app-column prose text-body">It may have been removed from this device.</p>
      </AppShell>
    );

  if (!plant)
    return (
      <AppShell active="/today">
        <AppHeader back="/today" title="One moment" />
      </AppShell>
    );

  const sp = species(plant.speciesId);
  const passed = checks.length > 0 && checks.every((c) => c.ok);

  if (stage === "brief")
    return (
      <AppShell>
        <AppHeader
          back="/today"
          eyebrow={`${plant.name}, ${plant.place}`}
          title={TASK_LABEL[kind]}
          right={
            <span className="flex items-center gap-4">
              <span className="num text-[15px] text-gold">+{pointsFor(kind, plant.streak)}</span>
              <VoiceToggle />
            </span>
          }
        />
        <main className="app-column flex flex-1 flex-col pb-12">
          <div className="rule" />
          <p className="prose-lg mt-6 text-body">{TASK_INSTRUCTION[kind]}</p>

          <p className="mt-7 text-[15px] leading-relaxed text-body">
            {kind === "fertilise" ? sp.feedWith : kind === "pest" ? sp.pestWatch : sp.advice}
          </p>

          {(kind === "fertilise" || kind === "pest") && (
            <p className="mt-5 max-w-[27rem] text-[14px] leading-relaxed text-faint">
              {kind === "fertilise"
                ? "Feed the soil rather than the plant, and less than you think. Fertiliser that the roots do not take ends up in the groundwater."
                : "Start with the mildest thing that works. Most of what lands on a plant can be wiped off, and a spray kills the ladybirds that were handling it for you."}
            </p>
          )}

          <p className="mt-5 text-[14px] leading-relaxed text-faint">
            This is the only thing checked, and you are being told it before the camera
            opens.
          </p>

          <div className="flex-1" />

          <button className={`${ACTION} mt-12 w-full`} type="button" onClick={() => setStage("camera")}>
            <span className="btn-label">Open the camera</span>
            <span className="btn-arrow" aria-hidden>
              →
            </span>
          </button>
        </main>
      </AppShell>
    );

  if (stage === "camera")
    return (
      <AppShell>
        <AppHeader back="/today" eyebrow={plant.name} title={TASK_LABEL[kind]} />
        <Camera
          ghost={ghost}
          instruction={TASK_INSTRUCTION[kind]}
          kind={kind}
          onOpen={warm}
          onShot={shot}
        />
      </AppShell>
    );

  return (
    <AppShell>
      <AppHeader
        back="/today"
        eyebrow={plant.name}
        title={stage === "checking" ? "Checking the photo" : passed ? "Verified." : "Not yet."}
      />

      <main className="app-column flex flex-1 flex-col pb-12">
        <ul className="mt-2">
          {checks.slice(0, shown).map((c) => (
            <li key={c.key} className="row tick-in flex items-start gap-3.5">
              <Mark ok={c.ok} />
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-cream">{c.label}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-faint">{c.reason}</p>
              </div>
            </li>
          ))}
        </ul>

        {shown >= checks.length && stage === "done" && (
          <div className="rise-in mt-9">
            {passed ? (
              <Celebration
                points={earned}
                title="Earned"
                line={`${plant.streak} in a row on ${plant.name}.`}
              >
                <button
                  className={`${ACTION} mt-10 w-full`}
                  type="button"
                  onClick={() => router.push("/today")}
                >
                  <span className="btn-label">Back to today</span>
                  <span className="btn-arrow" aria-hidden>
                    →
                  </span>
                </button>
              </Celebration>
            ) : (
              <>
                <div className="rule" />
                <p className="prose mt-6 text-body">
                  The task stays open and your streak is held. Take it again with the line
                  above in mind.
                </p>
                <button
                  className={`${ACTION} mt-9 w-full`}
                  type="button"
                  onClick={() => {
                    setChecks([]);
                    setShown(0);
                    setStage("camera");
                  }}
                >
                  <span className="btn-label">Take it again</span>
                  <span className="btn-arrow" aria-hidden>
                    →
                  </span>
                </button>
                <Link href="/today" className="link-arrow mt-6 inline-flex text-faint">
                  <span className="link-text">Leave it for now</span>
                </Link>
              </>
            )}
          </div>
        )}
      </main>
    </AppShell>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ok ? "var(--verified)" : "var(--overdue)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      {ok ? <path d="M4 12.5l5.2 5.2L20 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  );
}

/* ------------------------------------------------------------- evidence */

function whereAmI(): Promise<{ lat: number; lon: number; accuracy: number } | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

async function serverNow(): Promise<string | undefined> {
  try {
    const r = await fetch("/api/now");
    return r.ok ? (await r.json()).now : undefined;
  } catch {
    return undefined;
  }
}
