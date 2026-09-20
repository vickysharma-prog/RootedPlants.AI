# Devpost project page

Paste-ready copy for https://nextstep2026.devpost.com/. Headings match the
fields Devpost gives you. Every figure here is in `docs/evidence.md` with its
source.

---

## Name

RootedPlants.AI

## Tagline (200 characters)

Plant it. Keep it. Get paid for it. RootedPlants.AI turns a planted tree into a
year of verified care, and pays the person who does it.

---

## The problem, in numbers

India's national auditor spent ten years looking at the Green India Mission
across 15 states, and published the count in 2026. About 5% of a 2.8 million
hectare planting target was achieved. At roughly 70% of the sites assessed,
tree cover had not improved at all. Of 559 sites physically verified, 95 came
in between 0 and 40% survival. Surviving plants averaged 22.42 cm against a
prescribed minimum of 75 cm. At one site in Uttarakhand, 2,000 plantings were
reported, 30 to 40 saplings were found, and none had lived.

One line explains the rest. **431 of 556 plantation journals did not record the
species planted, the coordinates, or the survival percentage.** Four out of
five. Nobody was ever asked to keep that record, so nobody kept it.

The money is not the missing piece either. Indian companies spent ₹40,794 crore
on CSR in FY 2024-25, a record, and ₹3,397 crore of it on environmental work,
up 40% in one year. Above a ₹10 crore obligation the Companies Act already
requires an independent assessment of what that money achieved. The spending
exists. The law already asks for proof. The proof is what nobody can produce.

And it is not only forests. A tulsi on a balcony, a money plant in a living
room and a lemon tree by a kitchen window run on the same year of small boring
jobs, and nothing is attached to doing any of them. We pay people to pay a
credit card bill on time. We pay nobody to keep a plant alive.

## What it does (nine steps, one loop, all on a phone)

**Register:** one photograph, and the species comes back from the photograph
rather than a dropdown, searched by the names people use, so "mogra" finds
jasmine and "kadi patta" finds curry leaf. The spot is read off the device,
never typed. That first photograph becomes the baseline every later one is
measured against, for as long as the plant lives.

**Refuse:** point it at a notebook and it says so, out loud, before anything is
registered. A plain object scores 0.2% as a plant, a wall 0.5%, the weakest
real plant photograph 9%. The bar is 3%.

**Schedule:** each species carries its own watering interval, what to feed it
with and what goes wrong with it, and open-meteo then moves every task by the
weather at that plant's own coordinates. Rain pushes the next watering out. A
heat spell pulls it in. A pest check comes round sooner after warm wet days,
because that is when pests arrive. The line under the task says what moved it.

**Remind:** when a task comes due the same message goes out on WhatsApp, on
email and as a text, and the plant asks in its own words. "💧 Neem is thirsty.
Vicky, your neem is asking for water. It has been waiting 1 day." A name, a
plant and a date reach the server to send it. No photographs. No coordinates.

**Shoot:** the camera says the one thing that would make the shot pass, out
loud, because whoever holds the phone is also holding a watering can. It reads
the live frame twice a second on the device. Tilt down so the soil is in
frame. Hold still for a second. That is it, take it. The ring round the
shutter turns green when there is nothing left to fix.

**Check:** five checks, and every one reports the number it measured instead of
a verdict. It came off the camera, not a file picker. The time is taken on our
side, not read off the file. The location is within 120 m of where the plant
was registered. The soil is at least 5% darker than that plant's own dry
baseline: a watered pot measured 28.4%, the same frame against itself 0.0%.

**Prove it is that plant:** ORB keypoints and a RANSAC homography against the
plant's own first photograph, run in the browser on a 256 px copy with nothing
uploaded. The same plant returned 485 agreeing points. A different neem in a
similar pot returned 4.

**Score:** every plant carries a health band and one sentence saying what moved
it, computed from how the schedule has actually gone. It never reads the
leaves and calls the plant sick, because a yellow leaf has a dozen causes.

**Earn and redeem:** points land on the task, not on the planting, and they
redeem. Because every point traces back to one verified task, what accumulates
is not a score. It is the record of what survived.

## Technological implementation

