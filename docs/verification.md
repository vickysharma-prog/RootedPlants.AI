# Verification

Points are awarded for **doing the task**, not for the plant's condition. That
decision is settled. Condition is a slow signal, it is partly outside the
user's control, and rewarding it stretches the user too far for too long.
Rewarding the task keeps the loop tight: we ask for something small, the user
does it, they get paid for it that day.

That only works if we can tell whether the task was actually done. So the
verification pipeline is not a side feature, it is the thing the whole reward
economy rests on. If it is soft, points are free, and free points are worth
nothing.

## The contract with the user

The user is never guessing how to prove something. Every task card says, before
they open the camera, exactly what the photo has to show.

> **Water your neem, and photograph it while you pour.**
> Hold the camera so the base of the plant and the wet soil are both in frame.
> Take it from roughly where you took the first photo.

No hidden test. The instruction is the spec, and the same spec is what the
pipeline checks. A user who follows the instruction passes every time. That is
the design: verification that is strict against fraud and effortless for an
honest user.

## Four layers

Each layer is cheap on its own. Together they make faking a task more work than
doing it.

### 1. Capture, locked to the app

Photos come from the in-app camera only. There is no gallery upload path, so
there is nothing to feed an old or borrowed photo into.

### 2. Time, from the server

The timestamp is taken server side at upload. EXIF is never trusted, it is a
text field anyone can rewrite.

### 3. Place, locked at registration

When a plant is registered its coordinates are fixed. Every later proof photo
has to come from within a small radius of that point. A tree does not move, so
neither should the person photographing it.

### 4. Scene, registered against the baseline

The registration photo is the plant's baseline. Every later photo is
**registered** onto it: SIFT keypoints, matched, homography, then judged on the
inlier ratio and the reprojection error. The background, the pot, the wall and
the ground all have to agree. This is what stops somebody photographing a
different plant from the right spot.

Registration is not only an identity check. Once the two photos are aligned,
the same physical pixels line up across time, and every per-task check below
becomes a comparison of the same soil and the same leaves rather than a
comparison of two loosely similar pictures.

This is a technique I have already built and measured. See
[Prior work](#prior-work).

## Per-task checks

On top of the four layers, each task type has one check specific to it, and all
of them run **after** registration, on aligned pixels.

| Task | What the photo has to show | How it is checked |
|---|---|---|
| Watering | wet soil, water visible while pouring | aligned soil pixels darken against the plant's own dry baseline, plus a vision check for visible water |
| Fertilising | product at the base of the plant | aligned difference at soil level, plus a vision check |
| Pruning | the plant after the work | aligned difference showing foliage removed where it was removed |
| Health check-in | the whole plant, clearly | vision check for species consistency and visible distress |

### The watering check, in detail

Wet soil is darker than dry soil.

The naive version of this check takes the average brightness of the lower half
of the frame and compares it to a threshold, and it falls apart the moment the
light changes or the camera moves. The version worth building aligns first:
register the proof photo onto the baseline, warp it, then compare **the same
soil pixels** before and after. Camera angle stops mattering. What is left is
the change in the soil itself.

Lighting still moves. So the delta is measured relative to the plant's own
history rather than against a fixed number, and a non-soil region of the same
frame acts as the lighting control. A real watering shows the soil dropping
while the control does not.

`tools/soil_delta.py` measures exactly this: align, warp, diff the soil region,
report the drop against the control.

**Status: not yet validated on real photos.** Two pictures of one pot, dry and
just watered, settles it. See `state.md`.

## Aerial verification, for drives

Ground photos verify one plant at a time, which is the right unit for a person
caring for a plant. It is the wrong unit for a company that planted 5,000
saplings and wants to know how many are alive.

For those, the same question is answered from above. Crown detection on drone
or aerial imagery counts what is standing in a planted plot, and repeated
flights turn that into a survival curve for the whole site. This is what a CSR
or government buyer is actually paying for, and it is the same skill set as the
ground pipeline pointed at a different altitude.

Out of scope for the four days. In scope for the pitch, because it is the
answer to how this scales past one person with one watering can.

## The agent

The layers do not vote by themselves. An agent takes every signal, the GPS
delta, the time, the scene match score, the soil delta, the vision output, and
writes a verdict with a reason in plain language.

Three outcomes:

- **Verified.** Points land immediately.
- **Pending review.** Something did not line up. The task stays open, the user
  is told which part of the photo did not work, and they can retake it. The
  streak is held, not broken, while it is pending.
- **Rejected.** Only for a clear mismatch, and the reason is always shown.

**Nothing in this pipeline blocks the loop.** If a model call times out or a
service is down, the task completes and the points are awarded, flagged for
later review. A demo that hangs on an API call costs more than a check that
ran late.

## What is deliberately not here

**OCR.** It has no job. We own the camera, so identity, time and location are
stamped server side from data we already hold. Reading them back off a picture
would be solving a problem we created.

## Why this is the interesting part

Every layer here is a real answer to a real attack:

| Attack | What stops it |
|---|---|
| Upload an old photo | in-app camera only, server timestamp |
| Photograph someone else's tree | GPS radius from registration |
| Photograph a different plant nearby | scene match against the baseline |
| Photograph without watering | soil darkness delta, visible water check |
| Register one tree twice | one plant per coordinate cluster |

That table is the answer to the sharpest question a judge can ask, which is
"what stops people cheating for the coupons".

## Prior work

The computer vision here is not a guess about what might work. I have built and
measured this pipeline before, on a harder problem.

`Recovering-computer-vision-annotations` recovers 2.81 million bird
observations that were drawn onto 18,304 aerial photographs by a counting tool
that never saved the coordinates. It was developed for Google Summer of Code
2026 under the DeepForest project. The pipeline registers each screenshot onto
its clean original, subtracts, finds the dots, reads the legend, classifies
each dot and exports a training dataset.

What carries over, and it is the whole backbone of the verification above:

| There | Here |
|---|---|
| registering a screenshot onto its original, 96.7% success at 0.38px median reprojection error over 60 pairs | registering a proof photo onto the plant's baseline |
| subtracting the aligned original to isolate what was drawn on top | subtracting the aligned baseline to isolate what changed about the plant |
| a trust check that runs without labels, so a frame that cannot be accurate is rejected before anything is built on it | a verification that knows when it should not be trusted, and sends the task to review instead of guessing |
| crown detection and DeepForest fine-tuning on recovered data | counting what is standing in a planted plot from the air |

The third row is the one that matters most. The hardest part of an automated
verifier is not being right, it is knowing when it is not. That discipline is
already built and measured, and it is why **pending review** is a first class
outcome here rather than an afterthought.

**Disclosure:** that project was built before this hackathon, between March and
August 2026. It is prior work of mine, it is listed in `state.md` under prior
art, and nothing from it is claimed as built during the hackathon period. What
is reused is technique and judgement. Any code carried across will be named in
that table, file by file.
