# Design

Design is a scored criterion on its own, and it is also the part of this
product that decides whether anybody comes back. A care app that feels like
homework loses to forgetting. This file is the spec: what the screens are, what
each is for, and what the whole thing looks like.

## The one rule

**The app has one job per visit: show what is due, let them do it, pay them.**

Everything else is a room you can walk into, not something that greets you. If
a screen is not the Today list, it earns its place by being one tap from it.

## Principles

**Phone first, and actually phone first.** This gets opened outdoors, one
handed, in sunlight, often while holding a watering can. Big targets, high
contrast, nothing important in the top corners.

**The home screen is a to-do list, not a dashboard.** Numbers, charts and
totals are a reward for finishing, so they live one level in. Opening the app
to statistics is opening it to nothing to do.

**Reward has to feel immediate.** The gap between finishing a task and seeing
points is where the habit forms or does not. Points animate in on the
verification screen, not in an email an hour later.

**Empty is a state worth designing.** Nothing due today, everything is fine, is
the most common screen a good user sees. It should feel earned, not broken.

## Screens

### 1. Today, the home screen

The first thing on open. A list of task cards for every plant that needs
something now.

Each card carries:

- the plant's own photo, latest one, as the identifier, because people know
  their plants by sight and not by name
- the plant's name and species
- the task, in plain words: Water your neem
- why now, one line: no rain for 4 days, 34 degrees today
- points on offer
- a single primary button, Do it

The why-now line is small and does a lot of work. It is the difference between
an app telling you what to do and an app that has been paying attention. It is
also where the weather adjustment becomes visible instead of staying buried in
the backend.

Overdue cards sort to the top and are marked, not shouted at. Guilt is not a
retention strategy.

**Empty state:** a short line, the next thing coming up and when, and the
current streak. Quiet and satisfying.

### 2. Do it, the capture flow

Tapping Do it goes straight to the camera. No intermediate screen.

Above the viewfinder, the instruction, visible while framing:

> Photograph the plant while you pour. Base of the plant and the wet soil both
> in frame.

A faint outline of the baseline photo sits over the viewfinder as a framing
guide, so getting the same angle is something the user does without being asked
to think about it. This costs nothing and it lifts the scene-match pass rate,
which means fewer retakes and fewer honest users being told no.

One shutter. No filters, no gallery, no editing.

### 3. Verification result

The screen that earns the Technology mark, so it is built as a screen and not
as a toast.

After capture: a short check animation, then a result card listing each check
with a tick and one line of reason.

    Verified

    Location      matches where you planted it
    Time          just now
    Same plant    baseline matched
    Watering      soil is wet, water visible

    +40 points        streak 12 days, x1.4

Points count up. The streak increments visibly.

On pending review the same card shows which check did not line up, in plain
language, with a retake button. "The photo was taken 80m away, try again from
beside the plant." The task stays open and the streak holds.

The card is never a wall of confidence scores. One line per check, readable at
arm's length.

### 4. My plants

Grid of plant cards, each with its latest photo, name, age and streak. This is
the collection, and collections are their own motivation.

### 5. Plant profile

One plant's full story, and the most emotionally loaded screen in the app.

- the photo timeline, first photo to latest, which is growth made visible
- age in days, current streak, points earned from this plant
- care history
- next task
- share, and a public version of this page

The photo timeline is the thing somebody will screenshot and post, which is
where this whole product started. Build it to be posted.

### 6. Rewards

Points balance at the top, then the catalogue. Partner offers, certificates,
and locked items showing what they cost, because a visible locked reward is a
reason to come back.

Redemption is two taps and a confirmation.

### 7. Add a plant

Photo, species picker, where it is. Three steps, one screen each, with a
progress row so it is obviously short.

The species picker is searchable, with photos, and defaults to the common ones.
If the photo suggests a species it is pre-selected and still editable.

Location is taken from the device with one confirmation, because it is the
anchor every later verification is measured against.

### 8. Loss report

Reachable from the plant profile, never pushed. Photo, one tap on a reason,
done. The confirmation says plainly that points stay, the streak carries, and
replanting earns a bonus. This screen exists to reassure, and its tone is the
whole point of it.

## Navigation

Bottom bar, four items, thumb reachable: Today, Plants, Rewards, Me.

Four, not five. Me holds profile, notification channels and settings.

## Visual direction

Dark, warm, editorial. The reference point is a serious editorial page rather
than an app screen: type and space do the work, and there is almost nothing
else on the page.

**One dark world.** Near-black, warm rather than blue-black, with a soft glow
falling from the top of every page. The same background everywhere, so moving
between screens is moving through one place.

**Type carries it.** Instrument Serif for anything that speaks, at a tight
line height with slightly negative tracking. Instrument Sans for body copy at
a line height of about 1.78, which is the single cheapest thing that makes a
page read as considered rather than cramped. JetBrains Mono for numbers,
labels and dates, so figures line up and read as data.

**Three text colours and no more.** Cream for what matters, a warm grey for
body copy, a dimmer grey for anything secondary. Body copy is never pure
white.

**One accent, used sparingly.** A muted gold for numbers and labels, a sage
green for what is alive and what is verified. Amber marks a task that is late,
and marks it quietly, because guilt is not a retention strategy.

**Rows, not cards.** A hairline above, generous air, nothing else. No boxes,
no shadows, no gradients on elements. The one exception is the photograph.

**Photography is the interface.** The user's own plant photographs identify
their plants. On a dark page a bright crop shouts, so photographs are sunk
slightly and edged with a hairline: present, not competing with the type.

**The forest is atmosphere, not a slideshow.** Real photographs, each on a
long slow push, cross-fading into the next, held well back under a heavy veil.
It is a camera move rather than an effect, which is why it reads as a place.
If it ever competes with the words, it is turned down further.

**Motion happens twice,** both times at the reward: the points counting up and
the verification checks landing one after another. Everything else is instant,
which is what makes those two moments feel like moments.

**Two things on one screen never share a gesture.** The mark beside the
wordmark was five bars that rose and fell, sitting a few centimetres from a
sound control that is also five bars that rise and fall. Same gesture, two
meanings, and the eye reads them as the same control. The mark is a seedling
now: the stem draws itself, the leaves unfurl, then the roots go down below
the ground line. The roots are the point. The name is Rooted, and the half of
a plant that decides whether it lives is the half nobody draws.

## What the judge sees

The demo is shot in a phone frame. The order: Today list full of real plant
photos, tap Do it, camera with the framing ghost, shutter, verification card
ticking through its checks, points counting up, streak incrementing. Then the
plant profile timeline, then a redemption.

That sequence is the product. If those six screens are beautiful, the app is
beautiful, and nothing else has to be finished to that standard.
