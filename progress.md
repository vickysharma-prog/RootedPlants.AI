# Progress log

One entry per working session. Newest at the top. This is not just a diary:
"Learning" is a scored criterion at NextStep Hacks, and it is scored on what
I can say about what I built and what it cost me. The honest notes here are the
raw material for that. Write down the thing that broke, not only the thing that
worked.

**Format:** date, what got done, what broke, what is next.

---

## 2026-09-17 - Rebuilt the whole look

Spent time in the browser pulling apart a page whose design I wanted to match,
reading its computed styles rather than guessing from a screenshot. What was
worth taking was not its colours, it was its restraint:

- one dark warm world with a glow from the top, no flat black
- a serif carrying every line that speaks, against a clean sans for body copy
- body copy at a line height near 1.8, which does more for how considered a
  page feels than any other single number
- mono, small, in a dimmed accent, for numbers and labels
- rows with hairlines instead of cards, and real air between them
- three text colours, one accent, and nothing else

Rebuilt Rooted on that: Instrument Serif, Instrument Sans, JetBrains Mono, one
dark green-black world across every screen including the app itself. Cards
became rows. The filled buttons became a single cream pill and a hairline
link. The sign up fields became labels and rules rather than boxes, because a
stack of boxes reads as paperwork.

The forest went the other way on purpose: down to under half opacity behind a
heavy veil. It was competing with the words before. Atmosphere, not a
slideshow.

**One thing that bit**

`.display` and `.prose` set their own colour, so `text-moss` and `text-cream`
on the same element silently lost to them. Same specificity, and my rules came
later in the file. Fixed by taking colour out of both and leaving it a utility
at the call site. Worth remembering: a base class that sets colour will quietly
beat the utility you reach for later.

---

## 2026-09-16 - Real forest, real plants

**Changed my mind about the backdrop, and I was wrong the first time**

I built the landing background as drawn silhouettes: layered vector conifers,
vector birds, vector fireflies. Technically neat, cheap to load, and it looked
like a cartoon. A product about real trees cannot have a cartoon forest behind
it, and it took somebody saying so for me to see it.

Rebuilt it on real photographs. Four of them, each on a long slow push,
cross-fading into the next on a 56 second cycle. It is a camera move rather
than an effect, which is why it reads as a place instead of as wallpaper. Warm
light drifting across, dust rising through it, a gradient over the top so the
text stays readable whatever the picture is doing.

**Finding the photographs was the actual work**

Openverse, filtered to CC0 and Public Domain Mark, so nothing carries an
attribution condition. The search is not enough on its own: a query for "misty
forest" returned a foggy city street with Christmas lights, and "forest
silhouette sunset" returned a house. One of the first four was usable.

So `tools/forest_candidates.py` now pulls twenty candidates, numbers them and
lays them out as one contact sheet to look at before anything ships. Four good
ones out of twenty. That ratio is the reason the tool exists.

Plant photographs the same way, eight of them, cropped square and small enough
that a card costs under a hundred kilobytes.

**Also**

- Landing page and sign up, both over the forest.
- Today screen now carries real plant photographs rather than drawings, which
  is what the design spec asked for in the first place: the photography does
  the work, the chrome stays out of the way.

**Next**

- The capture flow, the verification card, the points ledger.

---

## 2026-09-16 - The app stands up

**Done**

- Six screens drawn and saved as a design canvas: Today, capture, verification
  card, plant profile, rewards, add a plant. Deep green on warm neutral,
  Bricolage Grotesque for the numbers. Plant artwork is placeholder until
  there are real photos, which is the honest way round: the app is supposed to
  be carried by the user's own pictures.
- Next.js app in `web/`, Tailwind, the design tokens from the spec wired into
  CSS variables so light and dark come from one place.
- Today screen running off a real schedule. Twelve hand-authored species care
  profiles, then open-meteo moves each watering by what the weather actually
  did at that plant's coordinates.
- The demo day control, so the schedule can be shown moving inside five
  minutes rather than waited on.

**It works, and the weather part is real**

Built it, served it, and the first card came back reading
`5mm of rain recently, 34 degrees today`. That is live data for the seeded
plant's location, and the next watering had already moved because of it. That
one line under each task is the whole weather feature made visible, and it
cost one fetch with no API key.

