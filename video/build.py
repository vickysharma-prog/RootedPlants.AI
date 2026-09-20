"""Build the demo video.

Renders the title cards, speaks the narration, burns the subtitles and cuts
the whole thing together. The phone in the middle of ten of those cards plays
a recording: screen captures of the live site for the screens, and phone
footage for the shots that needed a real plant in a real hand. A card with no
recording for it says on screen what belongs there rather than pretending.

    cd video
    python -m http.server 3333 &
    python build.py

Out: rooted-demo.mp4, 1920x1080, with rooted-demo.srt beside it.

Needs ffmpeg on PATH and `pip install edge-tts`.
"""

import asyncio
import pathlib
import re
import shutil
import subprocess
import sys

import cv2
import edge_tts
import numpy as np

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
    (3, 4, "One site reported two thousand plantings. Thirty were found. None had survived.", 0.60),

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
    (10, 2, "Out loud, because whoever is doing this is holding a watering can.", 4.80),
    (10, 3, "It reads the frame twice a second, on the phone, uploading nothing.", 0.28),
    (10, 4, "Tilt down so the soil is in frame. Then the ring turns green.", 0.70),

    (11, 1, "Then it is checked, and every check says the number it measured.", 0.28),
    (11, 2, "It came off the camera. The time is ours. The location matches where this plant was registered.", 0.28),
    (11, 3, "And soil five percent darker than that plant's own dry baseline. Measured, not guessed.", 0.70),

    (12, 1, "This is the one that matters. If any plant earned points, the points would be worth nothing.", 0.35),
    (12, 2, "So OpenCV matches keypoints against the plant's first photograph, and asks whether they agree on one viewpoint.", 0.28),
    (12, 3, "The same plant returns four hundred and eighty five.", 0.42),
    (12, 4, "A different plant of the same species, in a similar pot, returns four.", 0.70),

    (13, 1, "Registering a plant checks the photograph before it accepts it.", 0.28),
    (13, 2, "Point it at a notebook and it says so. An object scores nought point two percent. The weakest real plant scored nine.", 3.00),
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
    (16, 5, "The money is there. The proof is the part nobody can produce. Rooted makes it, one verified task at a time, by the person who did the work.", 0.50),

    (17, 1, "We reward people for spending money.", 0.77),
    (17, 3, "Rooted rewards them for keeping something alive.", 0.80),

    (18, 1, "Plant it. Keep it. Get paid for it.", 0.35),
    (18, 2, "Rooted is already everywhere. It opens on any phone and sits on the home screen like an app. No store, nothing to install.", 0.35),
    (18, 3, "Scan the left one to use it. Scan the right one to read every line of it.", 0.63),
    (18, 4, "Nothing in here reports a number it did not measure.", 1.20),
]



# Which recording plays inside the phone on which card. Anything missing here
# leaves the card's own label on screen saying what belongs there.
FOOTAGE = {
    2: "landing",
    6: "join",
    7: "today",
    9: "plants",
    10: "guide",
    11: "verify",
    12: "earned",
    13: "register",
    14: "handheld",
    15: "rewards",
}

# The phone wakes two and a third seconds into the handheld clip and the
# message is there with it. Two soft notes on that frame, so the arrival is
# heard as well as seen.
CHIME_AT = 2.35

# How loud each recording's own sound sits under the narration. Two of them
# were captured off the phone and are clean. The notebook one was caught on a
# microphone with a room behind it, so it comes in lower: enough to hear the
# app refuse the photograph, not enough to bring the room with it.
UNDER = {"register": 0.58}
UNDER_DEFAULT = 0.82



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


def has_sound(path: pathlib.Path) -> bool:
    """Whether a clip brought any audio with it."""
    out = run(
        "ffprobe", "-v", "error", "-select_streams", "a",
        "-show_entries", "stream=codec_type", "-of", "csv=p=0", str(path),
    ).stdout.strip()
    return bool(out)


def slot_for(card: int):
    """Where a recording sits in the frame, and how big.

    The drawn phone is inset a little, so its own rounded border still shows
    around the recording instead of being covered by the square corners of a
    video. A shot that bleeds off the edge of the frame is not.
    """
    x, y, pw, ph, bezel = SLOTS.get(card, SLOT)
    inset = 0 if card in SLOTS else 5
    return x + inset, y + bezel, pw - inset * 2, ph - bezel


