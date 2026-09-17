# Rooted

Everybody plants a tree. Nobody finds out what happened to it.

You plant it, you take the photo, you post it. Then a year of small boring
jobs decides whether it lives, and nothing is holding you to them. Rooted
holds you to them, and pays you for it.

Spend money, earn points. Pay the credit card bill on time, earn more. Rooted
pays you for keeping something alive.

**Live: [rootedplants.vercel.app](https://rootedplants.vercel.app)** ·
**[Demo video](video/rooted-demo.mp4)**

It is for the tulsi on the balcony and the money plant in the living room as
much as for the sapling from last month's drive. Same app, same schedule.

Built for [NextStep Hacks 2026](https://nextstep2026.devpost.com/), Earth
Forward track.

---

## How it works

**Register a plant once.** A photograph, the species, and the spot taken off
the device rather than typed. The photograph is checked before it is accepted:
point it at a notebook and it says there is no plant in it. Point it at a plant
and it works out what that plant is, from **seventy-eight species** searched by
the names people actually use, so "mogra" finds jasmine and "kadi patta" finds
curry leaf. Five profiles cover anything not on the list, because naming a
plant and knowing how to keep it alive are different jobs.

That first photograph becomes the baseline every later one is measured against,
and that spot is what every later check is measured against.

**The schedule follows your weather.** Each species carries a hand-written
care profile, and open-meteo then moves each watering by what the weather
actually did at that plant's coordinates. Rain pushes it out, a heat spell
pulls it in, and a pest check comes round sooner after warm wet days because
that is when pests turn up. The line under each task is that shift made
visible.

**The camera talks you through it.** The task says exactly what the photo has
to show before the camera opens. While it is open the app reads the live frame
a few times a second and says the one thing that would make this shot pass:
tilt down so the soil is in frame, hold still, too dark, that is it. Out loud,
because whoever is holding the phone is also holding a watering can. The ring
around the shutter turns green when there is nothing left to fix.

**Then it is checked.** Every photograph: it came off the camera rather than a
file picker, the time is taken on our side rather than read off the file, and
the location is within 120m of where the plant was registered.

**And it has to be that plant.** OpenCV finds keypoints in the new photograph
and in the plant's first one, matches them, and asks RANSAC whether the
survivors agree on a single viewpoint. The same plant returns several hundred
agreeing points. A different plant of the same species, in a similar pot,
returns about four. Measured live in the app: 485 against its own baseline, 4
against a different neem tree. It runs in the browser, on the phone, on a 256px
copy, and nothing is uploaded to do it.

Then a check for the task itself, and each one reports the number it measured.
Watering has to show soil at least 5% darker than that plant's dry baseline. A
pest photo has to be close and sharp enough that something the size of an aphid
would show.

**It reaches you, rather than waiting to be opened.** The whole premise is that
people forget, so when a task comes due the same message goes out on WhatsApp,
on email and as a text. A name, a plant and a date go to the server for that.
No photographs and no coordinates: those never leave the phone.

**Get paid for keeping it.** Points land when the photo clears, streaks
multiply, and losing a plant to something outside your control costs nothing.

Full detail: [`how it is verified`](docs/verification.md) ·
[`the reward economy`](docs/rewards.md) · [`every objection, answered`](docs/risks.md)

## Running it

```bash
cd web
npm install
npm run dev
```

Then open the address it prints. Nothing else is needed: the weather API takes
no key and there is no environment file to fill in.

| Route | What it is |
|---|---|
| `/` | The landing |
| `/join` | Sign up, or the demo account in one tap |
| `/today` | What is due now, and why now |
| `/do/[task]` | The brief, the camera, and the checks |
| `/plants` | Everything in your care, with its health |
| `/plants/[id]` | One plant's record: photo history, streak, loss report |
| `/plants/new` | Register a plant |
| `/rewards` | Balance, catalogue, redemption |
| `/me` | Account and the reminder channels |
| `/how-it-works`, `/privacy`, `/accessibility` | Written for somebody who wants to read rather than click |

The Today screen carries a **+3 days** control. A watering due on Saturday
cannot be shown in a five minute video, so the demo moves the day instead of
waiting for it.

**Open [the live site](https://rootedplants.vercel.app) on a phone** if you want the camera and the
location checks. Both are browser features that only work on a secure origin, so on
`localhost` over plain HTTP the camera falls back to the file picker and the
verification card says plainly that the photograph did not come from the
camera.

### Where the data lives

Plants, photographs and the points ledger are held in IndexedDB on the device,
behind one module (`web/lib/store.ts`). The photographs never leave the phone,
the app works with no signal, and there is no account to lose. Accounts
themselves are a cookie: a name, an email and the mobile number the reminders
go to.

The first time the app loads it seeds a demo account with six plants, four
months of ledger and a photo history each, standing a few metres from wherever
the device is. So the first screen is a working account rather than an empty
room, and the location check passes on the first task wherever you open it.

## Not built yet, on purpose

This is a hackathon build with a deadline, so the time went where it changes
whether the idea works and whether it matters. These are designed and
deliberately not wired:

**Sign in with Google, and passwords.** Making an account works: give a name,
an email and a mobile number, and you are through. The number is required,
because it is the channel the reminders arrive on rather than a field a form
usually has. The account lives in a cookie on that device, so it survives
reloads and restarts and can be signed out, and there is no password to lose
and no store of other people's credentials to protect.

What that costs is that an account lives on one device. Moving to another
means filling the form again. An identity provider and a user table fix that
and change nothing else about whether the idea works, so they are a later
problem.

**Reminders actually going out.** The channels are on the account screen and
each can be switched on its own, and the scheduling data is channel agnostic,
so adding one is a sender rather than a rewrite. Nothing sends yet.

**A server-side database.** IndexedDB is the right shape for a phone-first app
whose photographs should not leave the device, and it is genuinely what runs.
A server copy is what an organisation would need to see what its drive
produced, and that is the first thing Postgres is for.

**The rewards catalogue is seeded with demo partners.** Generic names, no real
brands. That is what a catalogue looks like before partners sign.

## Repository

| | |
|---|---|
| [`project.md`](project.md) | What is being built, and the rules it has to satisfy |
| [`state.md`](state.md) | What is running today, what is decided, what is still open |
| [`progress.md`](progress.md) | Dated log, including what broke and why |
| [`docs/design.md`](docs/design.md) | The look, screen by screen, and the rules behind it |
| [`docs/video.md`](docs/video.md) | The demo, shot by shot |
| [`video/cards.html`](video/cards.html) | The title cards the video is cut from, in the app's own tokens |
| [`docs/testing.md`](docs/testing.md) | Every feature, and how to check it yourself |
| [`docs/verification.md`](docs/verification.md) | How a care task is proved, and what is deliberately not attempted |
| [`docs/rewards.md`](docs/rewards.md) | Points, streaks, and where the money comes from |
| [`docs/risks.md`](docs/risks.md) | Every objection, with its answer |
| [`web/`](web) | The app |
| [`tools/`](tools) | Scripts that fetched and vetted the media, and that build the species table |
| [`video/`](video) | The demo film, and everything that builds it |
| [`docs/evidence.md`](docs/evidence.md) | Every number the pitch uses, and where it came from |

## Media

Every photograph, clip and recording here is CC0, public domain, or under the
Pexels licence, so none of it carries an attribution condition. Provenance is
recorded in `sources.json` beside each set, under `web/public/`: `video/`,
`forest/`, `plants/`, `baselines/`, `people/` and `audio/`.

Search alone was not enough to find them. A query for "misty forest" returned
a foggy city street with Christmas lights, and one for "money plant" returned
a Bitcoin buried in a pot. `tools/forest_candidates.py` and
`tools/fetch_baselines.py` pull candidates and lay them out as one contact
sheet, so everything gets looked at before it ships. Four of twenty forest
clips were usable.

## Build window

Everything here was written during the hackathon period, Aug 21 to Sep 20,
2026. The commit history is the record. Anything carried in from earlier work
is disclosed in [`state.md`](state.md) under "Prior art carried in", which
currently lists nothing.
