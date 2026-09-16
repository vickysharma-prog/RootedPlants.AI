"""Gather forest photo candidates and lay them out as one contact sheet.

Search alone is not enough: a query for "misty forest" returns a foggy city
street often enough that every image has to be looked at before it ships.
This pulls a wide set, numbers them, and writes a single sheet to look at.

    python tools/forest_candidates.py            # build the sheet
    python tools/forest_candidates.py 3 7 11     # keep these, by number
"""

import io
import json
import pathlib
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageDraw

API = "https://api.openverse.org/v1/images/"
ROOT = pathlib.Path(__file__).resolve().parent.parent
STAGE = ROOT / "web" / "public" / "forest" / "_candidates"
OUT = ROOT / "web" / "public" / "forest"
W, H = 900, 1600

QUERIES = [
    "forest fog trees trunks",
    "dense forest trees tall",
    "woodland trees path",
    "rainforest trees green",
    "forest morning light trees",
    "pine forest trunks",
]

COLS, CELL = 4, 220


def get(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "rooted/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def search(query: str, n: int = 4):
    qs = urllib.parse.urlencode(
        {"q": query, "license": "cc0,pdm", "page_size": n, "mature": "false"}
    )
    return json.loads(get(API + "?" + qs)).get("results", [])


def portrait(im: Image.Image) -> Image.Image:
    target = W / H
    if im.width / im.height > target:
        side = int(im.height * target)
        im = im.crop(((im.width - side) // 2, 0, (im.width - side) // 2 + side, im.height))
    else:
        side = int(im.width / target)
        top = max(0, (im.height - side) // 2)
        im = im.crop((0, top, im.width, top + side))
    return im.resize((W, H), Image.LANCZOS)


def gather() -> None:
    STAGE.mkdir(parents=True, exist_ok=True)
    meta, n = [], 0

    for q in QUERIES:
        for hit in search(q):
            url = hit.get("url")
            if not url:
                continue
            try:
                im = Image.open(io.BytesIO(get(url))).convert("RGB")
                if im.width < 800 or im.height < 600:
                    continue
                im = portrait(im)
            except Exception as exc:
                print(f"  skip: {exc}", file=sys.stderr)
                continue

            n += 1
            im.save(STAGE / f"{n:02d}.jpg", "JPEG", quality=80, optimize=True)
            meta.append({"n": n, "query": q, "license": hit.get("license"),
                         "title": (hit.get("title") or "")[:60],
                         "source": hit.get("foreign_landing_url")})
            print(f"{n:02d}  {hit.get('license'):4s}  {q[:26]:28s} {(hit.get('title') or '')[:40]}")

    (STAGE / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    rows = (n + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL, rows * (CELL + 22)), "#111")
    draw = ImageDraw.Draw(sheet)
    for i in range(1, n + 1):
        th = Image.open(STAGE / f"{i:02d}.jpg").resize((CELL, CELL), Image.LANCZOS)
        c, r = (i - 1) % COLS, (i - 1) // COLS
        sheet.paste(th, (c * CELL, r * (CELL + 22) + 22))
        draw.text((c * CELL + 6, r * (CELL + 22) + 5), f"{i:02d}", fill="#ffd27a")

    sheet.save(STAGE / "sheet.jpg", "JPEG", quality=85)
    print(f"\n{n} candidates. Sheet: {STAGE / 'sheet.jpg'}")


def keep(numbers: list[str]) -> None:
    meta = {m["n"]: m for m in json.loads((STAGE / "meta.json").read_text(encoding="utf-8"))}
    names = ["canopy", "deep", "mist", "path", "light"]
    record = []

    for slot, raw in enumerate(numbers):
        i = int(raw)
        im = Image.open(STAGE / f"{i:02d}.jpg")
        name = names[slot] if slot < len(names) else f"forest{slot}"
        im.save(OUT / f"{name}.jpg", "JPEG", quality=74, optimize=True, progressive=True)
        m = meta[i]
        record.append({"file": f"forest/{name}.jpg", "license": m["license"],
                       "query": m["query"], "source": m["source"]})
        print(f"{name:8s} <- {i:02d}  {m['license']}  {m['title']}")

    (OUT / "sources.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(f"\n{len(record)} kept")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        keep(sys.argv[1:])
    else:
        gather()
