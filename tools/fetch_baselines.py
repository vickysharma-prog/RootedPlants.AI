"""Pull a photo history for each plant in the seeded demo account.

Clicking "see the demo" should land somebody in an account that has been
running for months, which means each plant needs a first photograph and a
few taken since. These are real photographs of real plants rather than the
species card reused three times, so the timeline on a plant's page reads the
way a real one would.

Photographs only, never an illustration or a render. Pexels first, because
its library is entirely photographic and its licence asks for nothing;
Openverse CC0 as the backstop. Portrait 3:4 to match what the camera in the
app produces.

    python tools/fetch_baselines.py

Reads PEXELS_API_KEY from web/.env.local. Writes to web/public/baselines/
and records where every frame came from.
"""

import io
import json
import os
import pathlib
import urllib.parse
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "web" / "public" / "baselines"
W, H = 540, 720

PEXELS = "https://api.pexels.com/v1/search"
OPENVERSE = "https://api.openverse.org/v1/images/"

# Each frame gets its own search, oldest first, so a plant's timeline is three
# different photographs rather than three crops of one afternoon.
WANTED = {
    "neem-1": ["neem tree sapling", "neem tree leaves green", "neem tree branch"],
    "tulsi-1": ["holy basil plant pot", "basil plant terracotta pot", "basil leaves plant closeup"],
    "money-1": ["pothos plant pot", "money plant indoor pot", "pothos leaves green"],
}


def key() -> str:
    env = ROOT / "web" / ".env.local"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("PEXELS_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("PEXELS_API_KEY", "")


def get(url: str, headers: dict | None = None, timeout: int = 40) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "rooted/1.0", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def from_pexels(query: str, api_key: str, skip: set[str]):
    """Candidate photographs, portrait preferred, newest of the good ones."""
    if not api_key:
        return []
    qs = urllib.parse.urlencode({"query": query, "per_page": 12, "orientation": "portrait"})
    try:
        data = json.loads(get(f"{PEXELS}?{qs}", {"Authorization": api_key}))
    except Exception as exc:
        print(f"  pexels {query!r}: {exc}")
        return []
    out = []
    for p in data.get("photos", []):
        src = p.get("src", {}).get("large2x") or p.get("src", {}).get("large")
        if src and src not in skip:
            out.append(
                {
                    "url": src,
                    "title": p.get("alt") or query,
                    "licence": "Pexels",
                    "source": p.get("url"),
                }
            )
    return out


def from_openverse(query: str, skip: set[str]):
    qs = urllib.parse.urlencode(
        {"q": query, "license": "cc0,pdm", "page_size": 10, "mature": "false"}
    )
    try:
        hits = json.loads(get(OPENVERSE + "?" + qs)).get("results", [])
    except Exception as exc:
        print(f"  openverse {query!r}: {exc}")
        return []
    return [
        {
            "url": h["url"],
            "title": h.get("title") or query,
            "licence": h.get("license"),
            "source": h.get("foreign_landing_url"),
        }
        for h in hits
        if h.get("url") and h["url"] not in skip
    ]


def portrait(raw: bytes) -> Image.Image:
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    want = W / H
    if im.width / im.height > want:
        side = int(im.height * want)
        left = (im.width - side) // 2
        im = im.crop((left, 0, left + side, im.height))
    else:
        side = int(im.width / want)
        top = max(0, (im.height - side) // 2 - int(side * 0.05))
        im = im.crop((0, top, im.width, top + side))
    return im.resize((W, H), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    api_key = key()
    print("pexels key:", "found" if api_key else "missing, falling back to openverse")

    record = []
    used: set[str] = set()

    for plant, queries in WANTED.items():
        for i, query in enumerate(queries):
            name = f"{plant}-{i}.jpg"
            for hit in from_pexels(query, api_key, used) + from_openverse(query, used):
                try:
                    portrait(get(hit["url"])).save(OUT / name, "JPEG", quality=84, optimize=True)
                except Exception as exc:
                    print(f"  skip {hit['url'][:60]}: {exc}")
                    continue
                used.add(hit["url"])
                record.append({"file": name, "plant": plant, "query": query, **hit})
                print(f"{name:16} {str(hit['licence']):7} {str(hit['title'])[:58]}")
                break
            else:
                print(f"{name:16} nothing usable for {query!r}")

    # Merge rather than overwrite. Running this for one more plant used to
    # wipe the provenance of every frame already on disk, which is the one
    # thing in here that has to survive.
    path = OUT / "sources.json"
    kept = {}
    if path.exists():
        try:
            kept = {r["file"]: r for r in json.loads(path.read_text(encoding="utf-8"))}
        except Exception as exc:
            print(f"  could not read the existing record, starting fresh: {exc}")
    kept.update({r["file"]: r for r in record})

    # Anything whose file is gone should not be claimed in the record either.
    kept = {name: r for name, r in kept.items() if (OUT / name).exists()}

    path.write_text(json.dumps(list(kept.values()), indent=2), encoding="utf-8")
    print(f"\n{len(record)} new frames, {len(kept)} recorded in {OUT}")


if __name__ == "__main__":
    main()
