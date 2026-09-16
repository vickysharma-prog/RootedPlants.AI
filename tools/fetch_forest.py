"""Pull real forest photographs for the backdrop.

Openverse, CC0 and Public Domain Mark only, so nothing carries an attribution
condition. Cropped to portrait because the backdrop sits behind a phone
screen, and saved at a size that still holds up under a slow zoom.

    python tools/fetch_forest.py
"""

import io
import json
import pathlib
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageFilter

API = "https://api.openverse.org/v1/images/"
OUT = pathlib.Path(__file__).resolve().parent.parent / "web" / "public" / "forest"
W, H = 900, 1600

WANTED = [
    ("mist", "misty forest trees fog"),
    ("canopy", "forest canopy sunlight trees"),
    ("depth", "tall pine forest trunks"),
    ("dusk", "forest silhouette sunset trees"),
]


def get(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "rooted/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def search(query: str):
    qs = urllib.parse.urlencode(
        {"q": query, "license": "cc0,pdm", "page_size": 10, "mature": "false"}
    )
    return json.loads(get(API + "?" + qs)).get("results", [])


def portrait(raw: bytes) -> Image.Image:
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    if im.width < 900 or im.height < 600:
        raise ValueError(f"too small, {im.width}x{im.height}")

    target = W / H
    if im.width / im.height > target:
        side = int(im.height * target)
        left = (im.width - side) // 2
        im = im.crop((left, 0, left + side, im.height))
    else:
        side = int(im.width / target)
        top = max(0, (im.height - side) // 2)
        im = im.crop((0, top, im.width, top + side))

    return im.resize((W, H), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    record = []

    for name, query in WANTED:
        for hit in search(query):
            url = hit.get("url")
            if not url:
                continue
            try:
                im = portrait(get(url))
            except Exception as exc:
                print(f"  skip {name}: {exc}", file=sys.stderr)
                continue

            path = OUT / f"{name}.jpg"
            im.save(path, "JPEG", quality=74, optimize=True, progressive=True)

            # A tiny blurred twin, inlined as the first paint so the backdrop
            # is never a blank rectangle while the real one loads.
            tiny = im.resize((36, 64), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
            tiny.save(OUT / f"{name}-tiny.jpg", "JPEG", quality=52)

            print(f"{name:8s} {path.stat().st_size // 1024:4d}kB  {hit.get('license')}  {(hit.get('title') or '')[:46]}")
            record.append(
                {
                    "file": f"forest/{name}.jpg",
                    "query": query,
                    "license": hit.get("license"),
                    "source": hit.get("foreign_landing_url"),
                }
            )
            break
        else:
            print(f"{name:8s} nothing usable", file=sys.stderr)

    (OUT / "sources.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(f"\n{len(record)} images in {OUT}")


if __name__ == "__main__":
    main()
