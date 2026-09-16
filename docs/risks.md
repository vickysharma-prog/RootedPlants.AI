# Risks, and the answers

Written as answers, not as worries. Most of these get asked out loud by
somebody eventually, and the point of this file is that none of them is heard
for the first time in the room.

---

### "What stops people faking the photos for rewards?"

Four layers, and each answers a specific attack. Full detail in
[`verification.md`](verification.md).

| Attack | What stops it |
|---|---|
| Old or borrowed photo | in-app camera only, timestamp taken server side |
| Somebody else's tree | GPS radius fixed at registration |
| A different plant nearby | scene matched against the plant's baseline photo |
| Photo without doing the task | per-task check, soil darkening for watering |
| One tree registered twice | one plant per coordinate cluster |

Faking it ends up being more work than doing it, which is the only test a
system like this has to pass.

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

For the hackathon the Today list is the demo surface. The scheduling data model
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

Cheap checks run on every submission: GPS, server time, scene match, soil
delta. Model calls run where they add something. Milestone verifications carry
the most compute because they are what the record is sold on.

---

## Hackathon-specific

**Scope.** One closed loop, finished, beats six half features. Completion is a
scored criterion. The cut is in `project.md` and it is not reopened.

**Demo fragility.** Every external call in the loop is non-blocking with a
seeded fallback. The demo account starts with plants already due, and there is
a control to move time forward, because a schedule cannot be demonstrated by
waiting for it.

**Originality.** The softest of the six criteria for this idea, which is why
the line above about verified proof has to be spoken in the video rather than
left for the judge to infer.

**Video bounds.** Three minutes floor, five minutes ceiling. Target 4:30.
