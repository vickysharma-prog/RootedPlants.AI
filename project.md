# NextStep Hacks 2026 - Project Brief

The single source of truth for what we are building and the rules it has to
satisfy. Everything in the "Hackathon facts" section is copied from the
official Devpost pages on 2026-09-16. Everything in "The project" is filled in
by me.

---

## 1. Hackathon facts

| Item | Value |
|---|---|
| Event | NextStep Hacks 2026 |
| Tagline | "Breaking barriers, one idea at a time." |
| Host | HackAlphaX |
| Devpost | https://nextstep2026.devpost.com/ |
| Theme / track | **Earth Forward** (environmental) |
| Format | Online, public |
| Registered participants | 861 (as of 2026-09-16) |
| **Submission deadline** | **Sep 20, 2026 @ 5:00pm EDT** (= Sep 21, 2:30am IST) |
| Hackathon period | Aug 21 - Sep 20, 2026 |

### Theme: Earth Forward

Technology solutions to environmental problems. The Devpost page names these
areas explicitly:

- climate change
- pollution
- biodiversity loss
- resource depletion
- renewable energy
- conservation
- sustainable agriculture
- waste reduction

Adherence to this theme is one of the six scored criteria. The connection
between the product and an environmental outcome has to be obvious to a judge
in the first thirty seconds of the video, not implied.

### Eligibility

- Age 13 to 24 as of Aug 21, 2026.
- Students.
- Professional organisations and companies are excluded. Entry is as an
  individual, not on behalf of a company.
- Teams up to five people. Solo is allowed.
- Open to all countries (standard Devpost exceptions).

### Build window rule

Two lines from the official pages, both of which shape how this repo is run:

1. "Any software or hardware product built within the specified time frame."
   Projects created before the competition period, or containing plagiarised
   content, face disqualification.
2. Continuing previous work is allowed but requires clear documentation of
   what existed before the hackathon and what was built during it.

**What this means in practice:** every commit in this repo is dated inside the
Aug 21 - Sep 20 window, the history is public, and any code carried in from
elsewhere is listed in `state.md` under "Prior art carried in" with a note on
what it is and where it came from. The git log is the evidence.

### What has to be submitted

- [ ] Demo video, **3 to 5 minutes** (hard bounds, both ends)
- [ ] Link to the repository or code, viewable
- [ ] Link to the live site or app, if there is one
- [ ] Completed Devpost project page

### Judging criteria

Six criteria, no published weights. Assume they are equal.

| # | Criterion | What it is | How we serve it |
|---|---|---|---|
| 1 | **Originality** | creativity and novelty | TBD |
| 2 | **Adherence to Track** | implementation of Earth Forward | TBD |
| 3 | **Completion** | does it work, did it hit its goal | TBD |
| 4 | **Learning** | skill development, technical stretch | TBD |
| 5 | **Design** | user experience and interface | TBD |
| 6 | **Technology** | technical complexity and innovation | TBD |

Two of these are the ones a solo technical builder usually leaves on the table:

- **Learning** is not scored by the code, it is scored by what I say about it.
  It needs a written account of what was new to me and what broke. `progress.md`
  is that account, and the video needs one honest line of it.
- **Design** is a whole criterion on its own. A working backend behind a raw
  HTML page loses a sixth of the score.

### Prizes

| Place | Prize |
|---|---|
| 1st | $1,000 cash + $500 Claude credits + YC interview + AOPS coupons + XYZ domains + 1yr software subs |
| 2nd | $500 + $250 Claude credits + coupons |
| 3rd | $250 + $100 Claude credits + coupons |
| Participation | 700 winners get Wolfram Alpha access or an XYZ domain |

Total pool $1,750+ cash plus sponsor prizes. Sponsors: Claude, Wolfram, Saily,
Incogni, XYZ, Kinetik, AOPS, NordPass, NordVPN.

### Other rules worth knowing

- Submitting the same project to other hackathons in the same month is
  permitted.
- Organisers keep full discretion over winner selection.
- Organisers may use submitted project information in promotional material and
  may feature winners on their site.

---

## 2. The project

**Rooted** (working name, cheap to change).

### One-line pitch

We reward people for spending money. Rooted rewards them for keeping a tree
alive.

### The problem

