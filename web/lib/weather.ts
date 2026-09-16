/**
 * Local weather, from open-meteo. No key, which matters when the demo runs
 * on somebody else's machine.
 *
 * This is what makes the schedule more than a timer: rain in the last few
 * days pushes watering out, a hot day pulls it in. If the call fails the app
 * carries on with the plain schedule, because a care reminder that waits on
 * an API is worse than one that is a day out.
 */

export type Weather = {
  rainLast3: number;
  maxTempToday: number;
  rainNext2: number;
  live: boolean;
};

const FALLBACK: Weather = {
  rainLast3: 0,
  maxTempToday: 31,
  rainNext2: 0,
  live: false,
};

export async function weatherAt(lat: number, lon: number): Promise<Weather> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
    "&daily=precipitation_sum,temperature_2m_max" +
    "&past_days=3&forecast_days=3&timezone=auto";

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return FALLBACK;

    const json = (await res.json()) as {
      daily?: { precipitation_sum?: (number | null)[]; temperature_2m_max?: (number | null)[] };
    };

    const rain = json.daily?.precipitation_sum ?? [];
    const temp = json.daily?.temperature_2m_max ?? [];
    if (rain.length < 4 || temp.length < 4) return FALLBACK;

    const num = (v: number | null | undefined) => (typeof v === "number" ? v : 0);

    return {
      rainLast3: rain.slice(0, 3).reduce<number>((a, b) => a + num(b), 0),
      maxTempToday: Math.round(num(temp[3])),
      rainNext2: rain.slice(4, 6).reduce<number>((a, b) => a + num(b), 0),
      live: true,
    };
  } catch {
    return FALLBACK;
  }
}

/**
 * How many days the weather moves the next watering by. Rain that has already
 * fallen buys time; heat spends it.
 */
export function shift(w: Weather): number {
  let days = 0;
  if (w.rainLast3 >= 10) days += 2;
  else if (w.rainLast3 >= 3) days += 1;
  if (w.maxTempToday >= 36) days -= 1;
  return days;
}

/** The one line under a task that shows the app has been paying attention. */
export function why(w: Weather, days: number): string {
  const heat = `${w.maxTempToday}° today`;
  if (w.rainLast3 >= 3) return `${w.rainLast3.toFixed(0)}mm of rain recently, ${heat}`;
  if (days >= 5) return `No rain for ${days} days, ${heat}`;
  return `Dry since you last watered, ${heat}`;
}
