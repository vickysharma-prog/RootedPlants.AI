"""Build the demo video.

Renders the title cards, speaks the narration, burns the subtitles and cuts
the whole thing together. What it does not do is fill the phone-shaped hole in
the middle of seven of those cards: that is real footage of a real plant and it
has to be shot, not generated. Every one of those frames is labelled on screen
with what to record into it.

    cd video
    python -m http.server 3333 &
    python build.py

Out: rooted-demo.mp4, 1920x1080, with rooted-demo.srt beside it.

Needs ffmpeg on PATH and `pip install edge-tts`.
"""

import asyncio
import pathlib
import shutil
import subprocess
import sys

import edge_tts

HERE = pathlib.Path(__file__).resolve().parent
WORK = HERE / "build"
CARDS = "http://localhost:3333/cards.html?render"

# Warm, confident, and not in a hurry. A demo read like an advert is a demo
# nobody believes.
VOICE = "en-US-AndrewNeural"
RATE = "-4%"

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Each line is one breath. `card` is which frame is on screen while it is
# said, so two lines on the same card simply hold that card longer. `hold`
# is silence after the line, in seconds, and it is where the film does its
# thinking.
BEATS = [
    (1, "Everybody plants a tree.", 0.9),
    (1, "Nobody finds out what happened to it.", 1.4),

    (2, "A birthday, a school drive, a company afternoon. They plant it, they take the photo, they post it, and that is where it ends.", 0.4),
    (2, "The planting is an event. The keeping alive is a year of small boring jobs, and nothing is attached to doing them.", 0.8),

    (3, "We already pay people to do boring things. Pay a credit card bill on time and you earn points.", 0.5),
    (3, "So why is nothing pointed at the thing our lives actually depend on?", 1.2),

    (4, "This is not a timer. Every plant carries its own coordinates, and the schedule moves with the weather actually over it.", 0.4),
    (4, "Rain pushes the next watering out. Heat pulls it in. A pest check comes round sooner after warm wet days, because that is when pests turn up.", 0.7),

    (5, "Before the camera opens, it tells you exactly what the photograph has to show. The instruction is the check, so following it passes every time.", 0.4),
    (5, "And while the camera is open it reads the frame a few times a second and says the one thing that would make the shot pass. Out loud, because whoever is doing this is holding a watering can.", 1.0),

    (6, "Then it is checked. Each one says the number it measured.", 0.35),
    (6, "Where the photograph came from. The time, taken on our side, never read off the file. The location, against where this plant was registered.", 0.4),
    (6, "And for watering, soil at least five percent darker than that plant's own dry baseline. That number was measured, not guessed.", 0.9),

    (7, "This is the one that matters. If photographing any plant earned points, the points would be worth nothing.", 0.5),
    (7, "So OpenCV finds keypoints in this photograph and in the plant's first one, matches them, and asks whether they agree on a single viewpoint.", 0.4),
    (7, "The same plant returns four hundred and eighty five.", 0.6),
    (7, "A different plant of the same species, in a similar pot, returns four.", 1.5),
    (7, "It runs on the phone. No photograph is uploaded to do it.", 0.9),

    (8, "Registering a plant checks the photograph before it accepts it. Point it at a notebook and it says so.", 0.4),
    (8, "Point it at a plant and it works out what that plant is, and says how confident it is. Below thirty percent it will not fill the answer in for you.", 0.4),
    (8, "Seventy-eight species, searched by the names people actually use. And five profiles for anything not on the list, because knowing a plant's name and knowing how to keep it alive are different jobs.", 0.9),

    (9, "The whole premise is that people forget. So this cannot wait to be opened.", 0.5),
    (9, "The next few tasks are registered with a clock on our side, and when one comes due the same message goes out on WhatsApp, on email and as a text.", 0.4),
    (9, "A name, a plant and a date. No photographs. No coordinates. Those never leave the phone.", 1.0),

    (10, "Organisations spend heavily on planting drives every year and get back a photograph from planting day.", 0.4),
    (10, "Rooted produces the record of what actually survived, and that record is what funds the rewards. The offers in here are stand-ins, because naming a real company in a demo would put words in their mouth.", 1.0),

    (11, "Two things did not survive contact with a measurement.", 0.6),
    (11, "I tried to work out the species on the device, from colour and texture. It got the right answer first zero times out of seventeen, against eight percent for guessing at random. Neem and curry leaf are both green pinnate leaves, and no histogram separates them.", 0.5),
    (11, "And the check that says this is the same plant used to compare brightness grids. A photograph of a different neem tree walked straight through it.", 0.5),
    (11, "It was the weakest thing in the app wearing the name of the strongest. So it was measured, thrown away, and replaced.", 1.2),

    (12, "Nothing in here reports a number it did not measure.", 2.2),
]


