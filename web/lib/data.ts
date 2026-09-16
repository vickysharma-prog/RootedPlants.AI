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

export type TaskKind = "water" | "fertilise" | "checkin";

export type Species = {
  id: string;
  name: string;
  latin: string;
  waterEvery: number;
  fertiliseEvery: number;
  advice: string;
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
    photo: "/plants/neem.jpg",
  },
  {
    id: "peepal",
    name: "Peepal",
    latin: "Ficus religiosa",
    waterEvery: 4,
    fertiliseEvery: 60,
    advice: "Keep it damp while it is young, never waterlogged.",
    photo: "/plants/peepal.jpg",
  },
  {
    id: "mango",
    name: "Mango",
    latin: "Mangifera indica",
    waterEvery: 5,
    fertiliseEvery: 40,
    advice: "Deep soak rather than a daily splash.",
    photo: "/plants/mango.jpg",
  },
  {
    id: "banyan",
    name: "Banyan",
    latin: "Ficus benghalensis",
    waterEvery: 4,
    fertiliseEvery: 60,
    advice: "Water around the drip line, not against the trunk.",
    photo: "/plants/peepal.jpg",
  },
  {
    id: "gulmohar",
    name: "Gulmohar",
    latin: "Delonix regia",
    waterEvery: 4,
    fertiliseEvery: 50,
    advice: "Let the top of the soil dry between waterings.",
    photo: "/plants/hibiscus.jpg",
  },
  {
    id: "tulsi",
    name: "Tulsi",
    latin: "Ocimum tenuiflorum",
    waterEvery: 2,
    fertiliseEvery: 30,
    advice: "Morning water, and pinch the flower spikes off.",
    photo: "/plants/tulsi.jpg",
  },
  {
    id: "money-plant",
    name: "Money plant",
    latin: "Epipremnum aureum",
    waterEvery: 6,
    fertiliseEvery: 40,
    advice: "Wait until the top inch is properly dry.",
    photo: "/plants/money-plant.jpg",
  },
  {
    id: "curry-leaf",
    name: "Curry leaf",
    latin: "Murraya koenigii",
    waterEvery: 3,
    fertiliseEvery: 35,
    advice: "It likes sun and dislikes sitting in water.",
    photo: "/plants/neem.jpg",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    latin: "Hibiscus rosa-sinensis",
    waterEvery: 2,
    fertiliseEvery: 25,
    advice: "Water daily in summer, half that once it cools.",
    photo: "/plants/hibiscus.jpg",
  },
  {
    id: "aloe",
    name: "Aloe vera",
    latin: "Aloe barbadensis",
    waterEvery: 10,
    fertiliseEvery: 90,
    advice: "Far less water than feels right. Let it dry out.",
    photo: "/plants/aloe.jpg",
  },
  {
    id: "jamun",
    name: "Jamun",
    latin: "Syzygium cumini",
    waterEvery: 4,
    fertiliseEvery: 50,
    advice: "Steady moisture through the first two summers.",
    photo: "/plants/mango.jpg",
  },
  {
    id: "ashoka",
    name: "Ashoka",
    latin: "Saraca asoca",
    waterEvery: 3,
    fertiliseEvery: 45,
    advice: "Shade-tolerant, but thirsty while it establishes.",
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
};

export const TASK_LABEL: Record<TaskKind, string> = {
  water: "Water it",
  fertilise: "Feed it",
  checkin: "Check the leaves",
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
