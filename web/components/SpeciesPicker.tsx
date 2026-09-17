"use client";

import { useMemo, useState } from "react";
import { PlantPhoto } from "./PlantPhoto";
import { SPECIES, type Species } from "@/lib/data";

/**
 * Picking what it is.
 *
 * This started as twelve tiles. Twelve is fine until somebody grows a lemon
 * tree, and then the app has nothing to say to them, so it is seventy-eight
 * now and a grid of seventy-eight tiles is worse than useless. So: a search
 * box first, and the list underneath grouped the way people actually think
 * about plants, trees, flowers, herbs, vegetables, houseplants.
 *
 * Search looks at the everyday names too, not only the ones on the label.
 * Somebody typing "mogra" or "kadi patta" or "sadabahar" should not have to
 * know that the app filed it under Jasminum sambac.
 *
 * And at the bottom, five profiles for anything not on the list at all.
 * Knowing a plant's name and knowing how to keep it alive are separate jobs:
 * identification answers the first, and these answer the second for the rest
 * of the world's plants. Somebody who cannot name the thing in front of them
 * still knows whether it is a tree in the ground or a succulent on a
 * windowsill, and those two want opposite treatment.
 */

const ORDER = ["Trees", "Flowering", "Herbs", "Vegetables", "Indoors", "Anything else"];

function score(s: Species, q: string): number {
  const name = s.name.toLowerCase();
  const latin = s.latin.toLowerCase();
  const aka = s.aka.toLowerCase();

  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (aka.split(" ").some((w) => w.startsWith(q))) return 2;
  if (latin.toLowerCase().startsWith(q)) return 3;
  if (name.includes(q)) return 4;
  if (aka.includes(q)) return 5;
  if (latin.includes(q)) return 6;
  if (s.group.toLowerCase().includes(q)) return 7;
  return -1;
}

export function SpeciesPicker({
  value,
  onPick,
  /** Species the photograph suggested, shown first and marked. */
  suggested = [],
}: {
  value: string;
  onPick: (id: string) => void;
  suggested?: string[];
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return null;
    return SPECIES.map((s) => ({ s, rank: score(s, query) }))
      .filter((r) => r.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.s.name.localeCompare(b.s.name))
      .map((r) => r.s);
  }, [query]);

  const groups = useMemo(() => {
    const out = new Map<string, Species[]>();
    for (const s of SPECIES) {
      if (suggested.includes(s.id)) continue;
      out.set(s.group, [...(out.get(s.group) ?? []), s]);
    }
    return out;
  }, [suggested]);

  const picks = SPECIES.filter((s) => suggested.includes(s.id));

  return (
    <div>
      <label className="field flex flex-col gap-1 py-4">
        <span className="label">Search</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="neem, mogra, tomato, kadi patta"
          autoComplete="off"
          className="h-8 bg-transparent text-[16.5px] text-cream outline-none placeholder:text-faint"
          aria-label={`Search ${SPECIES.length} plants`}
        />
      </label>

      {results ? (
        results.length ? (
          <ul className="mt-4">
            {results.map((s) => (
              <Row key={s.id} species={s} on={s.id === value} onPick={onPick} />
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-[27rem] text-[14.5px] leading-relaxed text-faint">
            Nothing by that name. Clear the search and pick from{" "}
            <span className="text-body">Anything else</span> at the bottom, which
            carries a care profile for whatever it turns out to be.
          </p>
        )
      ) : (
        <>
          {picks.length > 0 && (
            <section className="mt-6">
              <p className="label" style={{ color: "var(--verified)" }}>
                From your photograph
              </p>
              <ul className="mt-2">
                {picks.map((s) => (
                  <Row key={s.id} species={s} on={s.id === value} onPick={onPick} />
                ))}
              </ul>
            </section>
          )}

          {ORDER.filter((g) => groups.get(g)?.length).map((g) => (
            <section key={g} className="mt-8">
              <p className="label">{g}</p>
              <ul className="mt-2">
                {groups.get(g)!.map((s) => (
                  <Row key={s.id} species={s} on={s.id === value} onPick={onPick} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function Row({
  species,
  on,
  onPick,
}: {
  species: Species;
  on: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(species.id)}
        aria-pressed={on}
        className="row flex w-full items-center gap-4 py-3 text-left"
      >
        <PlantPhoto src={species.photo} alt="" size={40} radius={10} dim={!on} />
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[15.5px]"
            style={{ color: on ? "var(--moss)" : "var(--cream)" }}
          >
            {species.name}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-faint">
            {species.latin || `Water about every ${species.waterEvery} days`}
          </span>
        </span>
        {on && (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--moss)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12.5l5.2 5.2L20 7" />
          </svg>
        )}
      </button>
    </li>
  );
}
