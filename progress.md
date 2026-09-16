# Progress log

One entry per working session. Newest at the top. This is not just a diary:
"Learning" is a scored criterion at NextStep Hacks, and it is scored on what
I can say about what I built and what it cost me. The honest notes here are the
raw material for that. Write down the thing that broke, not only the thing that
worked.

**Format:** date, what got done, what broke, what is next.

---

## 2026-09-17 - Accounts, the second attempt

Put Auth.js in with Google, wrote the middleware, wired the sign in page, then
stopped. Google needs OAuth credentials out of a console, which means anybody
who wants to use this, including me recording the demo, has to go somewhere
else first and come back with two strings. That is a wall in front of the
thing rather than a door into it.

Took it out. The form makes a real account now: name, email, optional mobile,
held in a cookie on the device. It survives reloads and restarts, it signs
out, and Today greets you by name. Eight seconds from landing on the page to
being inside the app, with nothing to install and nothing to go and fetch.

It is honest about what it is not. There is no password, and an account lives
on one device, and both of those are written in the README rather than left
for somebody to find out.

The general version of the lesson: before building the version everybody
builds, ask what it costs the person on the other side. Sometimes the standard
answer is the wrong one for what you are actually making.

---

## 2026-09-17 - The edge that would not go away

Spent a while on one small thing and learned something worth keeping.

The planting clip on the landing read as a card pasted onto the page. First
fix: drop the hairline, feather all four edges into the page colour, take the
brightness down. Better, and the edge was still there.

The reason took a minute to see. Fading into a flat colour only works over a
flat page. Behind this clip is moving forest footage, so a dark gradient
around the edges is a dark rectangle drawn on top of a bright forest. The
border anybody could see was the fade itself.

A mask fixes it properly: two linear gradients composited to intersect, so the
clip becomes genuinely transparent towards its edges and the backdrop shows
through. No border to notice, because there is no edge.

Worth remembering: fading to a colour is not the same as fading out. Over
anything that moves, only one of them is invisible.

---

## 2026-09-17 - The mark, and a rule out of it

The mark beside the wordmark was five bars bouncing, a few centimetres from a
sound control that is also five bars bouncing. Same gesture, two meanings.

I over-corrected first and replaced the whole mark with a seedling drawing
itself. Wrong fix: the bars were fine, it was the motion that collided. So the
bars are back and the motion changed. They now build rather than bounce, each
rising in turn to a taller height than the last and holding there while you
read the name. A level bounces; a record of something kept builds.

The rule that came out of it is worth more than the mark: **two things on one
screen never share a gesture.** Matching shapes are fine. Matching behaviour
is what makes the eye read one control as a copy of another.

---

## 2026-09-17 - Real moving forest, and sound

**Video, after a long detour**

I wanted real trees moving rather than a drawn animation or a still with a
slow zoom on it. That took three dead ends first. Wikimedia has public domain
forest video but the usable files are 780MB; the small ones turned out to be a
garden with a swing and a NASA LIDAR visualisation once I pulled frames out of
them. The good forest footage there is CC BY-SA, which carries an attribution
condition.

Pexels solved it. Five clips now, each doing a different job:

- **jungle**, camera moving through dense green, behind the landing
- **trunks**, looking straight up through tall trees, behind sign up
- **canopy**, drifting above a green canopy, behind the written pages
- **planting** and **planting-tall**, people actually putting saplings in the
  ground, in the page rather than behind it

The last two are the ones that change the page. The hero says nobody finds out
what happened to the tree; the clip underneath is somebody planting one on a
street. That is the whole argument in two seconds without a word of copy.

All five are 1152 wide at crf 32 or 33, 10 to 14 seconds, muted, with a poster
frame so a block never opens as a hole. Nine and a half megabytes for the lot.
Backdrops sit at 55% opacity under the veil, because a video playing at full
strength behind text is a video with text on it rather than a page.

**Sound**

Wind through trees, CC0, trimmed to 52 seconds with fades so the loop does not
click. It plays only on a tap, because browsers block audio until somebody
asks and that is the right rule. The control is five bars that move while it
plays, so it shows its own state without a label.

**Also**

Footer was a paragraph nobody would read. It is three real pages now: how the
verification works, accessibility, privacy. Written properly rather than as
placeholders, because they are the pages that say whether a product has been
thought about.

**Note for later:** the Pexels key lives in `web/.env.local` and is gitignored.
`tools/fetch_forest_video.py` reads it from there.

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
