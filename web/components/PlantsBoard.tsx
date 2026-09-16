"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { BlobImage } from "./BlobImage";
import { HealthBar } from "./HealthBar";
import { useRooted } from "@/lib/live";
import { ageInDays, dueLabel } from "@/lib/schedule";
import { species } from "@/lib/data";
import { health, latestPhotos, type StoredPhoto } from "@/lib/store";

/**
 * Everything you are looking after.
 *
 * A plant is known by sight, so the card leads with the last photograph taken
 * of that plant rather than a stock picture of its species. Under it, the one
 * sentence that matters: how it is doing and what it wants next. The rest of
 * the record is a tap away and not on this screen, because this screen is for
 * deciding where to walk.
 */
export function PlantsBoard({ offset }: { offset: number }) {
  const { ready, plants, due, next } = useRooted(offset);
  const [shots, setShots] = useState<Map<string, StoredPhoto>>(new Map());

  useEffect(() => {
    latestPhotos().then(setShots);
  }, [ready]);

  const upcoming = [...due, ...next];
  const living = plants.filter((p) => !p.lostOn);
  const lost = plants.filter((p) => p.lostOn);

  return (
    <AppShell active="/plants">
      <header className="app-column pt-10 pb-8">
        <p className="label">{living.length} in your care</p>
        <h1 className="display h-sub mt-2">Your plants</h1>
      </header>

      <main className="app-column flex flex-1 flex-col pb-6">
        {!ready ? (
          <p className="label py-10 text-faint">Reading your plants</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {living.map((p) => {
              const sp = species(p.speciesId);
              const h = health(p, offset);
              const job = upcoming.find((t) => t.plant.id === p.id);

              return (
                <Link
                  key={p.id}
                  href={`/plants/${p.id}`}
                  className="group overflow-hidden rounded-[18px] border border-line-soft bg-surface transition hover:border-line"
                >
                  <BlobImage
                    blob={shots.get(p.id)?.full}
                    alt={p.name}
                    className="block h-[186px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="display text-[23px] text-cream">{p.name}</h2>
                      <span className="num text-[12px] text-faint">
                        {ageInDays(p.plantedOn) + offset}d
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-faint">
                      {sp.latin}, {p.place}
                    </p>

                    <HealthBar health={h} className="mt-4" />

                    <p className="mt-3.5 text-[13.5px] leading-snug text-body">
                      {job
                        ? `${job.label}, ${dueLabel(job.dueIn).toLowerCase()}`
                        : "Nothing due."}
                    </p>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/plants/new"
              className="flex min-h-[200px] flex-col items-start justify-end rounded-[18px] border border-dashed border-line p-5 text-body transition hover:border-moss hover:text-cream"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              <p className="display mt-4 text-[22px]">Add a plant</p>
              <p className="mt-1 text-[13px] text-faint">One photo and where it stands.</p>
            </Link>
          </div>
        )}

        {lost.length > 0 && (
          <section className="mt-12">
            <p className="label">No longer with you</p>
            {lost.map((p) => (
              <div key={p.id} className="row flex items-center justify-between gap-4 py-4">
                <p className="text-[14.5px] text-body">{p.name}</p>
                <span className="num text-[12.5px] text-faint">
                  {p.points.toLocaleString()} pts kept
                </span>
              </div>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}
