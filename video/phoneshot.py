"""Put our lock screen onto a real phone in a real hand.

The reminder frame used to be drawn: an illustration of a notification inside
an illustration of a phone. It read as a mockup, because it was one. This
takes handheld footage of somebody holding a phone, tracks the glass across
every frame, and lays our own lock screen onto it in perspective. What comes
out is the message this app actually composes, arriving on a phone somebody is
holding.

    python phoneshot.py

In:  a handheld clip of a phone, and footage/reminder.mp4 for the screen.
Out: footage/handheld.mp4, the same size as the source clip.

The quad below is the four corners of the glass in the reference frame. It is
measured once by eye and then tracked, because a phone in a hand is rigid and
only the camera moves.
"""

import pathlib
import subprocess

import cv2
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "footage" / "handheld.mp4"

PHONE = pathlib.Path.home() / "Downloads" / "7822022-hd_1080_1920_30fps.mp4"
SCREEN = HERE / "footage" / "reminder.mp4"

# The frame the corners were measured in, and those corners, clockwise from
# the top left, in that frame's own pixels.
REF = 90
GLASS = np.float32([
    [202, 458],
    [740, 390],
    [818, 1462],
    [300, 1535],
])

# The screen stays dark until the phone wakes. Measured off the clip: the
# glass is black for the first two seconds, and our screen fades up over it
# so the light on the hand does not appear before the light that causes it.
WAKE = 58
FADE = 7

# The corner radius of the glass, as a fraction of its width.
RADIUS = 0.085


def read(path: pathlib.Path):
    cap = cv2.VideoCapture(str(path))
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    cap.release()
    return out


def track(frames, ref: int, quad):
    """Where the glass is in every frame.

    Optical flow from one frame to the next, on whatever corners can be found
    inside the phone, fitted to a homography. The phone is flat and rigid, so
    one homography describes the whole move, and stepping frame by frame
    survives the screen lighting up in the middle, which a match against a
    single reference frame does not.
    """
    grey = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    quads = [None] * len(frames)
    quads[ref] = quad.copy()

    def step(a: int, b: int):
        here = quads[a]
        mask = np.zeros(grey[a].shape, np.uint8)
        cv2.fillConvexPoly(mask, here.astype(np.int32), 255)
        # A margin around the glass, so the case and the fingers holding it
        # give us something to follow while the screen itself is changing.
        mask = cv2.dilate(mask, np.ones((90, 90), np.uint8))

        p0 = cv2.goodFeaturesToTrack(grey[a], 600, 0.01, 7, mask=mask)
        if p0 is None or len(p0) < 12:
            return here.copy()

        p1, ok, _ = cv2.calcOpticalFlowPyrLK(grey[a], grey[b], p0, None,
                                             winSize=(31, 31), maxLevel=4)
        back, _, _ = cv2.calcOpticalFlowPyrLK(grey[b], grey[a], p1, None,
                                              winSize=(31, 31), maxLevel=4)
        keep = (abs(p0 - back).reshape(-1, 2).max(-1) < 1.0) & (ok.ravel() == 1)
        if keep.sum() < 12:
            return here.copy()

        h, _ = cv2.findHomography(p0[keep], p1[keep], cv2.RANSAC, 2.0)
        if h is None:
            return here.copy()
        return cv2.perspectiveTransform(here.reshape(-1, 1, 2), h).reshape(4, 2)

    for i in range(ref + 1, len(frames)):
        quads[i] = step(i - 1, i)
    for i in range(ref - 1, -1, -1):
        quads[i] = step(i + 1, i)
    return quads


def rounded(w: int, h: int, radius: int):
    """A screen-shaped mask, with the corners the glass actually has."""
    m = np.zeros((h, w), np.uint8)
    cv2.rectangle(m, (radius, 0), (w - radius, h), 255, -1)
    cv2.rectangle(m, (0, radius), (w, h - radius), 255, -1)
    for cx, cy in ((radius, radius), (w - radius, radius),
                   (radius, h - radius), (w - radius, h - radius)):
        cv2.circle(m, (cx, cy), radius, 255, -1)
    return m


def main():
    frames = read(PHONE)
    screen = read(SCREEN)
    print(f"{len(frames)} frames of phone, {len(screen)} of screen")

    sh, sw = screen[0].shape[:2]
    mask = rounded(sw, sh, int(sw * RADIUS))
    # A pixel of feather, so the edge of the glass is not a cut line.
    mask = cv2.GaussianBlur(mask, (0, 0), 1.6).astype(np.float32) / 255.0

    quads = track(frames, REF, GLASS)
    src = np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]])

    h, w = frames[0].shape[:2]
    enc = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", "30",
         "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
         "-pix_fmt", "yuv420p", str(OUT)],
        stdin=subprocess.PIPE,
    )

    for i, frame in enumerate(frames):
        out = frame
        if i >= WAKE and i - WAKE < len(screen):
            hm = cv2.getPerspectiveTransform(src, quads[i])
            lit = cv2.warpPerspective(screen[i - WAKE], hm, (w, h))
            alpha = cv2.warpPerspective(mask, hm, (w, h))
            # The screen comes up rather than snapping on, the way a phone
            # waking actually looks.
            alpha = alpha * min(1.0, (i - WAKE + 1) / FADE)
            a = alpha[:, :, None]
            out = (lit * a + frame * (1 - a)).astype(np.uint8)
        enc.stdin.write(out.tobytes())
        last = out

    # The clip is shorter than the frame it plays in, and looping it would
    # snap the phone back to asleep mid-sentence. It holds instead, on the
    # message, which is where the eye wants to be anyway.
    for _ in range(int(30 * 5)):
        enc.stdin.write(last.tobytes())

    enc.stdin.close()
    enc.wait()
    print(f"{OUT}  {OUT.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
