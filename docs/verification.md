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

Why registration rather than a looser comparison is set out in
[A note on the approach](#a-note-on-the-approach).

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

## A note on the approach

Registration-first is a deliberate choice over the easier version of this.

The easy version compares two photos loosely, a similarity score, a colour
histogram, an average brightness. It falls over the first time somebody stands
a step to the left or a cloud passes. It also cannot answer the question that
actually matters, which is what changed about *this* plant since last time.

Registering first turns two pictures into one coordinate system. After that,
every check is a comparison of the same physical pixels, and the checks get
simple: the soil here is darker than it was, the foliage here is gone.

It also gives the pipeline a way to know when to stop. If registration is weak,
the inlier ratio says so before any downstream check runs, and the task goes to
review rather than being guessed at. Knowing when not to trust a result is
harder than producing one, and it is why **pending review** is a first class
outcome here rather than an afterthought.
