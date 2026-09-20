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

import cv2
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

    (14, 1, "A plant cannot wait for you to remember it. So Rooted does not wait to be opened.", 0.35),
    (14, 2, "When a task comes due, the same message goes out on WhatsApp, email and text.", 0.28),
    (14, 3, "A name, a plant and a date go to the server. No photographs, no coordinates.", 0.77),

    (15, 1, "Organisations spend heavily on planting drives, and get back a photograph from day one.", 0.35),
    (15, 2, "Rooted produces the record of what survived, every point traceable to one verified task.", 0.35),
    (15, 3, "That record funds the rewards. The offers are stand-ins, because naming a real company would put words in their mouth.", 0.77),

    (16, 1, "And somebody is already paying for all of this.", 0.35),
    (16, 2, "Indian companies put forty thousand crore rupees into social spending in a single year.", 0.35),
    (16, 3, "Three thousand four hundred crore of that went into environmental work, up forty percent in one year.", 0.35),
    (16, 4, "And above ten crore, the law already asks them for an independent assessment of what the money achieved.", 0.42),
    (16, 5, "The money is there. The proof is the part nobody can produce. Rooted makes it, one verified task at a time, by the person who did the work.", 0.98),

    (17, 1, "We reward people for spending money.", 0.77),
    (17, 3, "Rooted rewards them for keeping something alive.", 1.12),

    (18, 1, "Plant it. Keep it. Get paid for it.", 0.35),
    (18, 2, "Rooted is already everywhere. It opens on any phone, Android or iPhone, and sits on the home screen like an app. There is no store and nothing to install.", 0.35),
    (18, 3, "Scan the left one to use it. Scan the right one to read every line of it.", 0.63),
    (18, 4, "Nothing in here reports a number it did not measure.", 1.68),
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
    10: "guide",
    13: "register",
    14: "handheld",
    15: "rewards",
}

# A notification lands four seconds into the handheld clip: two for the phone
# to wake, two more for the message. Two soft notes there, so the arrival is
# heard as well as seen.
CHIME_AT = 4.05


# Where the recording sits in a frame, pinned in the stylesheet so nothing has
# to be measured: left, top, width, height, and how much of the top the card's
# own status bar takes.
SLOT = (1385, 112, 410, 820, 44)

