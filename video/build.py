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
RATE = "+5%"

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Each line is one breath. `card` is which frame is on screen while it is
# said, so two lines on the same card simply hold that card longer. `hold`
# is silence after the line, in seconds, and it is where the film does its
# thinking.
BEATS = [
    # card, step, line, silence after it
    (1, 1, "Everybody plants a tree.", 0.63),
    (1, 2, "Nobody finds out what happened to it.", 1.05),

    (2, 1, "A birthday. A school drive. A company afternoon.", 0.25),
    (2, 2, "They plant it, they take the photo, they post it, and that is where it ends.", 0.28),
    (2, 3, "The planting is an event. The keeping alive is a year.", 0.63),

    (3, 1, "So how much of it lives? India's national auditor went and looked.", 0.35),
    (3, 2, "Of a two point eight million hectare target, about five percent was achieved.", 0.35),
    (3, 3, "At seventy percent of the sites, no improvement in tree cover at all.", 0.35),
    (3, 4, "One site reported two thousand plantings. Thirty were found. None had survived.", 0.98),

    (4, 1, "And here is the part that explains the rest.", 0.35),
    (4, 2, "Four out of five plantation records did not say what was planted, where it stood, or whether it lived.", 0.56),
    (4, 3, "Nobody was ever asked to keep one. Planting is not the solution. Keeping it alive is.", 0.91),

    (5, 1, "And we already pay people to do boring things.", 0.28),
    (5, 2, "Pay a credit card bill on time, and you earn points.", 0.28),
    (5, 4, "Water the tree you planted last year, and nothing happens at all.", 0.84),

    (6, 1, "Rooted pays you for keeping it alive.", 0.35),
    (6, 2, "The tulsi on the balcony. The money plant in the living room. The lemon by the kitchen window. The sapling from last month's drive. Same app, same schedule.", 0.28),

    (7, 1, "You do not have to know anything about the plant.", 0.28),
    (7, 2, "Every plant carries its own coordinates, and the schedule moves with the weather over it.", 0.28),
    (7, 3, "Rain pushes the next watering out. Heat pulls it in.", 0.63),

    (8, 1, "And you are not expected to know any of it. When to feed it, what to spray, how often to water. It tells you, on the day.", 0.35),
    (8, 2, "Water, on this species own interval, moved by the rain and the heat.", 0.28),
    (8, 3, "Feeding, with what this plant wants, and less than you think, because what the roots do not take ends up in the groundwater.", 0.28),
    (8, 4, "Pests, with what goes wrong with this species, and the mildest thing that works.", 0.28),
    (8, 5, "And a weekly look while it establishes, which is when losing it is least visible.", 0.70),

    (9, 1, "Every plant also carries a health score.", 0.28),
    (9, 3, "Thriving, steady, watch it, at risk, and one sentence saying what moved it.", 0.35),
    (9, 4, "It does not read the leaves and call the plant sick. A yellow leaf has a dozen causes.", 0.70),

    (10, 1, "The camera then tells you what would make the shot pass.", 0.28),
    (10, 2, "Out loud, because whoever is doing this is holding a watering can.", 0.28),
    (10, 3, "It reads the frame twice a second, on the phone, uploading nothing.", 0.28),
    (10, 4, "Tilt down so the soil is in frame. Then the ring turns green.", 0.70),

    (11, 1, "Then it is checked, and every check says the number it measured.", 0.28),
    (11, 2, "It came off the camera. The time is ours. The location matches where this plant was registered.", 0.28),
    (11, 3, "And soil five percent darker than that plant's own dry baseline. Measured, not guessed.", 0.70),

    (12, 1, "This is the one that matters. If any plant earned points, the points would be worth nothing.", 0.35),
    (12, 2, "So OpenCV matches keypoints against the plant's first photograph, and asks whether they agree on one viewpoint.", 0.28),
    (12, 3, "The same plant returns four hundred and eighty five.", 0.42),
    (12, 4, "A different plant of the same species, in a similar pot, returns four.", 1.12),

    (13, 1, "Registering a plant checks the photograph before it accepts it.", 0.28),
    (13, 2, "Point it at a notebook and it says so. An object scores nought point two percent. The weakest real plant scored nine.", 0.35),
    (13, 3, "Point it at a plant and it works out what it is. Seventy-eight species, searched by local name.", 0.28),

    (14, 1, "The whole premise is that people forget. So this cannot wait to be opened.", 0.35),
    (14, 2, "When a task comes due, the same message goes out on WhatsApp, email and text.", 0.28),
    (14, 3, "A name, a plant and a date go to the server. No photographs, no coordinates.", 0.77),

    (15, 1, "Organisations spend heavily on planting drives, and get back a photograph from day one.", 0.35),
    (15, 2, "Rooted produces the record of what survived, every point traceable to one verified task.", 0.35),
    (15, 3, "That record funds the rewards. The offers are stand-ins, because naming a real company would put words in their mouth.", 0.77),

    (16, 1, "Two things did not survive contact with a measurement.", 0.35),
    (16, 2, "I tried to work out the species on the device. It got the right answer zero times out of seventeen.", 0.35),
    (16, 3, "And the identity check used to compare brightness grids. A different neem tree walked straight through.", 0.35),
    (16, 4, "Against eight percent for guessing. It was the weakest thing in the app wearing the name of the strongest, so it was replaced.", 0.98),

    (17, 1, "We reward people for spending money.", 0.77),
    (17, 3, "Rooted rewards them for keeping something alive.", 1.12),

    (18, 1, "Plant it. Keep it. Get paid for it. Open it on your phone, and keep something alive.", 0.70),
    (18, 3, "Nothing in here reports a number it did not measure.", 1.68),
]



