"use client";

import Link from "next/link";
import { PlantPhoto } from "./PlantPhoto";
import { AppShell } from "./AppShell";
import { useRooted, topStreak } from "@/lib/live";
import { dueLabel, type Task } from "@/lib/schedule";
import { species } from "@/lib/data";

/**
 * The day's work, and nothing else.
 *
 * Whatever is overdue sits at the top, in the accent that means late. A row is
 * the whole target: tapping anywhere on it opens the camera for that task.
 * When there is nothing to do the screen says so plainly rather than inventing
 * something to fill itself with, because an app that always has a job for you
 * is an app you learn to ignore.
 */
export function TodayBoard({
  greeting,
  date,
  offset,
  footer,
}: {
  greeting: string;
  date: string;
  offset: number;
  footer: React.ReactNode;
}) {
  const { ready, plants, due, next, points } = useRooted(offset);

  return (
    <AppShell active="/today">
      <div className="app-column flex items-center justify-between gap-4 pt-10">
        <Link href="/me" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-[13px] text-moss">
            {greeting.slice(0, 1)}
          </span>
          <span className="num text-[13px] text-gold">{points.toLocaleString()} pts</span>
        </Link>
        <div className="text-right whitespace-nowrap">
          <span className="num text-[20px] text-moss">{topStreak(plants)}</span>{" "}
          <span className="label text-faint">day streak</span>
        </div>
      </div>

      <header className="app-column pt-8 pb-8">
        <p className="label">{date}</p>
        <h1 className="display h-sub mt-2">Morning, {greeting}</h1>
      </header>

      <main className="app-column flex flex-1 flex-col pb-6">
        {!ready ? (
          <p className="label py-10 text-faint">Reading your plants</p>
        ) : due.length === 0 ? (
          <Settled next={next} />
        ) : (
          <section>
            {due.map((t, i) => (
              <TaskRow key={t.id} task={t} first={i === 0} />
            ))}
          </section>
        )}

        {next.length > 0 && (
          <section className="mt-10">
            <p className="label">Coming up</p>
            {next.map((t) => (
              <UpcomingRow key={t.id} task={t} />
            ))}
          </section>
        )}

        <div className="flex-1" />
        {footer}
      </main>
    </AppShell>
  );
}

function TaskRow({ task, first }: { task: Task; first: boolean }) {
  const late = task.dueIn < 0;
  const sp = species(task.plant.speciesId);

  return (
    <Link href={`/do/${task.id}`} className="row flex items-center gap-4 first:border-t-0">
      <PlantPhoto src={sp.photo} alt={sp.name} size={62} radius={14} priority={first} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h2 className="display truncate text-[22px] text-cream">{task.plant.name}</h2>
          {late && (
            <span className="num shrink-0 text-[11.5px] text-overdue">
              {dueLabel(task.dueIn).toLowerCase()}
            </span>
          )}
        </div>
        <p className="mt-1 text-[14.5px] font-medium text-cream">{task.label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-faint">{task.why}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <span className="num text-[15px] text-gold">+{task.points}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}

function UpcomingRow({ task }: { task: Task }) {
  const sp = species(task.plant.speciesId);
  return (
    <div className="row flex items-center gap-4 py-4">
      <PlantPhoto src={sp.photo} alt={sp.name} size={38} radius={10} dim />
      <p className="min-w-0 flex-1 truncate text-[14.5px] text-body">
        {task.plant.name}, {task.label.toLowerCase()}
      </p>
      <span className="num text-[12.5px] text-faint">{dueLabel(task.dueIn)}</span>
    </div>
  );
}

function Settled({ next }: { next: Task[] }) {
  return (
    <div className="row flex flex-col items-start gap-4 border-t-0 py-10">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--verified)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12.5l5.2 5.2L20 7" />
      </svg>
      <h2 className="display text-[28px] text-cream">Everything is fine.</h2>
      <p className="prose max-w-[19rem] text-[15px] text-body">
        {next.length > 0
          ? `Next is ${next[0].plant.name}, ${next[0].label.toLowerCase()}, ${dueLabel(next[0].dueIn).toLowerCase()}.`
          : "Nothing needs you right now."}
      </p>
    </div>
  );
}
