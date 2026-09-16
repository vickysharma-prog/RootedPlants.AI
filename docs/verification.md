# Verification

Rooted pays people for keeping a plant alive. That only means something if the
app can tell whether the work happened, so the checking is the product rather
than a detail of it.

Everything below runs in `web/lib/verify.ts`, on the device, on a 256px copy of
the photograph. Nothing is uploaded and no model is called.

## The rule the checks are written to

**Every check reports the number it measured, and claims nothing beyond it.**

A location match says the photograph came from the right spot. It does not say
it is the right plant, because a coordinate cannot know that. A framing match
says the shot is arranged like the first one closely enough to compare them. It
does not say the plant is the same plant, because an 8 by 8 grid of
brightnesses cannot tell two plants apart and a check that claimed it could
would be the weakest thing in here pretending to be the strongest.

The instruction shown before the shutter is the same thing the checks test.
There is no hidden standard: follow the line, pass every time.

## Every photograph

| Check | What it measures | Passes when |
|---|---|---|
| Photographed in the app | Whether the frame came off the camera stream or a file picker | It came from the camera |
| Timed on our side | A timestamp from `/api/now`, never read off the file | The server answered |
| Taken at the plant's spot | Haversine distance from the device fix to the registered coordinates | Within 120m |

## Then, per task

**Framed like the first photo.** The frame is cut into an 8 by 8 grid, the mean
brightness of each cell is taken for both photographs, and the correlation
between the two sets of 64 numbers is computed. Passes above 0.45. This exists
to make the soil comparison meaningful, not to identify anything.

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

Two things are deliberately not attempted, and both are named rather than
hidden.

**It does not identify the plant from the photograph.** The location, the
framing and the photo history together are what tie a proof to a plant.

**It does not diagnose the plant's health from its leaves.** The health tracker
is care measured against the schedule, not a number invented from a picture. A
yellow leaf has a dozen causes, and a score built from one would get trusted.