# The reminder is not a screen recording, it is a shot of somebody holding a
# phone, so it gets the whole right of the frame and none of the drawn chrome.
SLOTS = {14: (980, 0, 940, 1080, 0)}


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

    The voice comes over the network, and a build that speaks fifty-seven
    lines will sooner or later hit one timeout. Losing four minutes of work to
    one dropped socket is not worth it, so it tries again.
    """
    for attempt in range(4):
        tts = edge_tts.Communicate(text, VOICE, rate=RATE)
        cues = []
        try:
            with open(out, "wb") as f:
                async for chunk in tts.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        cues.append(
                            (chunk["offset"] / 1e7, chunk["duration"] / 1e7, chunk["text"])
                        )
            if out.stat().st_size > 0:
                return cues
        except Exception as err:
            if attempt == 3:
                raise
            print(f"    retrying: {type(err).__name__}")
        await asyncio.sleep(2 + attempt * 3)
    return []


def size(path: pathlib.Path):
    """How big a clip is, so nothing has to assume a phone's shape."""
    out = run(
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=p=0:s=x", str(path),
    ).stdout.strip()
    w, h = out.split("x")
    return int(w), int(h)


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
Style: Say,Instrument Sans,44,&H00BBC8C2,&H00BBC8C2,&H00000000,&HB0060A07,0,0,0,0,100,100,0,0,3,14,0,1,110,950,60,1

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
    # directory this has no business deleting. The spoken lines stay too, or
    # the cache below would never survive long enough to be a cache.
    for old in WORK.glob("*"):
        if old.is_file() and not old.name.startswith("say"):
            old.unlink()

    print(f"voice: {VOICE}\nbeats: {len(BEATS)}\n")

    # 1. Speak every line, and note how long each one runs.
    lines = []
    clock = 0.0
    subs = []

    for i, (card, step, text, hold) in enumerate(BEATS):
        mp3 = WORK / f"say{i:02d}.mp3"
        wav = WORK / f"say{i:02d}.wav"
        # A line that has not changed is not spoken again. Most rebuilds
        # change a card or a number, not the script, and this turns four
        # minutes of network into none.
        said = WORK / f"say{i:02d}.said"
        stamp = f"{VOICE} {RATE}\n{text}"
        if not (wav.exists() and said.exists() and said.read_text(encoding="utf-8") == stamp):
            await speak(text, mp3)
            run("ffmpeg", "-loglevel", "error", "-y", "-i", str(mp3),
                "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(wav))
            said.write_text(stamp, encoding="utf-8")
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

    # 5. The cards, each held for as long as its lines take, dissolved into
    #    one another rather than cut.
    #
    #    Held perfectly still and cut hard, a step arriving reads as a jump.
    #    Dissolved, the same step reads as the thing appearing while the line
    #    is said, which is what it is. A step inside a card gets a quick one,
    #    a new card a slower one, so a change of subject is felt.
    #
    #    The blend is drawn here rather than left to ffmpeg. Handing sixty
    #    stills to the xfade filter means sixty decoders and sixty filter
    #    graphs open at once, which ran the machine out of memory. Mixing two
    #    images at a time costs nothing and the concat list swallows the
    #    result, so the fade frames are simply more pictures in the sequence.
    #
    #    The arithmetic keeps the voice off a half-drawn frame: a shot holds
    #    for its own length less the fade that follows it, then the fade runs,
    #    and the next shot is whole exactly when its first line starts. The
    #    lengths still add up to the soundtrack.
    def frame(key):
        return WORK / f"f{key[0]:02d}_{key[1]}.png"

    STEP_FADE = 0.26
    CARD_FADE = 0.55
    FPS = 30

    fades = [0.0]
    for i in range(1, len(shots)):
        same_card = shots[i][0][0] == shots[i - 1][0][0]
        room = min(shots[i - 1][1], shots[i][1]) / 2
        fades.append(min(STEP_FADE if same_card else CARD_FADE, room))

    blends = WORK / "blend"
    if blends.exists():
        shutil.rmtree(blends)
    blends.mkdir(parents=True)

    print(f"\ndissolving {len(shots)} shots")
    lines = []
    for i, (key, d) in enumerate(shots):
        out_fade = fades[i + 1] if i + 1 < len(shots) else 0.0
        lines.append(f"file '{frame(key).as_posix()}'")
        lines.append(f"duration {max(0.04, d - out_fade):.4f}")

        if out_fade <= 0:
            continue
        steps = max(1, round(out_fade * FPS))
        a = cv2.imread(str(frame(key)))
        b = cv2.imread(str(frame(shots[i + 1][0])))
        for s in range(1, steps + 1):
            k = s / (steps + 1)
            tween = blends / f"b{i:03d}_{s:02d}.png"
            cv2.imwrite(str(tween), cv2.addWeighted(a, 1 - k, b, k, 0))
            lines.append(f"file '{tween.as_posix()}'")
            lines.append(f"duration {out_fade / steps:.4f}")

    # The concat demuxer ignores the duration on the last entry, so the final
    # frame is named twice: once with its length, once to close the list.
    lines.append(f"file '{frame(shots[-1][0]).as_posix()}'")
    shot_list = WORK / "shots.txt"
    shot_list.write_text("\n".join(lines), encoding="utf-8")

    picture = WORK / "picture.mp4"
    run("ffmpeg", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(shot_list),
        "-vf", f"fps={FPS},format=yuv420p", "-c:v", "libx264",
        "-preset", "veryfast", "-crf", "16", str(picture))
    print(f"  {duration(picture):.2f}s against a {total:.2f}s soundtrack")

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

    chain = "[0:v]fps=30,scale=1920:1080:flags=lanczos[base]"
    last = "base"
    overlays = []

    for card in sorted(windows):
        clip = clip_for(card)
        if not clip:
            continue
        start_t, end_t = windows[card]
        x, y, pw, ph, bezel = SLOTS.get(card, SLOT)
        # The drawn phone is inset a little, so its own rounded border still
        # shows around the recording instead of being covered by the square
        # corners of a video. A shot that bleeds off the frame is not.
        inset = 0 if card in SLOTS else 5
        vw = pw - inset * 2
        vh = ph - bezel
        # Scaled to the width and then cropped, never squashed.
        sw, sh = size(clip)
        tall = round(vw * sh / sw)
        # A screen recording gives up its top strip to the status bar the card
        # draws. A shot of a phone is framed as it was shot.
        lift = 22 if card in FOOTAGE and card not in SLOTS else 0
        # Two inputs are already taken: the cards and the audio.
        idx = 2 + len(overlays)
        inputs += ["-stream_loop", "-1", "-i", str(clip)]
        chain += (
            f";[{idx}:v]scale={vw}:{tall},crop={vw}:{vh}:0:{max(0, (tall - vh) // 2 - lift)},"
            f"setpts=PTS-STARTPTS+{start_t:.3f}/TB[p{card}]"
        )
        chain += (
            f";[{last}][p{card}]overlay={x + inset}:{y + bezel}:"
            f"enable='between(t,{start_t:.3f},{end_t:.3f})'[v{card}]"
        )
        last = f"v{card}"
        overlays.append(card)

    chain += f";[{last}]ass={ass.name}[v]"

    out = HERE / "rooted-demo.mp4"
    print(f"\nencoding, with footage in {len(overlays)} frames")
    run(
        "ffmpeg", "-loglevel", "error", "-y",
        "-i", str(picture),
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
