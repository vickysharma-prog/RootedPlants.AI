"""Measure whether watering is visible as soil darkening, on aligned pixels.

The watering check compares the soil in a proof photo against that plant's own
dry baseline. Comparing raw frames does not work, because the camera moves and
the light changes. So: register the proof onto the baseline, warp it, and
compare the same physical pixels. A second region acts as a lighting control,
so a photo taken under a cloud does not read as a watering.

    python tools/soil_delta.py baseline_dry.jpg proof_wet.jpg

Two photos of the same pot, one dry and one just watered. Roughly the same
angle, and deliberately not identical light, because that is the case the
check has to survive.

A clear result: soil drops by 15 or more on the 0-255 scale while the control
stays within a few points.
"""

import sys

import cv2
import numpy as np


def register(baseline, proof):
    """Warp proof onto baseline. Returns the warped image and the inlier ratio."""
    sift = cv2.SIFT_create()
    kp1, des1 = sift.detectAndCompute(cv2.cvtColor(baseline, cv2.COLOR_BGR2GRAY), None)
    kp2, des2 = sift.detectAndCompute(cv2.cvtColor(proof, cv2.COLOR_BGR2GRAY), None)

    if des1 is None or des2 is None or len(kp1) < 10 or len(kp2) < 10:
        return None, 0.0

    matches = cv2.BFMatcher().knnMatch(des2, des1, k=2)
    good = [m for m, n in matches if m.distance < 0.75 * n.distance]
    if len(good) < 10:
        return None, 0.0

    src = np.float32([kp2[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp1[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
    if H is None:
        return None, 0.0

    h, w = baseline.shape[:2]
    return cv2.warpPerspective(proof, H, (w, h)), float(mask.sum()) / len(good)


def soil_mask(bgr):
    """Rough soil region: dull, not green, lower part of the frame."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, _ = cv2.split(hsv)
    not_green = cv2.inRange(h, 35, 85) == 0
    lower = np.zeros(h.shape, dtype=bool)
    lower[h.shape[0] // 2 :, :] = True
    return not_green & (s < 120) & lower


def value(bgr):
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[:, :, 2].astype(np.float32)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)

    baseline = cv2.imread(sys.argv[1])
    proof = cv2.imread(sys.argv[2])
    if baseline is None or proof is None:
        sys.exit("could not read one of the images")

    scale = 900.0 / baseline.shape[1]
    baseline = cv2.resize(baseline, None, fx=scale, fy=scale)
    proof = cv2.resize(proof, (baseline.shape[1], baseline.shape[0]))

    warped, inliers = register(baseline, proof)
    if warped is None:
        sys.exit("registration failed, the two photos do not show the same scene")

    soil = soil_mask(baseline)
    valid = (warped.sum(axis=2) > 0) & soil
    control = (warped.sum(axis=2) > 0) & ~soil

    if valid.sum() < 500:
        sys.exit("soil region too small to measure")

    vb, vw = value(baseline), value(warped)
    soil_drop = float(vb[valid].mean() - vw[valid].mean())
    control_drop = float(vb[control].mean() - vw[control].mean())

    print("registration inliers : %.2f" % inliers)
    print("soil pixels          : %d" % valid.sum())
    print("soil brightness drop : %6.2f" % soil_drop)
    print("control drop         : %6.2f   (lighting)" % control_drop)
    print("corrected drop       : %6.2f" % (soil_drop - control_drop))
    print()

    corrected = soil_drop - control_drop
    if inliers < 0.4:
        print("registration is weak, treat the rest as unreliable.")
    elif corrected >= 15:
        print("clear. the watering check can lean on this.")
    elif corrected >= 7:
        print("weak. usable as one signal, not on its own.")
    else:
        print("inside the noise. fall back to the visible-water check.")


if __name__ == "__main__":
    main()