Next.js 16 on the App Router, React 19 and Tailwind v4, on Vercel. Every
threshold below was set by measuring, not by taste, and each one is printed on
screen next to the number it produced.

**The identity check runs in the browser.** OpenCV 5 compiled to WebAssembly,
served as a plain script rather than bundled, because the bundler detects a
Node environment inside it and fails on `fs`, and serving it keeps 24 MB out of
the app bundle. It extracts 1,200 ORB keypoints at a scale factor of 1.2 over 8
levels from a 256 px copy of the new photograph and of the plant's own first
photograph, matches them with Lowe's ratio test, and asks RANSAC whether the
survivors agree on one homography. Twenty-five agreeing points is the bar. The
same plant returned 485 in the live app. A different neem tree in a similar pot
returned 4. Nothing is uploaded to do any of it.

**Species and "is this even a plant" are one call.** A server route posts the
photograph to PlantNet's `/v2/identify/all` with `organs=auto`, so the key
never reaches a browser, and the best score doubles as the plant test.
Calibrated against real inputs: a plain object scores 0.2%, a wall 0.5%, noise
returns a 404, and the weakest genuine plant photograph in the set scored 9%.
The bar sits at 3%.

**The watering check measures the soil.** It samples the band from 62% to 98%
of the frame height against the same band in the plant's dry baseline and
requires it to be at least 5% darker. A watered pot measured 28.4%. The same
frame compared with itself measured 0.0%.

**The framing check deliberately ignores the soil,** and only reads the top 62%
of the frame, because the one thing that proves the watering is the one thing
that would otherwise make the composition score drop.

**Location is checked at 120 m,** read off the device rather than typed, and
compared with where that plant was registered.

**Everything that can stay on the phone stays on the phone.** Plants,
photographs at 1280 px, thumbnails at 256 px, baselines, points and history
live in IndexedDB. What reaches a server for a reminder is a name, a plant and
a date. No photographs. No coordinates. No points.

**Reminders go out on every channel that is configured.** One message composed
once, sent through Resend for email and Twilio for WhatsApp and text, fired by
a Vercel cron once a day. Upstash Redis holds the clock. A missing key costs
you that one channel and never the whole reminder, and the account screen says
plainly which channels this deployment can reach.

**The care data is 78 species** carrying the names people actually use, so
"mogra" finds jasmine and "kadi patta" finds curry leaf, each with its own
watering interval, what to feed it with, and what goes wrong with it. Five
fallback profiles cover anything not on the list, because naming a plant and
knowing how to keep it alive are different jobs. open-meteo then moves each
task by the weather at that plant's own coordinates, and the line under the
task says what moved it.

**It installs.** The manifest and icons make it an app on the home screen from
the browser, on Android and on iPhone, with nothing to download from a store.

## Why the points are worth something

If any plant could earn points, the points would be worth nothing, and the
record they add up to would be worth less. So the product is built around one
question it has to answer honestly: is this the same plant, photographed now,
here, by the person claiming it.

Every check states the number it measured rather than a verdict, and the app
shows that number to the person being checked. The health score is computed
from schedule adherence alone. It never reads the leaves and calls the plant
sick, because a yellow leaf has a dozen causes and a number invented from one
is a number that gets trusted. The rewards catalogue holds stand-ins rather
than real offers, because naming a company in a demo puts words in their mouth.

## What I measured before shipping it

Three features are in their second version, because I put a number on the
first one and the number sent me back.

I built an on-device colour and texture classifier for species. Against 17 real
photographs it got 0 right, where guessing at random scores 8%. It went, and
PlantNet came in.

I decided whether a photograph contained a plant by how green it was. Real
plants turned out to run from 0% to 97% green, so the measure said nothing.

The watering check compared the new photograph's composition against the
baseline, and it included the soil. Water the plant properly, the soil darkens,
the composition score drops, and the check fails **because** the watering
worked. It now measures only above the soil line.

I also laid out contact sheets of every photograph I fetched and looked at all
of them, which is how I caught a picture of Bitcoin in a plant pot filed under
"money plant", a haworthia sold as an aloe, and an Aglaonema I had labelled
tulsi myself. PlantNet read that last one back to me.