# Which recording plays inside the phone on which card. The ones missing are
# the shots that need a real plant in a real hand, and those frames say so on
# screen rather than pretending.
FOOTAGE = {
    2: "landing",
    6: "join",
    7: "today",
    9: "plants",
    11: "howitworks",
    14: "reminder",
    15: "rewards",
}

# A notification lands about two and a third seconds into the reminder clip.
# Two soft notes at that moment, so the arrival is heard as well as seen.
CHIME_AT = 2.35


# Where the phone sits in a frame, pinned in the stylesheet so nothing has to
# be measured.
SLOT = (1385, 112, 410, 820)

# The card draws a status bar across the top of the phone, and the recording
# starts below it.
BEZEL_TOP = 44


def clip_for(card: int):
    p = HERE / "footage" / f"{FOOTAGE[card]}.mp4" if card in FOOTAGE else None
    return p if p and p.exists() else None


def run(*args, **kw):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kw)


async def speak(text: str, out: pathlib.Path):
    """One line, spoken.

    Written out as WAV rather than kept as MP3. Every MP3 carries a little
    encoder padding at each end, and joining fifty-six of them by copy added
    three and a quarter seconds that the picture knew nothing about, so the
    voice drifted further behind the frames the longer it ran.
    """
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


def ass_time(t: float) -> str:
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def write_ass(subs, path: pathlib.Path):
    """
    A real subtitle file, with its own canvas.

    The `subtitles` filter hands an SRT to libass with no script resolution on
    it, so libass measures margins against its own default canvas instead of
    against 1920 by 1080. A left margin of 110 in that space is most of the
    width, which is how the captions came out as a column of single words over
    the middle of the frame. Declaring PlayRes fixes the geometry rather than
    guessing smaller numbers.

    Bottom left, in its own box, inside the card's own margin. Centred at the
    bottom it crossed under both the words and the phone, which is the one
    strip of the frame that belongs to neither.
    """
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Say,Instrument Sans,44,&H00BBC8C2,&H00BBC8C2,&H00000000,&HB0060A07,0,0,0,0,100,100,0,0,3,14,0,1,110,820,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    rows = [
        f"Dialogue: 0,{ass_time(a)},{ass_time(b)},Say,,0,0,0,,{t}"
        for a, b, t in subs
    ]
    path.write_text(head + chr(10).join(rows) + chr(10), encoding="utf-8")


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
    # Files only. The recorder keeps a browser profile in here, and that is a
    # directory this has no business deleting.
    for old in WORK.glob("*"):
        if old.is_file():
            old.unlink()

    print(f"voice: {VOICE}\nbeats: {len(BEATS)}\n")

    # 1. Speak every line, and note how long each one runs.
    lines = []
    clock = 0.0
    subs = []

    for i, (card, step, text, hold) in enumerate(BEATS):
        mp3 = WORK / f"say{i:02d}.mp3"
        wav = WORK / f"say{i:02d}.wav"
        await speak(text, mp3)
        run("ffmpeg", "-loglevel", "error", "-y", "-i", str(mp3),
            "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(wav))
        spoken = duration(wav)

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

        lines.append({"card": card, "step": step, "mp3": wav, "spoken": spoken, "hold": hold})
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

    # When each card is on screen. The overlays need it, and so does the
    # chime, which has to land inside the reminder clip.
    windows = {}
    at = 0.0
    for (c, _st), d in shots:
        a, b = windows.get(c, (at, at))
        windows[c] = (min(a, at), max(b, at + d))
        at += d

    # 4. One audio track, in order, with the silences in between.
    concat = WORK / "audio.txt"
    parts = []
    for i, l in enumerate(lines):
        parts.append(f"file '{l['mp3'].as_posix()}'")
        if l["hold"] > 0:
            gap = WORK / f"gap{i:02d}.wav"
            run("ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=44100:cl=mono:d={l['hold']}",
                "-c:a", "pcm_s16le", str(gap))
            parts.append(f"file '{gap.as_posix()}'")
    concat.write_text("\n".join(parts), encoding="utf-8")

    voice_track = WORK / "voice.wav"
    run("ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat), "-c", "copy", str(voice_track))

    # The joined track has to be the length the picture was cut to. Anything
    # else is drift, and drift is what put the voice behind the frames.
    joined = duration(voice_track)
    if abs(joined - total) > 0.15:
        print(f"  warning: audio {joined:.2f}s against a {total:.2f}s picture")
    else:
        print(f"  audio and picture agree to {abs(joined - total) * 1000:.0f}ms")

    # Two soft notes where the notification lands, made rather than sampled so
    # there is nothing to license and nothing to attribute.
    chime = WORK / "chime.wav"
    run("ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi",
        "-i", "sine=frequency=880:duration=0.5",
        "-f", "lavfi", "-i", "sine=frequency=1318:duration=0.5",
        "-filter_complex",
        "[0:a]adelay=0|0,volume=0.30,afade=t=out:st=0.06:d=0.42[a];"
        "[1:a]adelay=110|110,volume=0.26,afade=t=out:st=0.10:d=0.40[b];"
        "[a][b]amix=inputs=2:duration=longest,aformat=sample_rates=44100:channel_layouts=mono",
        str(chime))

    # A forest under the whole thing, quiet enough that nobody notices it and
    # loud enough that its absence would be felt. The same CC0 recording the
    # app itself plays, so the film sounds like the product.
    ambience = HERE.parent / "web" / "public" / "audio" / "forest.mp3"
    mixed = WORK / "track.m4a"
    if ambience.exists():
        ping = ""
        extra = []
        if 14 in windows and clip_for(14):
            at_ms = int((windows[14][0] + CHIME_AT) * 1000)
            extra = ["-i", str(chime)]
            ping = f"[2:a]adelay={at_ms}|{at_ms},volume=0.85[ping];"
            mix_in = "[0:a][bed][ping]amix=inputs=3"
        else:
            mix_in = "[0:a][bed]amix=inputs=2"

        run("ffmpeg", "-loglevel", "error", "-y",
            "-i", str(voice_track),
            "-stream_loop", "-1", "-i", str(ambience),
            *extra,
            "-filter_complex",
            "[1:a]volume=0.10,afade=t=in:st=0:d=2[bed];"
            + ping
            + mix_in
            + ":duration=first:dropout_transition=0,"
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

    ass = HERE / "rooted-demo.ass"
    write_ass(subs, ass)

    inputs = []
    x, y, pw, ph = SLOT
    # Inset a little, so the card's own rounded border still draws around the
    # recording instead of being covered by its square corners.
    inset = 5
    vw = pw - inset * 2
    vh = ph - BEZEL_TOP
    # Scaled to the width and then cropped, never squashed. A 390 by 844
    # recording forced into this box would be visibly the wrong shape, and the
    # app has enough room at the top of every screen to give up sixty pixels
    # to the status bar that now sits there.
    tall = round(vw * 844 / 390)

    chain = "[0:v]fps=30,scale=1920:1080:flags=lanczos[base]"
    last = "base"
    overlays = []

    for card in sorted(windows):
        clip = clip_for(card)
        if not clip:
            continue
        start_t, end_t = windows[card]
        # Two inputs are already taken: the cards and the audio.
        idx = 2 + len(overlays)
        inputs += ["-stream_loop", "-1", "-i", str(clip)]
        chain += (
            f";[{idx}:v]scale={vw}:{tall},crop={vw}:{vh}:0:{max(0, (tall - vh) // 2 - 22)},"
            f"setpts=PTS-STARTPTS+{start_t:.3f}/TB[p{card}]"
        )
        chain += (
            f";[{last}][p{card}]overlay={x + inset}:{y + BEZEL_TOP}:"
            f"enable='between(t,{start_t:.3f},{end_t:.3f})'[v{card}]"
        )
        last = f"v{card}"
        overlays.append(card)

    chain += f";[{last}]ass={ass.name}[v]"

    out = HERE / "rooted-demo.mp4"
    print(f"\nencoding, with footage in {len(overlays)} frames")
    run(
        "ffmpeg", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(shot_list),
        "-i", str(voice_track),
        *inputs,
        "-filter_complex", chain,
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "19",
        "-pix_fmt", "yuv420p",
        # Straight out of the mix this landed at -26 LUFS, which is a demo a
        # judge has to reach for the volume to hear. Platforms normalise to
        # about -14, so this lands near it with headroom left.
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart", "-shortest",
        str(out),
        cwd=HERE,
    )

    print(f"\n{out}  {out.stat().st_size / 1e6:.1f} MB  {int(total) // 60}:{int(total) % 60:02d}")
    print(f"{srt}")
    print("\nSeven frames have a phone-shaped hole with what to record written in it.")


if __name__ == "__main__":
    asyncio.run(main())