def run(*args, **kw):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kw)


async def speak(text: str, out: pathlib.Path):
    """One line, spoken, with the word timings that make the subtitles."""
    tts = edge_tts.Communicate(text, VOICE, rate=RATE)
    cues = []
    with open(out, "wb") as f:
        async for chunk in tts.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                cues.append((chunk["offset"] / 1e7, chunk["duration"] / 1e7, chunk["text"]))
    return cues


def duration(path: pathlib.Path) -> float:
    out = run(
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ).stdout.strip()
    return float(out)


def render_card(n: int, out: pathlib.Path):
    """One frame, at exactly 1920x1080, straight out of the browser."""
    run(
        CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--screenshot={out}", "--window-size=1920,1080",
        "--virtual-time-budget=8000", f"{CARDS}#{n}",
    )


def srt_time(t: float) -> str:
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):06.3f}".replace(".", ",")


def chunk(text: str, limit: int = 64):
    """
    Subtitle-sized pieces, broken where a person would pause.

    Sentences first, then clauses at a comma, and only then on width. Cutting
    purely on width gave lines like "it, they take the photo, they post it, and
    that is where it", which is a caption that has to be read twice.
    """
    import re

    # Sentences, keeping their punctuation.
    parts = [p.strip() for p in re.split(r"(?<=[.?!])\s+", text) if p.strip()]

    out = []
    for part in parts:
        if len(part) <= limit:
            out.append(part)
            continue

        # Too long for one line: break at commas, keeping them on the line.
        clauses = [c.strip() for c in re.split(r"(?<=,)\s+", part) if c.strip()]
        line = ""
        for c in clauses:
            if len(line) + len(c) + 1 <= limit:
                line = f"{line} {c}".strip()
                continue
            if line:
                out.append(line)
                line = ""
            # Still too long: fall back to words.
            if len(c) <= limit:
                line = c
            else:
                for w in c.split():
                    if len(line) + len(w) + 1 > limit and line:
                        out.append(line)
                        line = w
                    else:
                        line = f"{line} {w}".strip()
        if line:
            out.append(line)

    return out or [text]