## What I learned

Putting a number on a feature before shipping it changes what ships. Each of
the three above felt fine until it was measured. The on-device classifier in
particular was the weakest thing in the app wearing the name of the strongest.

A check can also fail in the direction of the user's success, which is the
hardest kind to notice. The framing check punished people at the exact moment
they had done the job properly.

## Impact

**It moves the unit of account.** Everything built around planting counts
saplings put in the ground, which is why 431 of 556 plantation journals could
be filled in without anyone knowing whether a single tree lived. Rooted counts
something else: one verified act of care, by one named person, at one set of
coordinates, on one day. Add those up and you have survival, measured
continuously, by the only person who was there every time.

**It puts the household in the same system as the forest.** A planting drive
is one afternoon a year. A balcony is 365 days of it. The tulsi, the money
plant, the lemon by the kitchen window and the sapling from last month's drive
all run on the same year of small boring jobs, so they run on the same app and
the same schedule. That is the part nobody is serving, and it is the larger
number: the plants already in people's homes, already being kept alive for
free, by people nobody has ever paid or counted.

**It turns a cost into an instrument.** ₹3,397 crore went into environmental
CSR in one year, up 40%, and above a ₹10 crore obligation the Companies Act
already requires an independent assessment of what the money achieved. Today a
company buys a planting and receives a photograph from day one. With this it
buys a year of proof: what was planted, where it stands, and whether it lived,
each line traceable to a photograph that passed five checks. The spending does
not change. What comes back does.

**It pays the right person.** Loyalty points, credit card rewards and streaks
have trained a whole economy to pay people for spending. This points the same
machinery at keeping something alive, and it pays the person holding the
watering can rather than the organisation holding the press release.

**And it is honest about what it knows.** Every number on screen is a number
the app measured. The identity check separates the same plant from a different
one of the same species by 485 to 4. Nothing here reports a figure it did not
measure, which is the only reason the record it produces is worth anything at
all.

## Try it

- Live app: https://rootedplants.vercel.app
- Demo video: https://youtu.be/h2Nqt7q6UvM
- Code: https://github.com/vickysharma-prog/RootedPlants.AI
- Release, with the film attached:
  https://github.com/vickysharma-prog/RootedPlants.AI/releases/tag/v1.0

The demo link opens a seeded account, so every screen works without signing up.

---

## Video description, with chapters

Live at https://youtu.be/h2Nqt7q6UvM. The timestamps are read off the finished cut,
`video/rooted-demo.mp4`, 4:54.

RootedPlants.AI. Plant it. Keep it. Get paid for it.

Everybody plants a tree. Nobody finds out what happened to it. India's national
auditor spent ten years counting: about 5% of a 2.8 million hectare target
achieved, no improvement in tree cover at roughly 70% of the sites assessed,
and 431 of 556 plantation journals that never recorded what was planted, where
it stood, or whether it lived.

RootedPlants.AI pays people for the year after the planting. Register a plant,
get a schedule that moves with the weather over it, prove each job with a
photograph, and earn points that redeem. Every check reports the number it
measured, on screen, including the one that decides whether it is the same
plant: 485 agreeing keypoints against its own first photograph, 4 against a
different neem in a similar pot.

Built solo for NextStep Hacks 2026, Earth Forward track. Nothing in the film
reports a number it did not measure.

Live: https://rootedplants.vercel.app
Code: https://github.com/vickysharma-prog/RootedPlants.AI

0:00 Everybody plants a tree
0:17 What the auditor found
0:51 We pay people for everything except this
1:02 The balcony and the drive, same app
1:25 Four jobs, moved by your weather
2:07 The camera talks you through the shot
2:29 Every check says the number it measured
2:44 Is it the same plant: 485 against 4
3:05 Registering, and what it refuses
3:24 The reminder arriving on a real phone
3:40 The record, and who is already paying for it
4:28 Where the points should have been pointing

## Built with (Devpost tags)

next.js, react, typescript, tailwind, opencv, webassembly, indexeddb,
plantnet-api, open-meteo, resend, twilio, upstash-redis, vercel, vercel-cron,
web-speech-api, pwa, ffmpeg, python
