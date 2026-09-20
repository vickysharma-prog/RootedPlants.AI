"""Cut the phone recordings down to the pieces the film uses.

The recordings are long: a whole registration, start to finish, shot on my own
phone. The film needs seconds of each, in the frame where the narration is
talking about that exact thing, so the cuts live here rather than in my head.

    python cut.py

Out: one mp4 per frame that needs one, in footage/, already the length that
frame runs for. Each ends on a held frame rather than looping, because a clip
that loops snaps back to the beginning mid-sentence.
"""

import pathlib
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "footage"
TAKES = pathlib.Path.home() / "Downloads"

# Everything is normalised to this, which is what the recordings already are
# apart from one that is a little taller.
W, H = 576, 1280

# name: [(file, from, to), ...] and how long the finished clip should run.
# Anything left over after the pieces is the last frame, held.
CUTS = {
    # The camera talking you through the shot: a clean frame, a pan onto the
    # plant, and the line that says it is right.
    "guide": (18.0, [
        ("WhatsApp Video 2026-09-20 at 15.44.57.mp4", 14.5, 26.5),
    ]),
    # Registering: it refuses a notebook out loud, and then the species list
    # with the names people actually use.
    "register": (19.0, [
        ("WhatsApp Video 2026-09-20 at 16.26.41.mp4", 23.0, 34.0),
        ("WhatsApp Video 2026-09-20 at 15.41.49.mp4", 43.5, 51.0),
    ]),
}


def run(*args):
    subprocess.run(args, check=True, capture_output=True, text=True)


def main():
    OUT.mkdir(exist_ok=True)
    work = HERE / "build" / "cuts"
    work.mkdir(parents=True, exist_ok=True)

    for name, (length, pieces) in CUTS.items():
        parts = []
        for i, (src, a, b) in enumerate(pieces):
            part = work / f"{name}{i}.mp4"
            run("ffmpeg", "-loglevel", "error", "-y",
                "-ss", f"{a}", "-to", f"{b}", "-i", str(TAKES / src),
                # Scaled to the width and cropped to the height, so a
                # recording from a slightly taller phone still lines up with
                # the rest instead of being squashed to fit.
                "-vf", f"scale={W}:-2,crop={W}:{H},fps=30,setsar=1",
                "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                "-pix_fmt", "yuv420p", str(part))
            parts.append(part)

        joined = work / f"{name}_join.mp4"
        listing = work / f"{name}.txt"
        listing.write_text(
            "\n".join(f"file '{p.as_posix()}'" for p in parts), encoding="utf-8"
        )
        run("ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0",
            "-i", str(listing), "-c", "copy", str(joined))

        # Held on the last frame out to the length the frame runs for.
        out = OUT / f"{name}.mp4"
        run("ffmpeg", "-loglevel", "error", "-y", "-i", str(joined),
            "-vf", f"tpad=stop_mode=clone:stop_duration={length}",
            "-t", f"{length}",
            "-c:v", "libx264", "-preset", "slow", "-crf", "18",
            "-pix_fmt", "yuv420p", str(out))
        print(f"  {name:10} {length:4.1f}s  {out.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