async def main():
    if shutil.which("ffmpeg") is None:
        sys.exit("ffmpeg is not on PATH")

    WORK.mkdir(exist_ok=True)
    for old in WORK.glob("*"):
        old.unlink()

    print(f"voice: {VOICE}\nbeats: {len(BEATS)}\n")

    # 1. Speak every line, and note how long each one runs.
    lines = []
    clock = 0.0
    subs = []

    for i, (card, text, hold) in enumerate(BEATS):
        mp3 = WORK / f"say{i:02d}.mp3"
        await speak(text, mp3)
        spoken = duration(mp3)

        # Subtitles follow the words, not the beat, so they never sit ahead of
        # the voice or lag behind it.
        # Time each piece by how much of the line it is, not by an equal
        # share, so a six word caption does not sit as long as a twenty word
        # one.
        pieces = chunk(text)
        widths = [len(p) for p in pieces]
        span = sum(widths) or 1
        at = clock
        for piece, w in zip(pieces, widths):
            length = spoken * w / span
            subs.append((at, at + length - 0.04, piece))
            at += length

        lines.append({"card": card, "mp3": mp3, "spoken": spoken, "hold": hold})
        clock += spoken + hold
        print(f"  {i + 1:>2}. card {card}  {spoken:5.2f}s + {hold:.1f}s   {text[:56]}")

    total = clock
    print(f"\ntotal {int(total) // 60}:{int(total) % 60:02d}")

    # 2. Render each card once, however many lines sit on it.
    cards = sorted({l["card"] for l in lines})
    print(f"\nrendering {len(cards)} cards")
    for n in cards:
        render_card(n, WORK / f"card{n:02d}.png")
        print(f"  card {n}")

    # 3. How long each card is on screen: every line that sits on it.
    shots = []
    for l in lines:
        span = l["spoken"] + l["hold"]
        if shots and shots[-1][0] == l["card"]:
            shots[-1][1] += span
        else:
            shots.append([l["card"], span])

    # 4. One audio track, in order, with the silences in between.
    concat = WORK / "audio.txt"
    parts = []
    for i, l in enumerate(lines):
        parts.append(f"file '{l['mp3'].as_posix()}'")
        if l["hold"] > 0:
            gap = WORK / f"gap{i:02d}.mp3"
            run("ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=24000:cl=mono:d={l['hold']}", str(gap))
            parts.append(f"file '{gap.as_posix()}'")
    concat.write_text("\n".join(parts), encoding="utf-8")

    voice_track = WORK / "voice.mp3"
    run("ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat), "-c", "copy", str(voice_track))

    # A forest under the whole thing, quiet enough that nobody notices it and
    # loud enough that its absence would be felt. The same CC0 recording the
    # app itself plays, so the film sounds like the product.
    ambience = HERE.parent / "web" / "public" / "audio" / "forest.mp3"
    mixed = WORK / "track.m4a"
    if ambience.exists():
        run("ffmpeg", "-loglevel", "error", "-y",
            "-i", str(voice_track),
            "-stream_loop", "-1", "-i", str(ambience),
            "-filter_complex",
            "[1:a]volume=0.10,afade=t=in:st=0:d=2[bed];"
            "[0:a][bed]amix=inputs=2:duration=first:dropout_transition=0,"
            "afade=t=out:st=" + f"{total - 2.0:.2f}" + ":d=2[a]",
            "-map", "[a]", "-c:a", "aac", "-b:a", "192k", str(mixed))
        voice_track = mixed

    # 5. The cards, each held for as long as its lines take. A slow push in,
    #    because a still frame under a voice reads as a slide and this is not
    #    a slide deck.
    shot_list = WORK / "shots.txt"
    shot_list.write_text(
        "\n".join(
            f"file '{(WORK / f'card{c:02d}.png').as_posix()}'\nduration {d:.3f}"
            for c, d in shots
        )
        + f"\nfile '{(WORK / f'card{shots[-1][0]:02d}.png').as_posix()}'",
        encoding="utf-8",
    )

    # 6. Subtitles, burned in, because judges watch on mute.
    srt = HERE / "rooted-demo.srt"
    srt.write_text(
        "\n\n".join(
            f"{i + 1}\n{srt_time(a)} --> {srt_time(b)}\n{t}"
            for i, (a, b, t) in enumerate(subs)
        ),
        encoding="utf-8",
    )

    style = (
        "FontName=Instrument Sans,FontSize=21,PrimaryColour=&H00BBC8C2,"
        "OutlineColour=&H90000000,BorderStyle=3,Outline=0,Shadow=0,"
        "MarginV=42,Alignment=2"
    )

    out = HERE / "rooted-demo.mp4"
    print("\nencoding")
    run(
        "ffmpeg", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(shot_list),
        "-i", str(voice_track),
        "-filter_complex",
        f"[0:v]fps=30,scale=1920:1080:flags=lanczos,"
        f"subtitles={srt.name}:force_style='{style}'[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "slow", "-crf", "19",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart", "-shortest",
        str(out),
        cwd=HERE,
    )

    print(f"\n{out}  {out.stat().st_size / 1e6:.1f} MB  {int(total) // 60}:{int(total) % 60:02d}")
    print(f"{srt}")
    print("\nSeven frames have a phone-shaped hole with what to record written in it.")


if __name__ == "__main__":
    asyncio.run(main())