Every occasion, everywhere, people plant trees. A birthday, a school drive, a
company CSR day, a festival. They plant it, they take the photo, they post it,
and that is where it ends. Nobody finds out what happened to that tree. The
planting is an event. The keeping alive is a year of small, boring,
easy-to-forget jobs, and nothing is attached to doing them.

People act on rewards. That is how loyalty programmes, credit card points and
streaks all work, and we have pointed all of it at spending. Rooted points it
at the thing our lives actually depend on.

### The insight the whole product rests on

A planted tree is not an achievement, it is a two-year commitment nobody is
holding you to. Rooted holds you to it, and pays you for it.

### Who it is for

- Anyone who plants a tree at an event and means it.
- Households with plants at home who do not want to think about care schedules.
- Schools, offices and drives who want to show what survived, not what was
  planted.

### How it works

1. **Register the plant.** Photo, species from our list, location.
2. **Get a care schedule.** Every species gets a watering interval and a
   fertiliser cadence from a curated care profile. The schedule then adjusts to
   the plant's actual local weather: rain in the last two days pushes watering
   out, a heat spell pulls it in. A static timer would not do that.
3. **Today list.** The app tells you what your plants need today, in one list.
4. **Do it, prove it.** Mark the task done with a photo. The photo gets a
   quick automated look to confirm it is a plant and flag obvious distress.
5. **Earn.** Completed care tasks earn points. Consistency earns more than a
   single burst.
6. **Redeem.** Points convert to rewards from a partner catalogue.

### Scope for the deadline

Four days, solo. "Completion" is a scored criterion, so one loop that runs all
the way through beats six features that each stop halfway.

**In scope, has to work on camera:**

- Register a plant: photo upload, species picker, location
- Care schedule generated from the species profile and adjusted by local
  weather
- Today list, the main screen, showing what is due
- Mark a task done with a proof photo
- Automated check on the proof photo, non-blocking
- Points ledger, with the balance and the history of how it was earned
- Rewards catalogue and redemption, seeded with demo partners
- Seeded demo account with plants already due, so the first screen is full
- A "jump forward 3 days" control, so the schedule can be shown moving in a
  5 minute video

**Out of scope, decided and not revisited:**

- Push notifications. The reminder is the Today list. Push is a delivery
  channel, and building service workers and VAPID keys for something that may
  not even fire on an iPhone during the demo is four days spent badly.
- Social feed, friends, leaderboards
- Teams, schools and org accounts
- Real partner integrations. The catalogue is seeded with demo partners, which
  is what a catalogue looks like before partners sign.
- Native app builds

### App or website

**Website, built as a PWA.** It needs a camera, it needs to work on a phone,
and it needs a link a judge can open in one tap. Installing to the home screen
gives it an icon and a full screen without an app store standing in the way.
A native build would spend a day of four on distribution instead of product.

### Stack

- Next.js, one codebase for pages and API routes, deploys to Vercel in minutes
- Postgres for plants, tasks, the points ledger and redemptions
- Photo upload to object storage, the photo is evidence and has to persist
- open-meteo for weather, free and needs no key, which matters when the demo
  runs on somebody else's machine
- Care profiles: 10 to 15 species, hand-authored, watering interval and
  fertiliser cadence. Curated, and honest about being curated.

### How this scores

| Criterion | Where it comes from |
|---|---|
| Originality | Rewards pointed at keeping things alive rather than at spending. The hook is a question a judge can repeat. |
| Adherence to Track | A tree that survives is the entire product. Nothing has to be explained to connect it to Earth Forward. |
| Completion | One loop, closed, demoed end to end on a seeded account. |
| Learning | Weather-adjusted scheduling and automated photo checks were both new. `progress.md` carries what broke. |
| Design | Phone first. The Today list is the whole app: one screen, what is due, done. |
| Technology | Scheduling that responds to real local weather, plus an automated look at each proof photo. |

### Demo script

1. **0:00** "Why do we only reward people for spending money?" Then the
   problem: everybody plants, nobody follows up.
2. **0:30** Register a plant on a phone. Photo, species, done.
3. **1:00** The schedule appears. Show that it moved because it rained there.
4. **1:45** The Today list. Complete a task with a proof photo, points land.
5. **2:45** Jump forward three days, the list refills. This is the loop.
6. **3:15** Redeem points from the catalogue.
7. **3:45** How it is built, and the part that was hard.
8. **4:30** What is next.

Target 4:30. The floor is 3:00 and the ceiling is 5:00, both are hard bounds.