**Decided along the way**

- Website as a PWA, not a native app. Camera and location are both available
  in the browser, and a judge opens a link in one tap. Spending a day of four
  on distribution would be spending it badly.
- Every external call in the loop fails soft. The weather call falls back to a
  plain schedule rather than blocking the page, because a care reminder that
  waits on an API is worse than one that is a day out.

**Next**

- The capture flow, the verification card, and the points ledger. That closes
  the loop end to end, which is the one thing the demo has to show.

---

## 2026-09-16 - Brainstorm, and the decisions out of it

**Decided**

- **Reward the task, not the plant's condition.** I had argued for paying on
  verified condition because it is easier to measure and harder to fake. Wrong
  call: it stretches the user over weeks for a payoff they cannot feel, and
  people lose interest. Task-level keeps the loop tight. The cost of that
  decision is that verification now has to be real, which is the right cost to
  take on.
- Both audiences first class, event planting and household plants.
- Money: CSR, government and NGO programmes first, then partner-funded offers,
  then advertising.
- Loss is reported, never penalised. Points stay, streak carries, replanting
  earns a bonus. The system compounds rather than resetting.
- Reminders on every channel at once, push, email and WhatsApp. Normal
  practice, not a research problem. Out of build scope, in pitch scope.

**Done**

- `docs/verification.md`, the four layers plus per-task checks, and why OCR has
  no job in it.
- `docs/rewards.md`, how points are earned, what they turn into, where the
  money comes from.
- `docs/design.md`, screen by screen, plus the visual direction. Design is a
  scored criterion and it is also what decides whether anybody comes back.
- `docs/risks.md`, every objection with its answer, written as answers.

**The pipeline got rebuilt on better ground**

Looked back at `Recovering-computer-vision-annotations`, my GSoC work under
DeepForest. Registering a screenshot onto its clean original and subtracting is
exactly the shape of the problem here, and it measured 96.7% success at 0.38px.
So the scene check is not a loose similarity score any more, it is a
registration, and every per-task check runs on aligned pixels afterwards. The
watering check compares the same soil, not two vaguely similar photos.

The part worth carrying over most is the trust check that runs without labels.
Knowing when a result should not be believed is harder than being right, and it
is why pending review is a first class outcome here.

Disclosed as prior work in `state.md`. Technique reused, no code copied.

**Next**

- Validate the watering check. Two photos of one pot, dry and wet, through
  `tools/soil_delta.py`. This gates the whole task-verification story.

---

## 2026-09-16 - Setup and scope

**Done**

- Wrote the idea into `project.md`. Rooted: everybody plants a tree and nobody
  follows up, so attach the reward system we point at spending to keeping a
  tree alive instead.
- Cut the scope to one closed loop for the deadline: register, schedule,
  Today list, complete with proof photo, points, redeem. Push notifications,
  social feed and teams are out, written down so they stay out.
- Two decisions that came out of thinking about the video rather than the
  product. First, a reminder due in three days cannot be shown in a five
  minute demo, so the schedule is data plus a Today list, and the demo account
  is seeded past due. Second, the proof-photo check has to be non-blocking, a
  demo that hangs on an API call costs more than a feature that is missing.
- Picked a PWA over a native app. Camera and phone layout without spending a
  day of four on distribution.

**Next**

- Next.js scaffold on Vercel, link live the same day.
- Data model: plants, tasks, points ledger, redemptions.
- Hand-author the first 10 species care profiles.

---

## 2026-09-16 - Repo setup

**Done**

- Read the full NextStep Hacks 2026 brief off Devpost and wrote the rules that
  matter into `project.md`: Earth Forward theme, Sep 20 5:00pm EDT deadline,
  3 to 5 minute video, public repo, six judging criteria.
- Created this repo, public, so the commit history stands as the record that
  the project was built inside the Aug 21 to Sep 20 window.
- Set up the tracking files: `project.md`, `progress.md`, `state.md`.

**Open**

- Two things to confirm, both in `state.md`: the Sep 20 vs Sep 27 deadline
  discrepancy on the Devpost page, and eligibility (students only, 13 to 24).
