import { dayOffset, longDate } from "@/lib/day";
import { readAccount, firstName } from "@/lib/account";
import { TodayBoard } from "@/components/TodayBoard";
import { jumpDays, resetDay } from "../actions";

export const metadata = { title: "Today - Rooted" };

export default async function Today() {
  const offset = await dayOffset();
  const account = await readAccount();

  return (
    <TodayBoard
      greeting={account ? firstName(account) : "there"}
      date={longDate(offset)}
      offset={offset}
      footer={<DayControls offset={offset} />}
    />
  );
}

/**
 * The demo's day dial.
 *
 * A watering due on Saturday cannot be shown in a five minute video. This
 * moves the whole app forward instead of waiting, and says plainly that it is
 * a demo control so nobody mistakes it for a feature.
 */
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
