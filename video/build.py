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
    # card, step, line, silence after it
    (1, 1, "Everybody plants a tree.", 0.9),
    (1, 2, "Nobody finds out what happened to it.", 1.5),

    (2, 1, "A birthday. A school drive. A company afternoon.", 0.3),
    (2, 2, "They plant it, they take the photo, they post it, and that is where it ends.", 0.4),
    (2, 3, "The planting is an event. The keeping alive is a year.", 0.9),

    (3, 1, "So how much of it lives? India's national auditor spent ten years going and looking.", 0.5),
    (3, 2, "Of a two point eight million hectare afforestation target, about five percent was actually achieved.", 0.5),
    (3, 3, "At seventy percent of the sites they assessed, there was little or no improvement in tree cover at all.", 0.5),
    (3, 4, "One site reported two thousand plantings. Thirty saplings were found on the ground. None of them had survived.", 1.4),

    (4, 1, "And here is the part that explains the rest.", 0.5),
    (4, 2, "Of five hundred and fifty six plantation records, four hundred and thirty one did not say what was planted, where it stood, or whether it lived.", 0.8),
    (4, 3, "There is no record of what survived, because nobody was ever asked to keep one. Planting is not the solution. Keeping it alive is.", 1.3),

    (5, 1, "And we already pay people to do boring things.", 0.4),
    (5, 2, "Pay a credit card bill on time, and you earn points.", 0.4),
    (5, 3, "Order dinner, take a taxi, board a flight. Points.", 0.4),
    (5, 4, "Water the tree you planted last year, and nothing happens at all.", 1.2),

    (6, 1, "Rooted pays you for keeping it alive.", 0.5),
    (6, 2, "Register a plant once, then do the small jobs it needs, photographed as you do them. Every one that checks out earns points.", 0.4),
    (6, 3, "It is a website. There is nothing to install, and it works with no signal.", 0.8),

    (7, 1, "You do not have to know anything about the plant.", 0.4),
    (7, 2, "Every plant carries its own coordinates, and the schedule moves with the weather actually over it.", 0.4),
    (7, 3, "Rain pushes the next watering out. Heat pulls it in.", 0.9),

    (8, 1, "So nobody has to babysit it. It tells you the job, on the day the job is due.", 0.5),
    (8, 2, "Water, on this species own interval, moved by the rain and the heat.", 0.4),
    (8, 3, "Feeding, with what this plant actually wants, and a reminder to use less than you think, because fertiliser the roots do not take ends up in the groundwater.", 0.4),
    (8, 4, "Pests, with what actually goes wrong with this species and the mildest thing that works, because a spray kills the ladybirds that were handling it for you.", 0.4),
    (8, 5, "And a weekly look while it is establishing, which is when losing it is most likely and least visible.", 1.0),

    (9, 1, "Every plant also carries a health score.", 0.4),
    (9, 2, "It is built from how the watering has gone against the schedule this species wants, and how long the run is.", 0.4),
    (9, 3, "Thriving, steady, watch it, at risk. And one sentence saying what moved it.", 0.5),
    (9, 4, "What it does not do is read the leaves and tell you the plant is sick. A yellow leaf has a dozen causes, and a number invented from one is a number that gets trusted.", 1.0),

    (10, 1, "When it is time, the camera tells you what would make the shot pass.", 0.4),
    (10, 2, "Out loud, because whoever is doing this is holding a watering can.", 0.4),
    (10, 3, "It reads the frame twice a second, on the phone, and nothing is uploaded to do it.", 0.4),
    (10, 4, "Tilt down so the soil is in frame. Then the ring around the shutter turns green.", 1.0),

    (11, 1, "Then the photograph is checked, and every check says the number it measured.", 0.4),
    (11, 2, "That it came off the camera and not a file picker. The time, taken on our side. The location, against where this plant was registered.", 0.4),
    (11, 3, "And for watering, soil at least five percent darker than that plant's own dry baseline. That threshold was measured, not guessed.", 1.0),

    (12, 1, "This is the one that matters. If photographing any plant earned points, the points would be worth nothing.", 0.5),
    (12, 2, "So OpenCV finds keypoints in this photograph and in the plant's first one, matches them, and asks whether they agree on a single viewpoint.", 0.4),
    (12, 3, "The same plant returns four hundred and eighty five.", 0.6),
    (12, 4, "A different plant of the same species, in a similar pot, returns four.", 1.6),

    (13, 1, "Registering a plant checks the photograph before it accepts it.", 0.4),
    (13, 2, "Point it at a notebook and it says so. A plain object scores nought point two percent as a plant. The least convincing real plant still scored nine.", 0.5),
    (13, 3, "Point it at a plant and it works out what that plant is. Seventy-eight species, searched by the names people actually use.", 0.4),
    (13, 4, "And five profiles for anything not on the list, because knowing a plant's name and knowing how to keep it alive are different jobs.", 1.0),

    (14, 1, "The whole premise is that people forget. So this cannot wait to be opened.", 0.5),
    (14, 2, "When a task comes due, the same message goes out on WhatsApp, on email, and as a text.", 0.4),
    (14, 3, "A name, a plant and a date go to the server. No photographs. No coordinates. Those never leave the phone.", 1.1),

    (15, 1, "Organisations spend heavily on planting drives every year, and get back a photograph from planting day.", 0.5),
    (15, 2, "Rooted produces the record of what actually survived, and every point in it traces to one verified task.", 0.5),
    (15, 3, "That record is what funds the rewards. The offers in the app are stand-ins, because naming a real company in a demo would put words in their mouth.", 1.1),

    (16, 1, "Two things did not survive contact with a measurement.", 0.5),
    (16, 2, "I tried to work out the species on the device, from colour and texture. It got the right answer first zero times out of seventeen.", 0.5),
    (16, 3, "And the check that says this is the same plant used to compare brightness grids. A photograph of a different neem tree walked straight through it.", 0.5),
    (16, 4, "Against eight percent for guessing at random. It was the weakest thing in the app wearing the name of the strongest. So it was measured, thrown away, and replaced.", 1.4),

    (17, 1, "We reward people for spending money.", 1.1),
    (17, 3, "Rooted rewards them for keeping something alive.", 1.6),

    (18, 1, "Plant it. Keep it. Get paid for it.", 1.0),
    (18, 3, "Nothing in here reports a number it did not measure.", 2.4),
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


