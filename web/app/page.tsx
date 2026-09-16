import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { PlantThumb } from "@/components/PlantMark";
import { dayOffset, longDate } from "@/lib/day";
import { schedule, dueLabel, ageInDays, type Task } from "@/lib/schedule";
import { species } from "@/lib/data";
import { jumpDays, resetDay } from "./actions";

export default async function Today() {
  const offset = await dayOffset();
  const { due, next } = await schedule(offset);

  return (
    <>
      <header className="flex items-end justify-between gap-3 px-5 pt-14 pb-3">
        <div>
          <p className="text-[13px] tracking-[0.01em] text-muted">{longDate(offset)}</p>
          <h1 className="mt-0.5 font-display text-[34px] leading-tight font-extrabold tracking-[-0.02em]">
            Today
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-on-brand">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1.6-.7-2.7-1.5-3.7" />
          </svg>
          <span className="font-display text-sm font-bold">12</span>
          <span className="text-xs opacity-75">days</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {due.length === 0 ? (
          <Settled next={next} />
        ) : (
          due.map((t) => <TaskCard key={t.id} task={t} />)
        )}

        {due.length > 0 && next.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-faint">
                Nothing else until {dueLabel(next[0].dueIn).toLowerCase()}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <Upcoming task={next[0]} />
          </>
        )}

        <div className="flex-1" />
        <DayControls offset={offset} />
      </main>

      <BottomNav active="/" />
    </>
  );
}

function TaskCard({ task }: { task: Task }) {
  const late = task.dueIn < 0;
  const sp = species(task.plant.speciesId);
  const grown = Math.min(1, 0.55 + ageInDays(task.plant.plantedOn) / 260);

  return (
    <article
      className="flex flex-col gap-3 rounded-[18px] border border-line bg-surface p-3.5"
      style={late ? { borderLeft: "3px solid var(--overdue)" } : undefined}
    >
      <div className="flex items-center gap-3">
        <PlantThumb seed={task.plant.id} grown={grown} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[19px] font-bold tracking-[-0.01em]">
              {task.plant.name}
            </h2>
            {late && (
              <span
                className="rounded-full px-2 py-[3px] text-[11px] font-semibold"
                style={{ color: "var(--overdue)", background: "var(--overdue-tint)" }}
              >
                {dueLabel(task.dueIn)}
              </span>
            )}
          </div>
          <p className="mt-px text-xs text-muted">
            {sp.latin} &middot; {task.plant.place}
          </p>
          <p className="mt-1.5 text-[15px] font-semibold">{task.label}</p>
          <p className="mt-0.5 text-xs text-muted">{task.why}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href={`/do/${task.id}`}
          className="flex h-[46px] flex-1 items-center justify-center rounded-[13px] bg-brand text-[15px] font-semibold text-on-brand"
        >
          Do it
        </Link>
        <span
          className="flex h-[46px] items-center rounded-[13px] px-3.5 font-display text-base font-bold"
          style={{ background: "var(--brand-tint)", color: "var(--brand-ink)" }}
        >
          +{task.points}
        </span>
      </div>
    </article>
  );
}

function Upcoming({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-sand px-4 py-3.5">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--soil)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <div className="flex-1">
        <p className="text-[13px] font-semibold">
          {task.plant.name}, {task.label.toLowerCase()}
        </p>
        <p className="mt-px text-xs text-faint">{dueLabel(task.dueIn)}</p>
      </div>
    </div>
  );
}

function Settled({ next }: { next: Task[] }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[18px] border border-line bg-surface px-6 py-10 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--brand-tint)" }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--verified)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5.2 5.2L20 7" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold">Everything is fine</h2>
      <p className="max-w-[16rem] text-sm text-muted">
        {next.length > 0
          ? `Next is ${next[0].plant.name}, ${next[0].label.toLowerCase()}, ${dueLabel(next[0].dueIn).toLowerCase()}.`
          : "Nothing needs you right now."}
      </p>
    </div>
  );
}

function DayControls({ offset }: { offset: number }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-line px-3 py-2.5">
      <span className="flex-1 text-xs text-faint">
        {offset === 0 ? "Demo, move the day" : `Demo, ${offset} days ahead`}
      </span>
      <form action={jumpDays.bind(null, 3)}>
        <button className="rounded-lg bg-sand px-3 py-1.5 text-xs font-semibold" type="submit">
          +3 days
        </button>
      </form>
      {offset !== 0 && (
        <form action={resetDay}>
          <button className="rounded-lg px-2 py-1.5 text-xs text-faint" type="submit">
            Reset
          </button>
        </form>
      )}
    </div>
  );
}
