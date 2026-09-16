"""Pull plant photographs for the seeded demo account.

Openverse, filtered to CC0 and Public Domain Mark only, so nothing here
carries an attribution condition. Each one is cropped square and saved small,
because these are thumbnails and a card should not cost a megabyte.

    python tools/fetch_plant_photos.py

Writes to web/public/plants/ and prints what it took and from where. The
record it prints belongs in the repo, so the provenance of every image is
answerable later.
"""

import io
import json
import pathlib
import sys
import urllib.parse
import urllib.request

from PIL import Image

API = "https://api.openverse.org/v1/images/"
OUT = pathlib.Path(__file__).resolve().parent.parent / "web" / "public" / "plants"
SIZE = 640

WANTED = [
    ("neem", "neem tree leaves"),
    ("tulsi", "holy basil tulsi plant"),
    ("money-plant", "pothos houseplant"),
    ("mango", "mango sapling tree"),
    ("peepal", "ficus religiosa leaves"),
    ("sapling", "tree sapling planted soil"),
    ("hibiscus", "hibiscus plant flower"),
    ("aloe", "aloe vera plant pot"),
]


def get(url: str, timeout: int = 40) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "rooted/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def search(query: str):
    qs = urllib.parse.urlencode(
        {"q": query, "license": "cc0,pdm", "page_size": 8, "mature": "false"}
    )
    data = json.loads(get(API + "?" + qs))
    return data.get("results", [])


def square(raw: bytes) -> Image.Image:
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    side = min(im.size)
    left = (im.width - side) // 2
    # Crop a little above centre: a plant's subject sits high in the frame.
    top = max(0, (im.height - side) // 2 - int(side * 0.06))
    im = im.crop((left, top, left + side, top + side))
    return im.resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    record = []

    for name, query in WANTED:
        got = False
        for hit in search(query):
            url = hit.get("url")
            if not url:
                continue
            try:
                im = square(get(url))
            except Exception as exc:
                print(f"  skip {name}: {exc}", file=sys.stderr)
                continue

            path = OUT / f"{name}.jpg"
            im.save(path, "JPEG", quality=82, optimize=True)
            kb = path.stat().st_size // 1024
            print(f"{name:12s} {kb:4d}kB  {hit.get('license')}  {hit.get('title')}")
            record.append(
                {
                    "file": f"plants/{name}.jpg",
                    "query": query,
                    "license": hit.get("license"),
                    "source": hit.get("foreign_landing_url"),
                }
            )
            got = True
            break

        if not got:
            print(f"{name:12s} nothing usable", file=sys.stderr)

    (OUT / "sources.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(f"\n{len(record)} images in {OUT}")


if __name__ == "__main__":
    main()
