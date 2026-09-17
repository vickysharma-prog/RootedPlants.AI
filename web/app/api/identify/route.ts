import { SPECIES } from "@/lib/data";

/**
 * What plant is this?
 *
 * The photograph goes to PlantNet, which is a real identification service with
 * a herbarium behind it, and comes back as a ranked list of species. Before
 * this existed I measured whether the app could do it on the device from
 * colour and texture alone: it got the right species first 0 times out of 17,
 * which is worse than guessing, so it was never going to ship that way.
 *
 * The key lives here and never reaches the browser. This is also the only
 * moment in the whole app when a photograph leaves the device, which is why
 * the screen that calls it says so and asks first.
 */

const PLANTNET = "https://my-api.plantnet.org/v2/identify/all";

/**
 * Below this, it is not a plant.
 *
 * Measured rather than picked. Random noise comes back as a 404, a flat wall
 * scored 0.5% and a plain object 0.2%, while the least convincing real plant
 * photograph in testing, a curry branch on a white studio background, still
 * scored 9%. Three percent sits in the gap with nothing near it.
 */
const PLANT_MIN = 0.03;

type Match = {
  /** One of our twelve, when the answer is one of them. */
  speciesId: string | null;
  /** What PlantNet actually said, so the screen never has to pretend. */
  latin: string;
  common: string | null;
  /** 0 to 1. */
  score: number;
};

export async function POST(request: Request) {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) return Response.json({ error: "not-configured" }, { status: 503 });

  const incoming = await request.formData();
  const image = incoming.get("image");
  if (!(image instanceof Blob))
    return Response.json({ error: "no-image" }, { status: 400 });

  const body = new FormData();
  body.append("images", image, "plant.jpg");
  // "auto" lets it decide whether it is looking at a leaf, a flower or the
  // whole plant, which is the right call when somebody is photographing a pot
  // on a balcony rather than filling in a botany form.
  body.append("organs", "auto");

  let data: unknown;
  try {
    const res = await fetch(`${PLANTNET}?api-key=${key}&include-related-images=false`, {
      method: "POST",
      body,
    });
    // A 404 here is not a failure, it is an answer: PlantNet says it cannot
    // find a species, which for a photograph of a wall or a mug is exactly
    // right. Noise came back 404, a wall scored 0.5% and a mug 0.2%, while the
    // weakest real plant in testing scored 9%, so "not a plant" is a real
    // reading rather than an error to swallow.
    if (res.status === 404) return Response.json({ matches: [], plant: false });
    if (!res.ok) return Response.json({ error: "upstream", status: res.status }, { status: 502 });
    data = await res.json();
  } catch {
    return Response.json({ error: "unreachable" }, { status: 502 });
  }

  const matches = rank(data);
  const best = matches[0]?.score ?? 0;
  return Response.json({ matches, plant: best >= PLANT_MIN, confidence: best });
}

/**
 * PlantNet answers in Latin. Our twelve species carry their Latin names, so
 * the mapping is a string comparison, and anything it names that we do not
 * grow still comes back with its own name rather than being dropped.
 */
function rank(data: unknown): Match[] {
  const results = (data as { results?: unknown[] })?.results ?? [];

  return results.slice(0, 5).map((raw) => {
    const r = raw as {
      score?: number;
      species?: { scientificNameWithoutAuthor?: string; commonNames?: string[] };
    };
    const latin = r.species?.scientificNameWithoutAuthor ?? "";
    const common = r.species?.commonNames?.[0] ?? null;
    const norm = latin.toLowerCase().trim();

    const ours =
      SPECIES.find((s) => s.latin.toLowerCase() === norm) ??
      // Genus alone is often enough: Ficus religiosa against Ficus benghalensis
      // is a real distinction, but Ocimum tenuiflorum against Ocimum basilicum
      // is the difference between tulsi and the basil next to it, and either
      // wants the same care from us.
      SPECIES.find((s) => s.latin.toLowerCase().split(" ")[0] === norm.split(" ")[0]);

    return {
      speciesId: ours?.id ?? null,
      latin,
      common,
      score: typeof r.score === "number" ? r.score : 0,
    };
  });
}
