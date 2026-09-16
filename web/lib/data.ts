/**
 * Everything the app knows, in one place.
 *
 * The care profiles are hand-authored. Watering intervals are a starting
 * point that the weather then moves, and the instruction a plant gives is
 * written so somebody can check it against what is in front of them rather
 * than trusting a number.
 *
 * The plants below are the seeded demo account. Two of them are already due,
 * because a schedule cannot be demonstrated by waiting for it.
 */

export type TaskKind = "water" | "fertilise" | "checkin" | "pest";

export type Species = {
  id: string;
  name: string;
  latin: string;
  waterEvery: number;
  fertiliseEvery: number;
  advice: string;
  /** What to feed it with, and how much. Organic first, every time. */
  feedWith: string;
  /** What actually goes wrong with this plant, and what to do about it. */
  pestWatch: string;
  /** Photograph under public/plants. A plant is known by sight, not by name. */
  photo: string;
};

export type Plant = {
  id: string;
  name: string;
  speciesId: string;
  place: string;
  plantedOn: string;
  lat: number;
  lon: number;
  streak: number;
  points: number;
  lastWatered: string;
  lastFertilised: string;
};

export const SPECIES: Species[] = [
  {
    id: "neem",
    name: "Neem",
    latin: "Azadirachta indica",
    waterEvery: 3,
    fertiliseEvery: 45,
    advice: "Water when the soil is dry two inches down.",
    feedWith: "A handful of compost worked into the top inch. Neem asks for very little.",
    pestWatch: "Look under the leaves for scale and mealybug. Wipe them off with soapy water before you reach for anything stronger.",
    photo: "/plants/neem.jpg",
  },
  {
    id: "peepal",
    name: "Peepal",
    latin: "Ficus religiosa",
    waterEvery: 4,
    fertiliseEvery: 60,
    advice: "Keep it damp while it is young, never waterlogged.",
    feedWith: "Compost twice a year. Young ones take a spoon of vermicompost.",
    pestWatch: "Leaf-eating caterpillars in the monsoon. Pick them off by hand, they are large and few.",
    photo: "/plants/peepal.jpg",
  },
  {
    id: "mango",
    name: "Mango",
    latin: "Mangifera indica",
    waterEvery: 5,
    fertiliseEvery: 40,
    advice: "Deep soak rather than a daily splash.",
    feedWith: "Well-rotted manure at the drip line, never against the trunk.",
    pestWatch: "Hoppers and powdery mildew before flowering. Neem oil spray at dusk, not in the sun.",
    photo: "/plants/mango.jpg",
  },
  {
    id: "banyan",
    name: "Banyan",
    latin: "Ficus benghalensis",
    waterEvery: 4,
    fertiliseEvery: 60,
    advice: "Water around the drip line, not against the trunk.",
    feedWith: "Compost at the drip line once a season.",
    pestWatch: "Mostly untroubled. Check aerial roots for borer holes.",
    photo: "/plants/peepal.jpg",
  },
  {
    id: "gulmohar",
    name: "Gulmohar",
    latin: "Delonix regia",
    waterEvery: 4,
    fertiliseEvery: 50,
    advice: "Let the top of the soil dry between waterings.",
    feedWith: "A light compost dressing before the rains.",
    pestWatch: "Defoliating caterpillars after the first rain. Hand-pick, they pass in a fortnight.",
    photo: "/plants/hibiscus.jpg",
  },
  {
    id: "tulsi",
    name: "Tulsi",
    latin: "Ocimum tenuiflorum",
    waterEvery: 2,
    fertiliseEvery: 30,
    advice: "Morning water, and pinch the flower spikes off.",
    feedWith: "A pinch of vermicompost every few weeks. It wants little and often.",
    pestWatch: "Aphids and whitefly on the new growth. A spray of water with a little soap clears them.",
    photo: "/plants/tulsi.jpg",
  },
  {
    id: "money-plant",
    name: "Money plant",
    latin: "Epipremnum aureum",
    waterEvery: 6,
    fertiliseEvery: 40,
    advice: "Wait until the top inch is properly dry.",
    feedWith: "Quarter-strength liquid feed, and skip it in winter.",
    pestWatch: "Mealybug in the leaf joints. Dab with cotton and diluted alcohol.",
    photo: "/plants/money-plant.jpg",
  },
  {
    id: "curry-leaf",
    name: "Curry leaf",
    latin: "Murraya koenigii",
    waterEvery: 3,
    fertiliseEvery: 35,
    advice: "It likes sun and dislikes sitting in water.",
    feedWith: "Compost plus a spoon of curd water once a month, the old way.",
    pestWatch: "Citrus butterfly caterpillars and psyllids. Pick the caterpillars off, they are easy to see.",
    photo: "/plants/neem.jpg",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    latin: "Hibiscus rosa-sinensis",
    waterEvery: 2,
    fertiliseEvery: 25,
    advice: "Water daily in summer, half that once it cools.",
    feedWith: "Potash-rich feed while it is flowering.",
    pestWatch: "Aphids on buds, and bud drop from mealybug. Soapy water first, neem oil only if it spreads.",
    photo: "/plants/hibiscus.jpg",
  },
  {
    id: "aloe",
    name: "Aloe vera",
    latin: "Aloe barbadensis",
    waterEvery: 10,
    fertiliseEvery: 90,
    advice: "Far less water than feels right. Let it dry out.",
    feedWith: "Almost nothing. A little compost once a year.",
    pestWatch: "Root rot from overwatering is the real risk, not pests.",
    photo: "/plants/aloe.jpg",
  },
  {
    id: "jamun",
    name: "Jamun",
    latin: "Syzygium cumini",
    waterEvery: 4,
    fertiliseEvery: 50,
    advice: "Steady moisture through the first two summers.",
    feedWith: "Manure before the rains, once a year.",
    pestWatch: "Fruit flies and leaf spot. Clear fallen fruit rather than spraying.",
    photo: "/plants/mango.jpg",
  },
  {
    id: "ashoka",
    name: "Ashoka",
    latin: "Saraca asoca",
    waterEvery: 3,
    fertiliseEvery: 45,
    advice: "Shade-tolerant, but thirsty while it establishes.",
    feedWith: "Compost twice a year while it establishes.",
    pestWatch: "Leaf webber and scale. Prune the affected shoots out.",
    photo: "/plants/sapling.jpg",
  },
];

