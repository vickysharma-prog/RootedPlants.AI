"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, AppHeader, ACTION } from "./AppShell";
import { BlobImage } from "./BlobImage";
import { Camera, type Shot } from "./Camera";
import { SPECIES } from "@/lib/data";
import { SpeciesPicker } from "./SpeciesPicker";
import { VoiceToggle } from "./VoiceToggle";
import { useSpoken } from "@/lib/coach";

type Match = { speciesId: string | null; latin: string; common: string | null; score: number };

/** Below this it offers a guess. At or above it, it fills the answer in. */
const SURE = 0.3;
import { id, putPhoto, putPlant } from "@/lib/store";

type Step = "photo" | "what" | "where";

/**
 * Registering a plant.
 *
 * Three steps and they are in this order on purpose. The photograph comes
 * first because it is the one thing that has to happen while you are standing
 * in front of the plant, and it becomes the baseline every later photograph is
 * measured against. Naming it and saying where it lives can be done from the
 * sofa afterwards.
 *
 * The coordinates are taken from the device rather than typed, because a
 * registered spot that somebody chose by hand proves nothing later.
 */
export function AddPlant({ offset }: { offset: number }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("photo");
  const [shot, setShot] = useState<Shot>();
  const [speciesId, setSpeciesId] = useState("");
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [at, setAt] = useState<{ lat: number; lon: number }>();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [asking, setAsking] = useState<"offer" | "working" | "done" | "off">("offer");
  const [matches, setMatches] = useState<Match[]>([]);

  useSpoken(
    step,
    step === "photo"
      ? "Photograph the whole plant, with the soil around its base in frame. This one becomes its baseline."
      : step === "what"
        ? "Search for it by name, or have the photograph identified for you."
        : "Give it a name you would actually use, and tap to use where you are now.",
  );

  /**
   * Identification is offered, never assumed.
   *
   * This is the only moment in the app when a photograph leaves the phone, so
   * it happens on a tap, after a sentence that says exactly that. Saying no
   * leaves the picker exactly as it was.
   */
  async function identify() {
    if (!shot) return;
    setAsking("working");
    try {
      const body = new FormData();
      body.append("image", shot.full, "plant.jpg");
      const res = await fetch("/api/identify", { method: "POST", body });
      const data = await res.json();
      const found: Match[] = Array.isArray(data.matches) ? data.matches : [];
      setMatches(found);
      // Only pre-select when it is actually sure. A studio cutout of a curry
      // branch came back as jasmine at nine percent, and an app that fills the
      // answer in at nine percent is an app that teaches people to stop
      // reading it.
      const best = found.find((m) => m.speciesId && m.score >= SURE);
      if (best?.speciesId) setSpeciesId(best.speciesId);
    } catch {
      setMatches([]);
    }
    setAsking("done");
  }

  function locate() {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setAt({ lat: p.coords.latitude, lon: p.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function save() {
    if (!shot || !speciesId || saving) return;
    setSaving(true);

    const plantId = id();
    const photoId = id();

    await putPhoto({
      id: photoId,
      plantId,
      at: new Date().toISOString(),
      kind: "baseline",
      full: shot.full,
      thumb: shot.thumb,
      note: "The day it went in.",
    });

    const sp = SPECIES.find((s) => s.id === speciesId)!;
    await putPlant({
      id: plantId,
      name: name.trim() || sp.name,
      speciesId,
      place: place.trim() || "home",
      plantedOn: new Date().toISOString().slice(0, 10),
      // Without a fix the plant still registers. The location check on its
      // first proof simply has nothing to compare against and says so.
      lat: at?.lat ?? 0,
      lon: at?.lon ?? 0,
      streak: 0,
      points: 0,
      lastWatered: offset,
      lastFertilised: offset,
      lastCheckin: offset,
      lastPest: offset,
      baselinePhotoId: photoId,
    });

    router.push(`/plants/${plantId}`);
  }

  if (step === "photo")
    return (
      <AppShell>
        <AppHeader
          back="/plants"
          eyebrow="Step one of three"
          title="Photograph it."
          right={<VoiceToggle />}
          lede="This one becomes the baseline. Every later photograph of this plant is measured against it, so take it where the plant actually stands."
        />
        <Camera
          instruction="Get the whole plant and the soil around its base in frame."
          kind="water"
          onShot={(s) => {
            setShot(s);
            setStep("what");
          }}
        />
      </AppShell>
    );

  if (step === "what")
    return (
      <AppShell>
        <AppHeader
          back="/plants"
          eyebrow="Step two of three"
          title="What is it?"
          right={<VoiceToggle />}
        />
        <main className="app-column pb-12">
          <Identify
            state={asking}
            matches={matches}
            onAsk={identify}
            onSkip={() => setAsking("off")}
          />

          <p className="mt-7 max-w-[28rem] text-[14px] leading-relaxed text-faint">
            The species is what sets the schedule: how often it wants water,
            what to feed it and what goes wrong with it. Your weather then moves
            that day by day.
          </p>

          <div className="mt-2">
            <SpeciesPicker
              value={speciesId}
              onPick={setSpeciesId}
              suggested={matches.map((m) => m.speciesId).filter(Boolean) as string[]}
            />
          </div>

          <button
            className={`${ACTION} mt-9 w-full`}
            type="button"
            disabled={!speciesId}
            onClick={() => setStep("where")}
            style={{ opacity: speciesId ? 1 : 0.4 }}
          >
            <span className="btn-label">Next</span>
            <span className="btn-arrow" aria-hidden>
              →
            </span>
          </button>
        </main>
      </AppShell>
    );

  return (
    <AppShell>
      <AppHeader
        back="/plants"
        eyebrow="Step three of three"
        title="Where does it live?"
        right={<VoiceToggle />}
      />
      <main className="app-column pb-12">
        <div className="flex items-start gap-5">
          <BlobImage
            blob={shot?.thumb}
            alt=""
            className="h-[104px] w-[78px] shrink-0 rounded-[12px] object-cover"
          />
          <p className="prose text-[15px] text-body">
            Give it a name you would actually use, and say roughly where it stands. Both
            are for you: neither is shown anywhere public.
          </p>
        </div>

        <label className="field mt-8 flex flex-col gap-1 py-4">
          <span className="label">Call it</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={SPECIES.find((s) => s.id === speciesId)?.name ?? "Neem"}
            className="h-8 bg-transparent text-[16.5px] text-cream outline-none placeholder:text-faint"
          />
        </label>

        <label className="field flex flex-col gap-1 py-4">
          <span className="label">Where it stands</span>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="backyard"
            className="h-8 bg-transparent text-[16.5px] text-cream outline-none placeholder:text-faint"
          />
        </label>

        <div className="field flex flex-col gap-1 py-4">
          <span className="label">Its spot</span>
          {at ? (
            <p className="num mt-1 text-[15px] text-moss">
              {at.lat.toFixed(4)}, {at.lon.toFixed(4)}
            </p>
          ) : (
            <button
              type="button"
              onClick={locate}
              className="link-arrow mt-1 inline-flex self-start text-cream"
            >
              <span className="link-text text-[16px]">
                {locating ? "Reading the spot" : "Use where I am now"}
              </span>
            </button>
          )}
          <span className="mt-1.5 text-[14px] leading-[1.6] text-faint">
            Taken from the device, never typed. Later photographs have to come from here,
            and the plant appears in an area rather than at an address.
          </span>
        </div>

        <button className={`${ACTION} mt-9 w-full`} type="button" onClick={save}>
          <span className="btn-label">{saving ? "Registering" : "Register it"}</span>
          <span className="btn-arrow" aria-hidden>
            →
          </span>
        </button>
      </main>
    </AppShell>
  );
}

function Identify({
  state,
  matches,
  onAsk,
  onSkip,
}: {
  state: "offer" | "working" | "done" | "off";
  matches: Match[];
  onAsk: () => void;
  onSkip: () => void;
}) {
  if (state === "off") return null;

  if (state === "offer")
    return (
      <div className="rounded-[16px] border border-line-soft bg-surface p-5">
        <p className="text-[15px] leading-relaxed text-cream">
          Not sure what it is? The photograph can be identified for you.
        </p>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-faint">
          This is the only time a photograph leaves your phone. It goes to a
          plant identification service and nowhere else, and only this one.
        </p>
        <div className="mt-5 flex items-center gap-5">
          <button type="button" onClick={onAsk} className="link-arrow inline-flex text-cream">
            <span className="link-text font-semibold">Identify it</span>
          </button>
          <button type="button" onClick={onSkip} className="text-[14px] text-faint">
            I know what it is
          </button>
        </div>
      </div>
    );

  if (state === "working")
    return <p className="label py-2 text-faint">Looking at your photograph</p>;

  const top = matches[0];

  if (!top)
    return (
      <p className="text-[14.5px] leading-relaxed text-faint">
        That one could not be identified. Pick it below.
      </p>
    );

  const sure = top.score >= SURE;
  const ours = Boolean(top.speciesId);

  return (
    <div className="rise-in rounded-[16px] border border-line-soft bg-surface p-5">
      <p
        className="label"
        style={{ color: sure && ours ? "var(--verified)" : "var(--gold)" }}
      >
        {sure ? (ours ? "Looks like" : "Closest match") : "Not sure from this one"}
      </p>
      <p className="display mt-1.5 text-[24px] text-cream">{top.common ?? top.latin}</p>
      <p className="num mt-1 text-[12.5px] text-faint">
        {top.latin} · {Math.round(top.score * 100)}% confident
      </p>
      <p className="mt-3 max-w-[27rem] text-[13.5px] leading-relaxed text-faint">
        {!sure
          ? "Too unsure to fill in for you. Its guesses are at the front of the list below, but look before you tap."
          : ours
            ? "Selected below. Change it if that is not right."
            : "Not one of the twelve this app carries a care profile for, so pick the closest below."}
      </p>
    </div>
  );
}
