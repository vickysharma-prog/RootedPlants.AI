"use client";

import { useState } from "react";
import { AppShell, ACTION } from "./AppShell";
import { Celebration } from "./Celebration";
import { useRooted } from "@/lib/live";
import { addLedger, id, type LedgerEntry } from "@/lib/store";
import { TASK_LABEL } from "@/lib/data";
import { say, voiceOn } from "@/lib/coach";

/**
 * What the work is worth.
 *
 * The offers below are stand-ins. Naming real companies in a demo would put
 * words in their mouths, so these are the shapes a partner offer takes rather
 * than any particular partner: a thing you can hold, a thing that goes back
 * into the ground, and a record you can show somebody.
 *
 * Every point on this screen came from a verified task. That is the whole
 * argument: a reward you can spend is only worth something to a funder if the
 * thing behind it actually happened.
 */
const CATALOGUE = [
  {
    id: "sapling",
    cost: 500,
    title: "Two saplings, planted in your name",
    by: "Partner nursery",
    note: "Planted in a municipal drive and registered here, so you can watch these two as well.",
  },
  {
    id: "certificate",
    cost: 300,
    title: "Survival certificate",
    by: "Rooted",
    note: "A signed record of what you kept alive and for how long, checked against every verified task.",
  },
  {
    id: "kit",
    cost: 800,
    title: "Seed and compost kit",
    by: "Partner nursery",
    note: "Delivered once. Enough to start three more plants on a balcony.",
  },
  {
    id: "voucher",
    cost: 1200,
    title: "Nursery voucher",
    by: "Partner nursery",
    note: "Spend it on anything that grows. Funded by the partner, not by you.",
  },
  {
    id: "water",
    cost: 2000,
    title: "Water bill credit",
    by: "Civic partner",
    note: "The shape a municipal partner's offer takes: money off the bill for the household doing the watering.",
  },
  {
    id: "grove",
    cost: 4000,
    title: "Ten saplings, planted and tracked",
    by: "Partner nursery",
    note: "A row of ten, planted in a drive and registered here so somebody is answerable for each of them two years on.",
  },
  {
    id: "orchard",
    cost: 9000,
    title: "A fruit tree for a school",
    by: "Civic partner",
    note: "Planted in a school ground with the class registered as its keepers. The one thing on this list that outlives the phone it was earned on.",
  },
];

export function RewardsBoard({ offset }: { offset: number }) {
  const { ready, points, history, reload } = useRooted(offset);
  const [confirming, setConfirming] = useState<string>();
  const [code, setCode] = useState<string>();

  async function redeem(item: (typeof CATALOGUE)[number]) {
    await addLedger({
      id: id(),
      at: new Date().toISOString(),
      plantId: "",
      plantName: item.by,
      kind: "redeem",
      points: -item.cost,
      label: item.title,
    });
    const fresh = `RTD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setCode(fresh);
    if (voiceOn()) say(`Redeemed. ${item.title}. Your code is on screen.`);
    setConfirming(undefined);
    reload();
  }

  return (
    <AppShell active="/rewards">
      <header className="app-column pt-10 pb-8">
        <p className="label">Your balance</p>
        <h1 className="num mt-2 text-[56px] leading-none text-gold">
          {ready ? points.toLocaleString() : "0"}
        </h1>
        <p className="mt-3 text-[14.5px] text-faint">
          Every one of these came from a task that was photographed and checked.
        </p>
      </header>

      <main className="app-column flex flex-1 flex-col pb-6">
        {code && (
          <div className="mb-10">
            <Celebration
              code={code}
              title="Redeemed"
              line="Show this at the partner. It is also in your history below."
            />
          </div>
        )}

        <section>
          {CATALOGUE.map((item) => {
            const afford = points >= item.cost;
            const open = confirming === item.id;

            return (
              <div key={item.id} className="row">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h2 className="display text-[21px] text-cream">{item.title}</h2>
                    <p className="label mt-1.5 text-faint">{item.by}</p>
                    <p className="mt-2.5 max-w-[26rem] text-[14px] leading-relaxed text-body">
                      {item.note}
                    </p>
                  </div>
                  <span
                    className="num shrink-0 text-[15px]"
                    style={{ color: afford ? "var(--gold)" : "var(--faint)" }}
                  >
                    {item.cost.toLocaleString()}
                  </span>
                </div>

                {open ? (
                  <div className="rise-in mt-5 flex items-center gap-4">
                    <button className={`${ACTION} flex-1`} type="button" onClick={() => redeem(item)}>
                      <span className="btn-label">Spend {item.cost.toLocaleString()}</span>
                      <span className="btn-arrow" aria-hidden>
                        →
                      </span>
                    </button>
                    <button
                      type="button"
                      className="text-[14px] text-faint"
                      onClick={() => setConfirming(undefined)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!afford}
                    onClick={() => setConfirming(item.id)}
                    className="link-arrow mt-4 inline-flex"
                    style={{ color: afford ? "var(--cream)" : "var(--faint)" }}
                  >
                    <span className="link-text">
                      {afford ? "Redeem it" : `${(item.cost - points).toLocaleString()} more to go`}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </section>

        <section className="mt-12">
          <p className="label">Where the points came from</p>
          <ul className="mt-4">
            {history.slice(0, 12).map((e) => (
              <Entry key={e.id} entry={e} />
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}

function Entry({ entry }: { entry: LedgerEntry }) {
  const out = entry.points < 0;
  return (
    <li className="row flex items-baseline justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-[14.5px] text-cream">
          {entry.kind === "redeem" || entry.kind === "bonus"
            ? entry.label
            : `${entry.plantName}, ${TASK_LABEL[entry.kind].toLowerCase()}`}
        </p>
        <p className="num mt-0.5 text-[11.5px] text-faint">
          {new Date(entry.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </p>
      </div>
      <span
        className="num shrink-0 text-[14px]"
        style={{ color: out ? "var(--faint)" : "var(--gold)" }}
      >
        {out ? "" : "+"}
        {entry.points.toLocaleString()}
      </span>
    </li>
  );
}