class Reel:
    """A recording, read forward a frame at a time.

    Sequential, the way a film is assembled, so there is never more than one
    frame of it in memory. It wraps round when the card runs longer than the
    recording, which a twelve second scroll under an eighteen second card has
    to do.
    """

    def __init__(self, path: pathlib.Path, x: int, y: int, w: int, h: int):
        self.path = path
        self.w, self.h = w, h
        # A screen recording gives up its top strip to the status bar the card
        # draws over it. A shot of a phone is framed as it was shot.
        self.lift = 0 if h >= 1000 else 22
        self.cap = cv2.VideoCapture(str(path))
        self.count = max(1, int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT)))
        self.n = -1
        self.cur = None

    def at(self, i: int):
        i %= self.count
        if i == self.n and self.cur is not None:
            return self.cur
        if i < self.n:
            self.cap.release()
            self.cap = cv2.VideoCapture(str(self.path))
            self.n = -1
        while self.n < i:
            ok, f = self.cap.read()
            if not ok:
                break
            self.n += 1
            self.cur = self.fit(f)
        return self.cur

    def fit(self, f):
        """Scaled to the width and cropped to the height, never squashed."""
        sh, sw = f.shape[:2]
        tall = max(self.h, round(self.w * sh / sw))
        r = cv2.resize(f, (self.w, tall), interpolation=cv2.INTER_AREA)
        top = max(0, (tall - self.h) // 2 - self.lift)
        return r[top:top + self.h]

    def close(self):
        self.cap.release()


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
    # The spoken lines and the rendered cards both stay, or the caches
    # below would never survive long enough to be caches.
    for old in WORK.glob("*"):
        keep = old.name.startswith("say") or re.fullmatch(r"f\d\d_\d\.png", old.name)
        if old.is_file() and not keep:
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
    # A card is only drawn again when the page it comes from has changed
    # under it. Fifty-nine headless screenshots is ten minutes, and most
    # rebuilds change the cut rather than the cards.
    frames = sorted({(l["card"], l["step"]) for l in lines})
    drawn_at = (HERE / "cards.html").stat().st_mtime
    todo = [(c, st) for c, st in frames
            if not (WORK / f"f{c:02d}_{st}.png").exists()
            or (WORK / f"f{c:02d}_{st}.png").stat().st_mtime < drawn_at]
    print(f"\nrendering {len(todo)} of {len(frames)} frames")
    for c, st in todo:
        render_card(c, st, WORK / f"f{c:02d}_{st}.png")

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
        # Inputs after the voice and the forest: the chime, and then every
        # recording that caught the app talking. A card about a voice with no
        # voice in it is a card making a claim nobody can check, so wherever
        # the phone spoke on the day, it speaks here.
        extra, parts, names = [], [], []

        if 14 in windows and clip_for(14):
            at_ms = int((windows[14][0] + CHIME_AT) * 1000)
            idx = 2 + len(extra) // 2
            extra += ["-i", str(chime)]
            parts.append(f"[{idx}:a]adelay={at_ms}|{at_ms},volume=0.85[x{idx}]")
            names.append(f"[x{idx}]")

        for card in sorted(windows):
            clip = clip_for(card)
            if not clip or not has_sound(clip):
                continue
            at_ms = int(windows[card][0] * 1000)
            idx = 2 + len(extra) // 2
            extra += ["-i", str(clip)]
            # Under the narration, but plainly there. It is the same kind of
            # voice as the one reading the film, so it sits lower to keep the
            # two apart.
            parts.append(
                f"[{idx}:a]aformat=sample_rates=44100:channel_layouts=mono,"
                f"volume={UNDER.get(FOOTAGE.get(card), UNDER_DEFAULT)},"
                f"adelay={at_ms}|{at_ms}[x{idx}]"
            )
            names.append(f"[x{idx}]")

        chain = "[1:a]volume=0.10,afade=t=in:st=0:d=2[bed];"
        if parts:
            chain += ";".join(parts) + ";"
        chain += (
            "[0:a][bed]" + "".join(names)
            + f"amix=inputs={2 + len(names)}:normalize=0"
            ":duration=first:dropout_transition=0,"
            f"afade=t=out:st={total - 2.0:.2f}:d=2[a]"
        )

        run("ffmpeg", "-loglevel", "error", "-y",
            "-i", str(voice_track),
            "-stream_loop", "-1", "-i", str(ambience),
            *extra,
            "-filter_complex", chain,
            "-map", "[a]", "-c:a", "aac", "-b:a", "192k", str(mixed))
        voice_track = mixed
        spoken_in = [c for c in sorted(windows)
                     if clip_for(c) and has_sound(clip_for(c))]
        if spoken_in:
            print(f"  the app is heard on card(s) {spoken_in}")

    # 5. The cards, each held for as long as its lines take, dissolved into
    #    one another rather than cut.
    #
    #    Held perfectly still and cut hard, a step arriving reads as a jump.
    #    Dissolved, the same step reads as the thing appearing while the line
    #    is said, which is what it is. A step inside a card gets a quick one,
    #    a new card a slower one, so a change of subject is felt.
    #
    #    The arithmetic keeps the voice off a half-drawn frame: a shot holds
    #    for its own length less the fade that follows it, then the fade runs,
    #    and the next shot is whole exactly when its first line starts. The
    #    lengths still add up to the soundtrack.
    def frame(key):
        return WORK / f"f{key[0]:02d}_{key[1]}.png"

    STEP_FADE = 0.26
    CARD_FADE = 0.60
    FPS = 30

    fades = [0.0]
    for i in range(1, len(shots)):
        same_card = shots[i][0][0] == shots[i - 1][0][0]
        room = min(shots[i - 1][1], shots[i][1]) / 2
        fades.append(min(STEP_FADE if same_card else CARD_FADE, room))

    # Every boundary is decided in whole frames before a single picture is
    # drawn, and each shot takes exactly the frames between its own two
    # boundaries, so the picture and the soundtrack cannot drift apart.
    edges = [0]
    at = 0.0
    for _key, d in shots:
        at += d
        edges.append(round(at * FPS))

    fade_frames = [
        min(edges[i + 1] - edges[i] - 1, round(fades[i + 1] * FPS))
        if i + 1 < len(shots) else 0
        for i in range(len(shots))
    ]

    # When each card first and last owns a frame, which is what its drift is
    # measured against.
    span = {}
    for i, (key, _d) in enumerate(shots):
        c = key[0]
        a, b = span.get(c, (edges[i], edges[i + 1]))
        span[c] = (min(a, edges[i]), max(b, edges[i + 1]))

    # Cards cut together and held perfectly still read as a deck of slides no
    # matter how good the slides are. Every card drifts slowly across its own
    # time on screen, one in, the next out, and a card change carries that
    # motion through the dissolve rather than stopping it. Drawing the film
    # here rather than in a filter graph is also the only way the drawn phone
    # and the recording inside it move together.
    DRIFT = 0.030
    SLIDE = 26
    order = sorted(span)
    towards = {c: (1 if n % 2 == 0 else -1) for n, c in enumerate(order)}

    def move(card, n):
        """How far into its drift a card is on frame n."""
        a, b = span[card]
        u = min(1.0, max(0.0, (n - a) / max(1, b - a)))
        if towards[card] < 0:
            u = 1 - u
        return 1.0 + DRIFT * u

    stills = {}

    def still(key):
        img = stills.get(key)
        if img is None:
            # Only what is in play is kept. Sixty frames of 1920 by 1080 at
            # once is most of a gigabyte for no reason.
            if len(stills) > 3:
                stills.clear()
            img = cv2.imread(str(frame(key)))
            stills[key] = img
        return img

    reels = {c: Reel(clip_for(c), *slot_for(c)) for c in order if clip_for(c)}

    def drawn(i, n):
        """Shot i as it looks on frame n, recording and all, before it moves."""
        key = shots[i][0]
        card = key[0]
        reel = reels.get(card)
        if reel is None:
            return still(key)
        out = still(key).copy()
        x, y, w, h = slot_for(card)
        got = reel.at(max(0, n - span[card][0]))
        if got is not None:
            out[y:y + h, x:x + w] = got
        return out

    def moved(i, n, slide):
        z = move(shots[i][0][0], n)
        cx, cy = 960.0, 540.0
        m = np.float32([[z, 0, cx - z * cx], [0, z, cy - z * cy + slide]])
        return cv2.warpAffine(drawn(i, n), m, (1920, 1080),
                              flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_REPLICATE)

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

    # 7. One pass: draw every frame, hand it straight to the encoder, and let
    #    it burn the captions on and carry the soundtrack.
    out = HERE / "rooted-demo.mp4"
    count = edges[-1]
    print(f"\ndrawing {count} frames, {len(reels)} cards with a recording in")

    enc = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", "1920x1080",
         "-r", str(FPS), "-i", "-",
         "-i", str(voice_track),
         "-filter_complex", f"[0:v]ass={ass.name}[v]",
         "-map", "[v]", "-map", "1:a",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19",
         "-pix_fmt", "yuv420p",
         # Straight out of the mix this landed at -26 LUFS, which is a demo a
         # judge has to reach for the volume to hear. Platforms normalise to
         # about -14, so this lands near it with headroom left.
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
         "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", "-shortest", str(out)],
        stdin=subprocess.PIPE, cwd=HERE,
    )

    i = 0
    for n in range(count):
        while i + 1 < len(shots) and n >= edges[i + 1]:
            i += 1
        held = fade_frames[i]
        opens = edges[i + 1] - held
        if held and n >= opens:
            k = (n - opens + 1) / (held + 1)
            turn = shots[i][0][0] != shots[i + 1][0][0]
            img = cv2.addWeighted(
                moved(i, n, -SLIDE * k if turn else 0.0), 1 - k,
                moved(i + 1, n, SLIDE * (1 - k) if turn else 0.0), k, 0,
            )
        else:
            img = moved(i, n, 0.0)
        enc.stdin.write(img.tobytes())

    for r in reels.values():
        r.close()
    enc.stdin.close()
    if enc.wait() != 0:
        sys.exit("the encoder refused the frames")

    print(f"\n{out}  {out.stat().st_size / 1e6:.1f} MB  {int(total) // 60}:{int(total) % 60:02d}")
    print(f"{srt}")
    missing = [c for c in sorted(windows) if c in FOOTAGE and not clip_for(c)]
    if missing:
        print(f"\nno recording for card(s) {missing}: those frames say so on screen.")


if __name__ == "__main__":
    asyncio.run(main())