def render_card(n: int, step: int, out: pathlib.Path):
    """One frame, at exactly 1920x1080, straight out of the browser."""
    run(
        CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--screenshot={out}", "--window-size=1920,1080",
        "--virtual-time-budget=7000", f"{CARDS}#{n}.{step}",
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

    for i, (card, step, text, hold) in enumerate(BEATS):
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

        lines.append({"card": card, "step": step, "mp3": mp3, "spoken": spoken, "hold": hold})
        clock += spoken + hold
        print(f"  {i + 1:>2}. {card:>2}.{step}  {spoken:5.2f}s + {hold:.1f}s   {text[:54]}")

    total = clock
    print(f"\ntotal {int(total) // 60}:{int(total) % 60:02d}")

    # 2. One frame per step, so an element arrives on the sentence that
    #    introduces it rather than with everything else at the top.
    frames = sorted({(l["card"], l["step"]) for l in lines})
    print(f"\nrendering {len(frames)} frames")
    for c, st in frames:
        render_card(c, st, WORK / f"f{c:02d}_{st}.png")
    print(f"  {len(frames)} done")

    # 3. How long each frame is on screen.
    shots = []
    for l in lines:
        key = (l["card"], l["step"])
        span = l["spoken"] + l["hold"]
        if shots and shots[-1][0] == key:
            shots[-1][1] += span
        else:
            shots.append([key, span])

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
    def frame(key):
        return (WORK / f"f{key[0]:02d}_{key[1]}.png").as_posix()

    shot_list.write_text(
        "\n".join(f"file '{frame(k)}'\nduration {d:.3f}" for k, d in shots)
        + f"\nfile '{frame(shots[-1][0])}'",
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

    # Bottom left, in its own box, inside the card's own left margin.
    # Centred at the bottom it crossed under both the words and the phone,
    # which is the one strip of the frame that belongs to neither.
    style = (
        "FontName=Instrument Sans,FontSize=20,PrimaryColour=&H00BBC8C2,"
        "BackColour=&HC8080D06,BorderStyle=3,Outline=7,Shadow=0,"
        "Alignment=1,MarginL=110,MarginR=780,MarginV=56"
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
