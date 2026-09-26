# Risks, and the answers

Written as answers, not as worries. Most of these get asked out loud by
somebody eventually, and the point of this file is that none of them is heard
for the first time in the room.

---

### "What stops people faking the photos for rewards?"

Layers, each answering a specific attack. Full detail in
[`verification.md`](verification.md), including what is deliberately not
attempted.

| Attack | What stops it | Running |
|---|---|---|
| Old or borrowed photo | camera only, and the time is taken on our side rather than read off the file | yes |
| Somebody else's tree | 120m radius from the spot fixed at registration | yes |
| Photo without doing the task | per-task check: soil at least 5% darker than that plant's own dry baseline for watering, and its own check for feeding, check-ins and pests | yes |
| Pointing the camera at something else entirely | the shot has to be framed like that plant's first photograph, measured above the soil line | yes |
| A different plant, a metre away, photographed from the same spot | ORB keypoints matched against the baseline and filtered through RANSAC: the same plant returns hundreds of agreeing points, a different one returns about four | yes |
| One tree registered twice | one plant per coordinate cluster | not built |

That fifth row used to read "nothing here catches this". The check that was
standing in for it compared an 8 by 8 grid of cell brightnesses, which says the
camera is pointed at the same sort of scene and nothing more, and a different
neem tree passed it. Rather than let a framing check keep the name of an
identity check, it was replaced with keypoint matching, which answers the
question properly. The old comparison is still there as the fallback for a
browser that cannot load OpenCV, under its own honest label.

The one case still open is a close-up pest photograph, which has nothing in it
to match against a picture of a whole plant. What holds those to a plant is the
location and the history around them.

Faking it ends up being more work than doing it, which is the test a system
like this has to pass.

### "Who pays for the rewards?"

CSR, government and NGO programmes, primarily. They already spend on planting
drives and currently get no survival data at all. Rooted produces that record,
and the same contract funds the rewards. Partners fund their own offers as
acquisition spend, and a daily-open app carries advertising. See
[`rewards.md`](rewards.md).

### "A plant can die for reasons outside the user's control."

Loss is reported with a photo. Points earned stay earned, the streak carries to
the next plant, and replanting earns a bonus. The system compounds on what
somebody has built rather than resetting it, which makes planting again the
obvious next move for the person most likely to do it.

### "Will somebody who planted at a one-off event keep using it?"

Both audiences are first class. Event planting brings people in, household
plants are what they open the app for on an ordinary Tuesday, and the same care
loop serves both. Neither is a special case in the product.

### "How does a reminder reach somebody who already forgets?"

Reminders go out on every channel the user has given us: push, email and
WhatsApp, together. This is ordinary, food delivery apps do it every day, and
reaching people is a solved problem. Inside the app the Today list is the
surface: one screen, what is due now, nothing competing with it.

For now the Today list is the main surface. The scheduling data model
is channel agnostic, so adding a channel is a sender and not a rewrite.

### "Care advice that is wrong will kill plants."

Advice is conservative and observable. Ranges rather than exact numbers, and
instructions a person can check against what is in front of them, for example
water when the soil is dry two inches down, rather than a fixed volume on a
fixed day. The schedule adjusts to the plant's real local weather, so recent
rain pushes watering out and a heat spell pulls it in.

Species profiles are hand-authored and curated, and described that way.

### "These are photographs of where people live."

Photos are private by default. Locations on anything public are coarsened, so a
plant appears in an area rather than at an address.

### "What is actually new here?"

Care reminders exist. Points for good behaviour exist. What does not exist is
**payment against verified proof that the care happened**, and the survival
record that falls out of it. The reward is the hook, the verification is the
product, and the data is the asset. That gets said out loud in the video,
because nobody will assume it.

### "Does the verification cost scale?"

It costs nothing, because it does not run on a server.

Every check runs in the browser on the person's own phone, on a 256 pixel copy
of the photograph, using arithmetic on pixel regions. No model is called and no
photograph is uploaded. A million users doing a task a day is a million phones
doing a few milliseconds of work each, and our bill does not move.

That is also why the photographs never leave the device, which is the better
answer to the privacy question two sections up.

Where a model would earn its cost later is the milestone record, the thing an
organisation actually buys: not "was this watered" but "what did this drive
produce after two years". That runs once per plant per milestone, not once per
task.

---

## Demo-specific

**Scope.** One closed loop, finished, beats six half features. Completion is a
scored criterion. The cut is in `project.md` and it is not reopened.

**Demo fragility.** Every external call in the loop is non-blocking with a
seeded fallback. The demo account starts with plants already due, and there is
a control to move time forward, because a schedule cannot be demonstrated by
waiting for it.

**Originality.** The line above about verified proof has to be spoken in the
video rather than left for the viewer to infer.

**Video bounds.** Three minutes floor, five minutes ceiling. Target 4:30.
