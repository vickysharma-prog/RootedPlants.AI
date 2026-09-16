"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, AppHeader, ACTION } from "./AppShell";
import { BlobImage } from "./BlobImage";
import { HealthBar } from "./HealthBar";
import { useRooted } from "@/lib/live";
import { ageInDays, dueLabel } from "@/lib/schedule";
import { species, TASK_LABEL } from "@/lib/data";
import { health, photosFor, putPlant, type StoredPhoto, type StoredPlant } from "@/lib/store";

const REASONS = [
  "It dried out",
  "Too much rain",
  "Pests or disease",
  "Someone removed it",
  "I do not know",
];

/**
 * A plant's whole record.
 *
 * The premise of the app is that nobody knows what happened to the tree they
 * planted. This page is the answer to that: how old it is, every photograph
 * taken of it in order, how the care has been going, and what it wants next.
 * It reads as a history rather than a dashboard, because that is what somebody
 * actually wants to look at two years on.
 */
export function PlantProfile({ plantId, offset }: { plantId: string; offset: number }) {
  const router = useRouter();
  const { ready, plants, due, next, reload } = useRooted(offset);
  const [shots, setShots] = useState<StoredPhoto[]>([]);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);

  useEffect(() => {
    photosFor(plantId).then(setShots);
  }, [plantId, ready]);

  const plant = plants.find((p) => p.id === plantId);

  if (!ready)
    return (
      <AppShell active="/plants">
        <AppHeader back="/plants" title="One moment" />
      </AppShell>
    );

  if (!plant)
    return (
      <AppShell active="/plants">
        <AppHeader back="/plants" title="That plant is not here." />
      </AppShell>
    );

  const sp = species(plant.speciesId);
  const h = health(plant, offset);
  const age = ageInDays(plant.plantedOn) + offset;
  const job = [...due, ...next].find((t) => t.plant.id === plant.id);
  const latest = shots[shots.length - 1];

  async function report() {
    const p = plant as StoredPlant;
    await putPlant({ ...p, lostOn: new Date().toISOString() });
    reload();
    router.push("/plants");
  }

  return (
    <AppShell active="/plants">
      <AppHeader
        back="/plants"
        eyebrow={`${sp.latin}, ${plant.place}`}
        title={plant.name}
        right={<span className="num text-[13px] text-gold">{plant.points.toLocaleString()} pts</span>}
      />

      <main className="app-column flex flex-1 flex-col pb-12">
        {latest && (
          <BlobImage
            blob={latest.full}
            alt={plant.name}
            className="block w-full rounded-[18px] object-cover"
            style={{ aspectRatio: "4 / 3" }}
          />
        )}

        <dl className="mt-7 grid grid-cols-3 gap-4">
          <Stat label="Days old" value={age} />
          <Stat label="Streak" value={plant.streak} />
          <Stat label="Photos" value={shots.length} />
        </dl>

        <section className="mt-10">
          <p className="label">How it is doing</p>
          <HealthBar health={h} className="mt-4" big />
          <p className="mt-3 text-[13.5px] leading-relaxed text-faint">
            {sp.advice} Measured against the schedule, not guessed from the picture.
          </p>
        </section>

        {job && !plant.lostOn && (
          <section className="mt-10">
            <div className="rule" />
            <div className="flex items-center justify-between gap-4 pt-6">
              <div>
                <p className="display text-[21px] text-cream">{TASK_LABEL[job.kind]}</p>
                <p className="mt-1 text-[13.5px] text-faint">{job.why}</p>
              </div>
              <span className="num shrink-0 text-[13px] text-gold">+{job.points}</span>
            </div>
            <Link href={`/do/${job.id}`} className={`${ACTION} mt-6 w-full`}>
              <span className="btn-label">
                {job.dueIn <= 0 ? "Do it now" : `Ready ${dueLabel(job.dueIn).toLowerCase()}`}
              </span>
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          </section>
        )}

        <section className="mt-12">
          <p className="label">Every photograph, in order</p>
          <ul className="mt-5 space-y-5">
            {shots
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.id} className="flex items-center gap-4">
                  <BlobImage
                    blob={s.thumb}
                    alt=""
                    className="h-[68px] w-[54px] shrink-0 rounded-[10px] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[14.5px] text-cream">
                      {s.kind === "baseline" ? "First photograph" : TASK_LABEL[s.kind]}
                    </p>
                    <p className="num mt-1 text-[12px] text-faint">
                      {new Date(s.at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {s.note && <p className="mt-1 text-[13px] text-faint">{s.note}</p>}
                  </div>
                </li>
              ))}
            {shots.length === 0 && (
              <li className="text-[14.5px] text-faint">
                No photographs yet. The first one you take becomes the baseline.
              </li>
            )}
          </ul>
        </section>

        {!plant.lostOn && (
          <section className="mt-14">
            <div className="rule" />
            {!reporting ? (
              <button
                type="button"
                onClick={() => setReporting(true)}
                className="link-arrow mt-6 inline-flex text-faint"
              >
                <span className="link-text">Report that this plant is gone</span>
              </button>
            ) : (
              <div className="rise-in mt-6">
                <p className="prose text-body">
                  Plants die for reasons that have nothing to do with the person looking
                  after them. Your {plant.points.toLocaleString()} points stay yours and
                  your streak carries to the next plant.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className="rounded-full border px-4 py-2 text-[13.5px] transition"
                      style={{
                        borderColor: reason === r ? "var(--moss)" : "var(--line)",
                        color: reason === r ? "var(--cream)" : "var(--body)",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button className={`${ACTION} mt-7 w-full`} type="button" onClick={report}>
                  <span className="btn-label">Report it</span>
                  <span className="btn-arrow" aria-hidden>
                    →
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReporting(false)}
                  className="link-arrow mt-5 inline-flex text-faint"
                >
                  <span className="link-text">Never mind</span>
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="label text-faint">{label}</dt>
      <dd className="num mt-1.5 text-[26px] text-cream">{value}</dd>
    </div>
  );
}
