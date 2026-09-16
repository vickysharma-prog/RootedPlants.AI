"""Find a forest video for the backdrop, and look at it before using it.

Pexels, whose licence needs no attribution. Search is not enough on its own:
a query for "forest wind" returns a person walking through a park about as
often as it returns trees. So this downloads candidates, pulls four frames
from each, and lays them out as one contact sheet to judge before anything
ships.

    python tools/fetch_forest_video.py              # gather + contact sheet
    python tools/fetch_forest_video.py 3            # keep candidate 3

The key lives in web/.env.local and is never committed.
"""

import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
STAGE = ROOT / "web" / "public" / "video" / "_candidates"
OUT = ROOT / "web" / "public" / "video"

QUERIES = [
    "forest wind trees",
    "trees swaying wind",
    "forest canopy green",
    "bamboo forest wind",
    "rainforest trees",
]


def key() -> str:
    env = (ROOT / "web" / ".env.local").read_text(encoding="utf-8")
    m = re.search(r"PEXELS_API_KEY=(\S+)", env)
    if not m:
        sys.exit("PEXELS_API_KEY missing from web/.env.local")
    return m.group(1)


def api(url: str) -> dict:
    # Pexels refuses urllib's default agent, so say who we are.
    req = urllib.request.Request(
        url, headers={"Authorization": key(), "User-Agent": "rooted/1.0"}
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def best_file(files: list[dict]) -> dict | None:
    """The smallest file at least 1080 tall. Big enough to hold up, small
    enough to download while somebody is waiting."""
    ok = [f for f in files if f.get("height", 0) >= 1000 and f.get("file_type") == "video/mp4"]
    if not ok:
        ok = [f for f in files if f.get("file_type") == "video/mp4"]
    return min(ok, key=lambda f: f.get("height", 0)) if ok else None


def frames(src: pathlib.Path, dst: pathlib.Path) -> bool:
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src),
        "-vf", r"select='eq(n\,20)+eq(n\,90)+eq(n\,160)+eq(n\,230)',scale=240:-1,tile=4x1",
        "-frames:v", "1", str(dst),
    ]
    return subprocess.run(cmd).returncode == 0


def gather() -> None:
    STAGE.mkdir(parents=True, exist_ok=True)
    meta, n = [], 0

    for q in QUERIES:
        qs = urllib.parse.urlencode(
            {"query": q, "orientation": "portrait", "size": "medium", "per_page": 6}
        )
        try:
            hits = api("https://api.pexels.com/videos/search?" + qs).get("videos", [])
        except Exception as exc:
            print(f"  search failed for {q}: {exc}", file=sys.stderr)
            continue

        for v in hits:
            f = best_file(v.get("video_files", []))
            if not f or v.get("duration", 0) < 6:
                continue

            n += 1
            path = STAGE / f"{n:02d}.mp4"
            try:
                req = urllib.request.Request(f["link"], headers={"User-Agent": "rooted/1.0"})
                with urllib.request.urlopen(req, timeout=180) as r, open(path, "wb") as out:
                    out.write(r.read())
            except Exception as exc:
                print(f"  download failed: {exc}", file=sys.stderr)
                n -= 1
                continue

            frames(path, STAGE / f"{n:02d}.jpg")
            mb = path.stat().st_size / 1048576
            meta.append({"n": n, "query": q, "id": v.get("id"), "duration": v.get("duration"),
                         "w": f.get("width"), "h": f.get("height"), "url": v.get("url")})
            print(f"{n:02d}  {mb:5.1f}MB  {v.get('duration')}s  {f.get('width')}x{f.get('height')}  {q}")

    (STAGE / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    sheets = sorted(STAGE.glob("*.jpg"))
    if sheets:
        from PIL import Image, ImageDraw
        tiles = [Image.open(p) for p in sheets]
        w = max(t.width for t in tiles)
        sheet = Image.new("RGB", (w, sum(t.height + 20 for t in tiles)), "#111")
        draw = ImageDraw.Draw(sheet)
        y = 0
        for p, t in zip(sheets, tiles):
            draw.text((6, y + 4), p.stem, fill="#ffd27a")
            sheet.paste(t, (0, y + 20))
            y += t.height + 20
        sheet.save(STAGE / "sheet.jpg", "JPEG", quality=84)
        print(f"\n{n} candidates. Sheet: {STAGE / 'sheet.jpg'}")


def keep(num: str) -> None:
    src = STAGE / f"{int(num):02d}.mp4"
    if not src.exists():
        sys.exit(f"no candidate {num}")

    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / "forest.mp4"
    poster = OUT / "forest-poster.jpg"

    # Twelve seconds, portrait, muted, small enough to start almost at once.
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src),
        "-t", "12", "-an",
        "-vf", "scale=-2:1280,crop=720:1280",
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
        "-crf", "30", "-preset", "slow", "-movflags", "+faststart",
        str(mp4),
    ], check=True)

    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp4),
        "-ss", "0.4", "-frames:v", "1", "-q:v", "6", str(poster),
    ], check=True)

    meta = {m["n"]: m for m in json.loads((STAGE / "meta.json").read_text(encoding="utf-8"))}
    (OUT / "source.json").write_text(
        json.dumps({"file": "video/forest.mp4", "licence": "Pexels licence, no attribution required",
                    "source": meta[int(num)]["url"]}, indent=2), encoding="utf-8")

    print(f"forest.mp4  {mp4.stat().st_size // 1024}kB")
    print(f"poster      {poster.stat().st_size // 1024}kB")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        keep(sys.argv[1])
    else:
        gather()
