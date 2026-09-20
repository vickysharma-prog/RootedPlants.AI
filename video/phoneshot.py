"""Put our notification onto a real phone in a real hand.

The reminder frame used to be drawn: an illustration of a notification inside
an illustration of a phone. It read as a mockup, because it was one.

This takes handheld footage of somebody holding a phone that lights up with a
message, tracks the glass across every frame, and lays our own notification
over the one that was already there. Nothing else on that screen is touched.
The wallpaper, the clock, the carrier and the lock are the ones that were in
the shot, which is the whole reason it looks like a photograph of a phone
rather than a picture of one.

    python phoneshot.py

In:  a handheld clip of a phone, and build/notice.png for the message.
Out: footage/handheld.mp4, the same size as the source clip.

The two quads below are measured once by eye in one reference frame and then
tracked, because a phone in a hand is rigid and only the camera moves.
"""

import pathlib
import subprocess

import cv2
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "footage" / "handheld.mp4"

PHONE = pathlib.Path.home() / "Downloads" / "7822022-hd_1080_1920_30fps.mp4"
NOTICE = HERE / "build" / "notice.png"

# The frame the corners were measured in.
REF = 90

# The glass, clockwise from the top left. Only used to read how bright the
# screen is and to find something to track.
GLASS = np.float32([
    [202, 458],
    [740, 390],
    [818, 1462],
    [300, 1535],
])

# Where our notification goes. It takes the top edge of the banner that was
# already on screen, and runs further down it: sized for a hand it would be a
# fifth of the frame and nobody could read it.
NOTICE_AT = np.float32([
    [264, 738],
    [754, 692],
    [782, 1010],
    [293, 1056],
])

# The corner radius, as a fraction of the notification's width.
RADIUS = 0.076

# How long the notification takes to settle, in frames, and how far it slides.
POP = 9
SLIDE = 0.10


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


def track(frames, ref: int, quads):
    """Where each quad is in every frame.

    Optical flow from one frame to the next, on whatever corners can be found
    on and around the phone, fitted to one homography. The phone is flat and
    rigid, so a single homography moves every quad at once, and stepping frame
    by frame survives the screen lighting up in the middle, which a match
    against one reference frame does not.
    """
    grey = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    out = [None] * len(frames)
    out[ref] = [q.copy() for q in quads]

    def step(a: int, b: int):
        here = out[a]
        mask = np.zeros(grey[a].shape, np.uint8)
        cv2.fillConvexPoly(mask, here[0].astype(np.int32), 255)
        # A margin around the glass, so the case and the fingers holding it
        # give us something to follow while the screen itself is changing.
        mask = cv2.dilate(mask, np.ones((90, 90), np.uint8))

        p0 = cv2.goodFeaturesToTrack(grey[a], 600, 0.01, 7, mask=mask)
        if p0 is None or len(p0) < 12:
            return [q.copy() for q in here]

        p1, ok, _ = cv2.calcOpticalFlowPyrLK(grey[a], grey[b], p0, None,
                                             winSize=(31, 31), maxLevel=4)
        back, _, _ = cv2.calcOpticalFlowPyrLK(grey[b], grey[a], p1, None,
                                              winSize=(31, 31), maxLevel=4)
        keep = (abs(p0 - back).reshape(-1, 2).max(-1) < 1.0) & (ok.ravel() == 1)
        if keep.sum() < 12:
            return [q.copy() for q in here]

        h, _ = cv2.findHomography(p0[keep], p1[keep], cv2.RANSAC, 2.0)
        if h is None:
            return [q.copy() for q in here]
        return [cv2.perspectiveTransform(q.reshape(-1, 1, 2), h).reshape(4, 2)
                for q in here]

    for i in range(ref + 1, len(frames)):
        out[i] = step(i - 1, i)
    for i in range(ref - 1, -1, -1):
        out[i] = step(i + 1, i)
    return out


def rounded(w: int, h: int, radius: int):
    """A notification-shaped mask, with the corners a notification has."""
    m = np.zeros((h, w), np.uint8)
    cv2.rectangle(m, (radius, 0), (w - radius, h), 255, -1)
    cv2.rectangle(m, (0, radius), (w, h - radius), 255, -1)
    for cx, cy in ((radius, radius), (w - radius, radius),
                   (radius, h - radius), (w - radius, h - radius)):
        cv2.circle(m, (cx, cy), radius, 255, -1)
    return m


def lit(frames, quads):
    """How awake the screen is in each frame, from nought to one.

    Measured rather than assumed, so our notification arrives exactly when the
    phone's own screen does. Dropped in cold it would glow through a phone
    that is still asleep.
    """
    vals = []
    for f, q in zip(frames, quads):
        m = np.zeros(f.shape[:2], np.uint8)
        cv2.fillConvexPoly(m, q[0].astype(np.int32), 255)
        vals.append(float(cv2.mean(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), m)[0]))
    v = np.array(vals)
    lo, hi = np.percentile(v, 5), np.percentile(v, 95)
    return np.clip((v - lo) / max(1e-6, hi - lo), 0, 1)


def main():
    frames = read(PHONE)
    notice = cv2.imread(str(NOTICE))
    if notice is None:
        raise SystemExit(f"render {NOTICE} first, from notice.html at 1400x940")
    print(f"{len(frames)} frames of phone, notice {notice.shape[1]}x{notice.shape[0]}")

    nh, nw = notice.shape[:2]
    mask = rounded(nw, nh, int(nw * RADIUS))
    mask = cv2.GaussianBlur(mask, (0, 0), 2.0).astype(np.float32) / 255.0

    quads = track(frames, REF, [GLASS, NOTICE_AT])
    awake = lit(frames, quads)
    # The first frame where the screen is more than half up. The notification
    # settles from there.
    wake = int(np.argmax(awake > 0.5))
    print(f"  the screen comes up at frame {wake} ({wake / 30:.2f}s)")

    src = np.float32([[0, 0], [nw, 0], [nw, nh], [0, nh]])
    h, w = frames[0].shape[:2]

    enc = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", "30",
         "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
         "-pix_fmt", "yuv420p", str(OUT)],
        stdin=subprocess.PIPE,
    )

    last = frames[-1]
    for i, frame in enumerate(frames):
        out = frame
        alpha_now = float(awake[i])
        if alpha_now > 0.02:
            q = quads[i][1].copy()
            # It slides down into place the way a notification does, over the
            # few frames the screen itself takes to come up.
            k = min(1.0, max(0.0, (i - wake + POP) / POP))
            ease = 1 - (1 - k) ** 3
            down = (q[3] - q[0]) * SLIDE * (1 - ease)
            q = q - down

            hm = cv2.getPerspectiveTransform(src, q)
            laid = cv2.warpPerspective(notice, hm, (w, h))
            a = cv2.warpPerspective(mask, hm, (w, h)) * alpha_now * ease
            a = a[:, :, None]
            out = (laid * a + frame * (1 - a)).astype(np.uint8)
        enc.stdin.write(out.tobytes())
        last = out

    # The clip is shorter than the frame it plays in, and looping it would
    # snap the phone back to asleep mid-sentence. It holds instead, on the
    # message, which is where the eye wants to be anyway.
    for _ in range(30 * 5):
        enc.stdin.write(last.tobytes())

    enc.stdin.close()
    enc.wait()
    print(f"{OUT}  {OUT.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
