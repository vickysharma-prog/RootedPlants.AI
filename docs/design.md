# Design

## The one rule

There is no line where the website stops and the app starts. Same forest
behind every screen, same column width, same serif for headings and same mono
for numbers. Signing in should feel like walking further into the same
building. An app that becomes a grey dashboard the moment somebody has an
account is an app that was designed twice by two people who never met.

What changes inside is the job, not the furniture. The column tightens from
660px to 620px because you are working rather than reading, and a bar appears
along the bottom with four places to be. That is all.

## The tokens

Set in `web/app/globals.css`, used everywhere, never re-declared.

| What | Token | Used for |
|---|---|---|
| Page | `--bg` `#0a0f0b` | Behind the forest |
| Ink | `--cream` `#ede9de` | Headings, the thing you are reading |
| Body | `--body` `#c2c8bb` | Sentences |
| Quiet | `--faint` `#838b7e` | Labels, dates, the reason under a line |
| Earned | `--gold` `#b08c4a` | Points, always |
| Alive | `--moss` `#9ec9ad` | Passed, on schedule, the active tab |
| Late | `--overdue` `#cf9a56` | Overdue, failed check |

Type: Instrument Serif for display, Instrument Sans for prose, JetBrains Mono
for every number and label. A number is never set in the body face, so the
count of days and the count of points read as measurements.

## The screens

| Screen | Route | What it is for |
|---|---|---|
| Landing | `/` | The argument, once |
| Sign up | `/join` | Name, email, mobile. Eight seconds |
| Today | `/today` | What is due, in the order it is due |
| Task brief | `/do/[task]` | What to do and what the photo has to show |
| Camera | same | The viewfinder, the guide, one shutter |
| Verification | same | What was checked, what it measured, what it earned |
| Plants | `/plants` | Everything in your care, by sight |
| Plant | `/plants/[id]` | One plant's whole record |
| Add a plant | `/plants/new` | Photograph, species, spot |
| Rewards | `/rewards` | Balance, catalogue, redemption |
| You | `/me` | Account, and where reminders reach you |

## How somebody moves through it

### The first five minutes

Landing, and the argument is made once: we reward people for spending money,
so why not for keeping something alive. Sign up asks for three things and
explains why it wants the mobile number, because that is the channel the
reminders go out on and a care app that waits to be opened is a list.

Straight into Today. It is never empty: the account arrives with three plants
that have photo histories and a live weather-moved schedule, so the first
screen is a working account rather than an invitation to set one up.

### Doing a task

Tap a row. The brief says the plant, the job, the points, and exactly what the
photograph has to show. For feeding and pests it also says what to feed it
with or what to look for, and it says to use the least that works, because
fertiliser the roots do not take ends up in the groundwater and a spray kills
the ladybirds that were handling the aphids for you.

Open the camera. The plant's first photograph sits over the live frame at low
opacity so lining the shot up is something done by eye. The app reads the frame
a few times a second and says the one thing that would make this shot pass:
tilt down so the soil is in frame, hold still, too dark, that is it. Out loud,
because whoever is holding the phone is holding a watering can too. The ring
around the shutter turns green when there is nothing left to fix, so the same
answer is there with the sound off.

One shutter. Then the checks arrive one at a time at reading speed, each with
the number it measured. Passed: the points count up and the streak is named.
Failed: which check, in plain words, the task stays open, the streak is held,
and the button says take it again.

### Registering a plant

Three steps, in this order because the photograph is the only one that has to
happen in front of the plant. Photograph, then species from a grid of twelve,
then a name, where it stands, and the spot taken off the device rather than
typed. A registered spot somebody chose by hand proves nothing later.

### Losing one

On the plant's page, under a rule, quietly. Plants die for reasons that have
nothing to do with the person caring for them, so the points stay, the streak
carries, and the reasons offered include "I do not know".

## The health tracker

A bar and one sentence, on the plant card and on its page. It is care, not
diagnosis: how the watering has gone against the schedule this species wants,
and how long the run is. Four bands, each in its own colour: Thriving, Steady,
Watch it, At risk.

It deliberately does not read the leaves and tell you the plant is sick. A
photograph shows a yellow leaf for a dozen reasons, and a number invented from
one is a number that gets trusted and should not be. The sentence under the bar
always names what moved it, so nobody is left looking at a score with no idea
what would change it.

## Motion

Everything is short and once. Rows rise in on load, checks tick in one after
another, points count up over 900ms, the hairline under a step fills from the
left on hover. Nothing loops except the forest.

Every one of these is off under `prefers-reduced-motion`, including the points
counter, which lands on its number immediately instead.