export const PLANTS: Plant[] = [
  {
    id: "neem-1",
    name: "Neem",
    speciesId: "neem",
    place: "backyard",
    plantedOn: "2026-06-14",
    lat: 26.9124,
    lon: 75.7873,
    streak: 12,
    points: 820,
    lastWatered: "-5",
    lastFertilised: "-20",
  },
  {
    id: "tulsi-1",
    name: "Tulsi",
    speciesId: "tulsi",
    place: "balcony",
    plantedOn: "2026-08-02",
    lat: 26.9126,
    lon: 75.787,
    streak: 6,
    points: 310,
    lastWatered: "-2",
    lastFertilised: "-12",
  },
  {
    id: "money-1",
    name: "Money plant",
    speciesId: "money-plant",
    place: "living room",
    plantedOn: "2026-05-20",
    lat: 26.9125,
    lon: 75.7871,
    streak: 21,
    points: 1010,
    lastWatered: "-3",
    lastFertilised: "-38",
  },
];

export function species(id: string): Species {
  const found = SPECIES.find((s) => s.id === id);
  if (!found) throw new Error("unknown species: " + id);
  return found;
}

export function plant(id: string): Plant | undefined {
  return PLANTS.find((p) => p.id === id);
}

export const POINTS: Record<TaskKind, number> = {
  water: 30,
  fertilise: 50,
  checkin: 15,
  pest: 35,
};

export const TASK_LABEL: Record<TaskKind, string> = {
  water: "Water it",
  fertilise: "Feed it",
  checkin: "Check the leaves",
  pest: "Check for pests",
};

/**
 * What the proof photo has to show. This is shown to the user before the
 * camera opens, and it is the same thing the verifier checks. A user who
 * follows the instruction passes every time.
 */
export const TASK_INSTRUCTION: Record<TaskKind, string> = {
  water:
    "Photograph the plant while you pour. Keep the base of the plant and the wet soil both in frame.",
  fertilise:
    "Photograph the base of the plant with the feed spread on the soil, before you water it in.",
  checkin:
    "Photograph the whole plant, close enough that the leaves are clear.",
  pest:
    "Photograph the underside of a few leaves and the new growth, close. That is where trouble starts and where it is visible first.",
};

/** The streak multiplier. Consistency is worth more than a single burst. */
export function multiplier(streak: number): number {
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.4;
  if (streak >= 7) return 1.2;
  return 1;
}

export function pointsFor(kind: TaskKind, streak: number): number {
  return Math.round(POINTS[kind] * multiplier(streak));
}

export const TOTAL_POINTS = 2140;
