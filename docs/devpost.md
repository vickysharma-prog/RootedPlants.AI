# Devpost project page

Paste-ready copy for https://nextstep2026.devpost.com/. Section headings match
the fields Devpost gives you. Every number here is in `docs/evidence.md` with
its source.

---

## Tagline (one line, 200 characters)

Plant it. Keep it. Get paid for it. Rooted turns a planted tree into a year of
verified care, and pays you for the year.

---

## Inspiration

Everybody plants a tree. Nobody finds out what happened to it.

A birthday, a school drive, a company afternoon. You plant it, you take the
photo, you post it, and that is where it ends. The planting takes an hour. The
keeping alive takes a year of small boring jobs, and nothing is attached to
doing any of them.

I went looking for how much of it survives. India's national auditor did the
counting. Against a 2.8 million hectare target, about 5% was achieved. At 70%
of the sites audited there was no improvement in tree cover at all. One site
reported 2,000 plantings: 30 were found, and none had survived.

Then the line that explains the rest of it. Four out of five plantation records
did not say what was planted, where it stood, or whether it lived. Nobody was
ever asked to keep one.

We already pay people for boring things. Pay a credit card bill on time and you
earn points. Water the tree you planted last year and nothing happens at all. I
wanted to move the points.

## What it does

Register a plant once: a photograph, a species, and the spot taken off the
device rather than typed. That photograph becomes the baseline every later one
is measured against.

The schedule then follows your weather. Each species carries a care profile,
and open-meteo moves each watering by what the weather actually did at that
plant's coordinates. Rain pushes it out. A heat spell pulls it in. A pest check
comes round sooner after warm wet days, because that is when pests turn up.

When a task is due, Rooted comes to you. The same message goes out on WhatsApp,
on email and as a text, and the plant asks in its own words: "Neem is thirsty.
Vicky, your neem is asking for water." A plant cannot wait for you to remember
it.

You do the job and photograph it. The camera talks you through the shot out
loud, because whoever is holding the phone is also holding a watering can, and
the ring around the shutter turns green when there is nothing left to fix.

Then the photograph is checked, and every check reports the number it measured:

- It came off the camera, not a file picker.
- The time is taken on our side, not read off the file.
- The location is within 120m of where the plant was registered.
- It is the same plant. OpenCV matches keypoints against the plant's own first
  photograph and asks RANSAC whether they agree on one viewpoint. Same plant:
  485 agreeing points, measured live. A different neem tree in a similar pot:
  4.
- The soil is at least 5% darker than that plant's own dry baseline. Watered
  soil measured 28.4% darker. The same frame against itself measured 0.0%.

Points land, and they redeem. Because every point traces back to one verified
task, what comes out the other end is the record of what survived, which is the
thing nobody currently produces.

## Who pays for this

Indian companies spent ₹40,794 crore on CSR in FY 2024-25, a record, and
₹3,397 crore of it on environmental work, up 40% in a single year. Above a ₹10
crore obligation the Companies Act already requires an independent assessment
of what the money achieved. The money is there and the law already asks for the
proof. The proof is the part nobody can produce.

## How I built it

Next.js 16 on the App Router with React 19 and Tailwind v4, deployed on Vercel.

Everything that could stay on the phone stayed on the phone. Plants, photos,
baselines, points and history live in IndexedDB, and the identity check runs in
the browser on a 256px copy. What goes to the server for a reminder is a name,
a plant and a date. No photographs and no coordinates.

- **Identity:** OpenCV 5 compiled to WebAssembly, served as a plain script
  rather than bundled, so the 24MB never enters the app bundle. ORB keypoints,
  Lowe's ratio test, then RANSAC for the homography.
- **Species:** the PlantNet API, behind a server route so the key never reaches
  a browser. The same call answers "is this even a plant", and the threshold
  sits at 3%.
- **Weather:** open-meteo, per plant, per day, with the shift shown in the line
  under each task.
- **Reminders:** Resend for email, Twilio for WhatsApp and text, one message
  composed once and sent on every configured channel, fired by a Vercel cron.
- **Care data:** 78 species with local names, feeding and pest profiles,
  generated into a typed table so nothing is looked up at runtime.

## Challenges I ran into

**Guessing the species on the device.** I built colour and texture features and
a nearest-neighbour classifier over them, ran it against 17 real photographs,
and it got 0 right. Random guessing would have scored 8%. It went in the bin
and PlantNet went in.

**Deciding whether a photograph contains a plant at all.** My first answer was
how green the frame is. Real plants turned out to span 0% to 97% green, so the
measure said nothing. PlantNet's own confidence separated cleanly instead:
noise 404s, a wall 0.5%, an object 0.2%, and the weakest real plant 9%.

**Framing that punished the thing it was measuring.** The watering check
compared the new photo's composition against the baseline, and it included the
soil. Water the plant properly, the soil darkens, the framing score drops, and
the check fails because the watering worked. It now measures only above the
soil line.

**A demo seeded in one city.** The six demo plants were pinned to Jaipur, so
anybody opening the demo from anywhere else was 234km away and every check
failed. They seed at the device's own location now.

**Audio that drifted three seconds.** Joining 56 spoken MP3 lines by copy added
encoder padding at every seam, so the voice fell further behind the picture the
longer the film ran. Writing WAV instead brought it to 0ms.

**Vetting every photograph by hand.** I laid out contact sheets of everything I
fetched and looked at all of it, which is how I caught a picture of Bitcoin in
a plant pot filed under "money plant", a haworthia sold as an aloe, and an
Aglaonema I had labelled tulsi myself. PlantNet read that last one back to me.

## Accomplishments I am proud of

Every number the app shows is a number it measured. Nothing in the demo, the
video or this page reports a figure that was estimated to make a point.

The identity check is the one that matters, because if any plant could earn
points the points would be worth nothing. 485 against 4 is not a close call.

And it is one world from the landing page through to the app. Signing in does
not drop you into a different product.

## What I learned

That measuring a thing before shipping it changes what ships. Three features in
this build were replaced by better ones only because I put a number on the
first version and the number was bad. The on-device classifier scored 0 out of
17 against 8% for guessing, and knowing that was worth more than keeping it.

Also that a check can be wrong in the direction of the user's success, which is
the hardest kind to notice. The framing check failed people precisely when they
had watered properly.

## What's next

Organisations get the survival record they are already required to assess, and
the rewards catalogue fills with real offers rather than the stand-ins in the
demo, which are stand-ins because naming a company in a demo would put words in
their mouth.

## Built with

next.js · react · typescript · tailwind · opencv · webassembly · indexeddb ·
plantnet · open-meteo · resend · twilio · vercel · web-speech-api · pwa

## Try it out

- Live: https://rootedplants.vercel.app
- Code: https://github.com/vickysharma-prog/nextstep-2026

The demo link opens a seeded account, so everything works without signing up.
Rooted installs to any phone's home screen straight from the browser, on
Android and iPhone, with no app store.
