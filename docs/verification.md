# Verification

Rooted pays people for keeping a plant alive. That only means something if the
app can tell whether the work happened, so the checking is the product rather
than a detail of it.

Everything below runs on the device, on a 256px copy of the photograph:
`web/lib/verify.ts` for the measurements and `web/lib/identity.ts` for the
keypoint matching. Nothing is uploaded and no model is called.

## The rule the checks are written to

**Every check reports the number it measured, and claims nothing beyond it.**

A location match says the photograph came from the right spot. It does not say
it is the right plant, because a coordinate cannot know that, and for a while
the check standing next to it did not either: it compared an 8 by 8 grid of
cell brightnesses, which a different neem tree passes, while carrying a label
that implied more. That was the weakest thing in here wearing the name of the
strongest, so it was replaced with keypoint matching, which answers the
question, and demoted to a clearly labelled fallback.

The instruction shown before the shutter is the same thing the checks test.
There is no hidden standard: follow the line, pass every time.

## Every photograph

| Check | What it measures | Passes when |
|---|---|---|
| Photographed in the app | Whether the frame came off the camera stream or a file picker | It came from the camera |
| Timed on our side | A timestamp from `/api/now`, never read off the file | The server answered |
| Taken at the plant's spot | Haversine distance from the device fix to the registered coordinates | Within 120m |

## Then, per task

**It is this plant.** ORB finds up to 1200 keypoints in both photographs, the
binary descriptors are matched, Lowe's ratio test at 0.75 throws out every
match that is not clearly better than its runner-up, and RANSAC then asks
whether the survivors agree on one homography: the same points on the same
object, seen from somewhere slightly different. Passes at 25 inliers.

This runs in the browser through OpenCV 5, on the person's own phone. The
library is 13MB and is fetched the moment the camera opens, so it is ready by
the time anybody has finished lining up a shot. If it has not arrived, the
weaker framing comparison below stands in its place and the card says which one
ran.

The threshold was set against real photographs before it shipped, and then
confirmed in the browser:

| | inliers |
|---|---|
| Same plant, seen again from a slightly different angle, distance and light | 388 to 700 |
| A different plant of the same species, in a similar pot | 0 to 4 |
| Measured live in the app: the plant's own baseline | 485 |
| Measured live in the app: a different neem tree | 4 |

25 sits six times above the worst wrong answer and an order of magnitude below
the weakest right one.

**Framed like the first photo**, the fallback. The frame is cut into an 8 by 8
grid, the mean brightness of each cell is taken for both photographs, and the
correlation between the two sets of 64 numbers is computed. Passes above 0.45.
It is only used when OpenCV could not run, and it is reported as framing rather
than identity, because that is all it measures: a different neem tree passes
it.

**Watering: soil is darker than dry.** Mean brightness of the soil band, the
middle half of the frame from 62% to 98% down, against the same band of the
plant's dry baseline. Passes at 5% darker or more.

The threshold was set against real frames rather than guessed. A watered pot
reads **28.4% darker** than its dry baseline. The same frame compared against
itself reads **0.0%**. Five percent sits clear of both, with room for the
difference an afternoon's light makes.

**Feeding: something is on the soil.** The same band, but any change in either
direction above 4%, because compost is darker and most granular feed is
lighter.

**Check-in: leaves are in frame.** The fraction of the frame where green leads
both other channels by 6%, against that plant's usual. Passes above half of it.

**Pests: close enough to see trouble.** A pest photograph is a close-up of the
underside of one leaf, so it is deliberately **not** compared against the wide
baseline and the framing check is skipped for it. It has to be at least 20%
leaf and carry enough fine detail, measured as the average step between
neighbouring pixels, that something the size of an aphid would show.

## When a check does not pass

The task stays open, the streak is held, and the card says which check and
what it measured in plain words. Nothing is silently rejected and nothing is
silently accepted.

## The guide, before any of this

While the camera is open the app reads the live frame roughly every 700ms and
says the one thing that would make this shot pass: too dark, hold still, tilt
down so the soil is in frame, point it at the plant, that is it. Out loud
through the browser's own speech synthesis, so there is no voice to download
and nothing leaves the device, and visually through the ring around the
shutter turning green.

It is the same measurements as the checks, run before the shutter instead of
after it. Somebody standing in a garden should not find out afterwards that
the photograph was too dark to check.

## What this does not do

**It does not diagnose the plant's health from its leaves.** The health tracker
is care measured against the schedule, not a number invented from a picture. A
yellow leaf has a dozen causes, and a score built from one would get trusted.

**It does not identify a plant from a close-up.** A pest photograph is one leaf
filling the frame, and there is nothing in it to match against a picture of the
whole plant, so pest tasks are checked for closeness and sharpness instead. What
ties them to the plant is the location and the task history around them.

**It does not know a plant it has never seen.** Everything above is a comparison
against that plant's own first photograph. A plant with no baseline gets one
from its first proof, and that photograph is trusted because there is nothing
yet to check it against.
