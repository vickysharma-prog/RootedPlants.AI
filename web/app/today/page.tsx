import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { PlantPhoto } from "@/components/PlantPhoto";
import { dayOffset, longDate } from "@/lib/day";
import { schedule, dueLabel, type Task } from "@/lib/schedule";
import { species } from "@/lib/data";
import { jumpDays, resetDay } from "../actions";

export default async function Today() {
  const offset = await dayOffset();
  const { due, next } = await schedule(offset);

  return (
    <>
      <header className="flex items-end justify-between gap-3 px-5 pt-14 pb-4">
        <div>
          <p className="text-[13px] text-muted">{longDate(offset)}</p>
          <h1 className="mt-1 font-display text-[34px] leading-none font-extrabold tracking-[-0.025em]">
            Today
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-on-brand shadow-[0_6px_18px_-8px_rgba(20,84,58,0.9)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1.6-.7-2.7-1.5-3.7" />
          </svg>
          <span className="font-display text-sm font-bold tabular-nums">12</span>
          <span className="text-xs opacity-70">days</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {due.length === 0 ? (
          <Settled next={next} />
        ) : (
          due.map((t, i) => <TaskCard key={t.id} task={t} first={i === 0} />)
        )}

        {due.length > 0 && next.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 px-1 pt-2 pb-0.5">
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

      <BottomNav active="/today" />
    </>
  );
}

function TaskCard({ task, first }: { task: Task; first: boolean }) {
  const late = task.dueIn < 0;
  const sp = species(task.plant.speciesId);

  return (
    <article
      className="overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_2px_10px_-6px_rgba(26,28,25,0.28)]"
      style={late ? { borderColor: "color-mix(in srgb, var(--overdue) 35%, var(--line))" } : undefined}
    >
      <div className="flex items-center gap-3.5 p-4 pb-3">
        <PlantPhoto src={sp.photo} alt={sp.name} size={72} radius={18} priority={first} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-display text-[20px] leading-tight font-bold tracking-[-0.015em]">
              {task.plant.name}
            </h2>
            {late && (
              <span
                className="shrink-0 rounded-full px-2 py-[3px] text-[11px] font-semibold"
                style={{ color: "var(--overdue)", background: "var(--overdue-tint)" }}
              >
                {dueLabel(task.dueIn)}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[12px] text-faint">
            {sp.latin} &middot; {task.plant.place}
          </p>

          <p className="mt-2 text-[15px] leading-tight font-semibold">{task.label}</p>
          <p className="mt-1 text-[12.5px] leading-snug text-muted">{task.why}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 pt-1 pb-4">
        <Link
          href={`/do/${task.id}`}
          className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-brand text-[15px] font-semibold text-on-brand shadow-[0_8px_20px_-10px_rgba(20,84,58,0.95)] active:translate-y-px"
        >
          Do it
        </Link>
        <span
          className="flex h-12 items-center rounded-2xl px-4 font-display text-[16px] font-bold tabular-nums"
          style={{ background: "var(--brand-tint)", color: "var(--brand-ink)" }}
        >
          +{task.points}
        </span>
      </div>
    </article>
  );
}

function Upcoming({ task }: { task: Task }) {
  const sp = species(task.plant.speciesId);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-sand px-3.5 py-3">
      <PlantPhoto src={sp.photo} alt={sp.name} size={40} radius={12} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold">
          {task.plant.name}, {task.label.toLowerCase()}
        </p>
        <p className="mt-px text-[12px] text-faint">{dueLabel(task.dueIn)}</p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function Settled({ next }: { next: Task[] }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[20px] border border-line bg-surface px-6 py-12 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--brand-tint)" }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--verified)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5.2 5.2L20 7" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold tracking-[-0.01em]">Everything is fine</h2>
      <p className="max-w-[17rem] text-sm leading-relaxed text-muted">
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
      <span className="flex-1 text-[11.5px] text-faint">
        {offset === 0 ? "Demo, move the day" : `Demo, ${offset} days ahead`}
      </span>
      <form action={jumpDays.bind(null, 3)}>
        <button className="rounded-lg bg-sand px-3 py-1.5 text-[11.5px] font-semibold" type="submit">
          +3 days
        </button>
      </form>
      {offset !== 0 && (
        <form action={resetDay}>
          <button className="rounded-lg px-2 py-1.5 text-[11.5px] text-faint" type="submit">
            Reset
          </button>
        </form>
      )}
    </div>
  );
}
