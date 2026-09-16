import { weatherAt } from "@/lib/weather";

/**
 * Weather over one plant, fetched on our side.
 *
 * The browser holds the plants, so it is the browser that asks. Going through
 * here keeps the upstream call cached across every account looking at roughly
 * the same sky, and keeps the schedule working when that upstream is down.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    return Response.json({ error: "lat and lon required" }, { status: 400 });

  return Response.json(await weatherAt(lat, lon));
}
