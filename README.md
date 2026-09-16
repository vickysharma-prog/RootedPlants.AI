# Rooted

Everybody plants a tree. Nobody finds out what happened to it.

You plant it, you take the photo, you post it. Then a year of small boring
jobs decides whether it lives, and nothing is holding you to them. Rooted
holds you to them, and pays you for it.

Spend money, earn points. Pay the credit card bill on time, earn more. Rooted
pays you for keeping something alive.

Built for [NextStep Hacks 2026](https://nextstep2026.devpost.com/), Earth
Forward track.

---

## How it works

**Register a plant once.** A photo, the species, and the spot. That spot is
what every later check is measured against.

**The schedule follows your weather.** Each species carries a hand-written
care profile, and open-meteo then moves each watering by what the weather
actually did at that plant's coordinates. Rain pushes it out, a heat spell
pulls it in. The line under each task is that shift made visible.

**Prove the job as you do it.** The task says exactly what the photo has to
show before the camera opens. Four things are then checked: the photo came
from inside the app, the time is taken server side, the location matches where
the plant was registered, and the picture registers onto the plant's own first
photograph. On top of those, a check for the specific task.

**Get paid for keeping it.** Points land when the photo clears, streaks
multiply, and losing a plant to something outside your control costs nothing.

Full detail: [`docs/how it is verified`](docs/verification.md) ·
[`the reward economy`](docs/rewards.md) · [`every objection, answered`](docs/risks.md)

## Running it

```bash
cd web
npm install
npm run dev
```

Then open the address it prints. Nothing else is needed: the weather API takes
no key, and the demo account is seeded with plants already due.

`/` is the landing, `/today` is the app, `/join` is sign up.

The Today screen carries a **+3 days** control. A watering due on Saturday
cannot be shown in a five minute video, so the demo moves the day instead of
waiting for it.

## Not built yet, on purpose

This is a hackathon build with a deadline, so the time went where it changes
whether the idea works and whether it matters. These are designed and
deliberately not wired:

**Sign in with Google, and passwords.** Making an account works: give a name,
an email, and a mobile if you want reminders there, and you are through. The
account lives in a cookie on that device, so it survives reloads and restarts
and can be signed out, and there is no password to lose and no store of other
people's credentials to protect.

What that costs is that an account lives on one device. Moving to another
means filling the form again. An identity provider and a user table fix that
and change nothing else about whether the idea works, so they are a later
problem.

**A database.** Nothing persists between restarts yet. The first thing that
genuinely needs one is the points ledger, and that is next.

**Reminders on push, email and WhatsApp.** The scheduling data is already
channel agnostic, so adding a channel is a sender rather than a rewrite. The
Today list is the surface that matters for now.

**The rewards catalogue is seeded with demo partners.** Generic names, no real
brands. That is what a catalogue looks like before partners sign.

## Repository

| | |
|---|---|
| [`project.md`](project.md) | What is being built, and the rules it has to satisfy |
| [`state.md`](state.md) | What is running today, what is decided, what is still open |
| [`progress.md`](progress.md) | Dated log, including what broke and why |
| [`docs/design.md`](docs/design.md) | The look, screen by screen, and the rules behind it |
| [`docs/verification.md`](docs/verification.md) | How a care task is proved |
| [`docs/rewards.md`](docs/rewards.md) | Points, streaks, and where the money comes from |
| [`docs/risks.md`](docs/risks.md) | Every objection, with its answer |
| [`web/`](web) | The app |
| [`tools/`](tools) | Scripts that fetched and vetted the media |

## Media

Every photograph, clip and recording here is CC0, public domain, or under the
Pexels licence, so none of it carries an attribution condition. Provenance is
recorded in `sources.json` beside each set, under `web/public/`.

Search alone was not enough to find them: a query for "misty forest" returned
a foggy city street with Christmas lights. `tools/forest_candidates.py` pulls
twenty candidates and lays them out as one contact sheet, so everything gets
looked at before it ships. Four of twenty were usable.

## Build window

Everything here was written during the hackathon period, Aug 21 to Sep 20,
2026. The commit history is the record. Anything carried in from earlier work
is disclosed in [`state.md`](state.md) under "Prior art carried in", which
currently lists nothing.
