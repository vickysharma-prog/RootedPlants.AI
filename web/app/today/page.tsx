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
    <div className="shell">
      <header className="flex items-start justify-between gap-4 px-6 pt-16 pb-8">
        <div>
          <p className="label">{longDate(offset)}</p>
          <h1 className="display mt-2 text-[40px]">Today</h1>
        </div>
        <div className="mt-1 text-right">
          <p className="num text-[22px] text-moss">12</p>
          <p className="label mt-0.5 text-faint">day streak</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 pb-6">
        {due.length === 0 ? (
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
        <DayControls offset={offset} />
      </main>

      <BottomNav active="/today" />
    </div>
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
          <h2 className="display truncate text-[22px]">{task.plant.name}</h2>
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] text-body">
          {task.plant.name}, {task.label.toLowerCase()}
        </p>
      </div>
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
      <h2 className="display text-[28px]">Everything is fine.</h2>
      <p className="prose max-w-[19rem] text-[15px] text-body">
        {next.length > 0
          ? `Next is ${next[0].plant.name}, ${next[0].label.toLowerCase()}, ${dueLabel(next[0].dueIn).toLowerCase()}.`
          : "Nothing needs you right now."}
      </p>
    </div>
  );
}

function DayControls({ offset }: { offset: number }) {
  return (
    <div className="mt-10 flex items-center gap-3 border-t border-line-soft pt-4">
      <span className="label flex-1 text-faint">
        {offset === 0 ? "Demo, move the day" : `Demo, ${offset} days on`}
      </span>
      <form action={jumpDays.bind(null, 3)}>
        <button
          className="num rounded-full border border-line px-3.5 py-1.5 text-[12px] text-body"
          type="submit"
        >
          +3 days
        </button>
      </form>
      {offset !== 0 && (
        <form action={resetDay}>
          <button className="num px-1 py-1.5 text-[12px] text-faint" type="submit">
            reset
          </button>
        </form>
      )}
    </div>
  );
}
