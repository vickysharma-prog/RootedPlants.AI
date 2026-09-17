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

## Sep 17, 2026

Built the rest of the app.

The thing I got wrong first was treating the app as a separate product. Today
was a 440px strip on a flat background with no forest behind it, and the moment
you signed in the whole editorial world of the landing page just stopped. Fixed
that before building anything else, so every new screen inherited it instead of
needing six retrofits later: same forest, same column, same type.

Moved plants, photographs and points into IndexedDB behind one module
(`lib/store.ts`), and made the schedule pure so it takes the weather as an
argument instead of fetching it. That is what lets the browser hold the plants
and the server hold the sky, and it is why a plant added in the app shows up on
Today. Photographs are resized on the way in, 1280px to keep and a 256px copy
for the checks to read, because a 4K frame per watering fills a phone inside a
month.

Then the loop: the task brief, the camera, the verification card, the points.
Plants, the plant profile with its photo history, add a plant, rewards with a
working redemption, the account screen.

**The camera talks now.** It reads the live frame a few times a second and says
the one thing that would make the shot pass. Out loud, through the browser's
own speech synthesis, because whoever is holding the phone is also holding a
watering can and is not reading anything. The ring turns green when there is
nothing left to fix, so the answer is there with the sound off too.

**Fertiliser and pests are their own tasks now**, with their own advice per
species and their own cadence. The pest look comes round sooner when it has
been warm and wet, which is when pests actually turn up. Both carry the line
about using the least that works: fertiliser the roots do not take ends up in
the groundwater, and a spray kills the ladybirds that were handling the aphids
for you.

### What broke

**A pest photo failed the framing check every time.** It is a close-up of one
leaf and the baseline is the whole plant, so of course the two do not
correlate. I had bolted the pest check onto the end of the block that only runs
when there is a baseline, without noticing that the same block runs the framing
check first. Pest photos now skip framing entirely and get their own check,
which does not need a baseline at all.

**`.btn` is only the motion layer.** Every button I wrote came out as bare text
on the forest, because the pill itself lives in utilities at the call site and I
had not looked. One `ACTION` constant now, used everywhere.

**The regex I used to apply it ate `className=`** off eight call sites and the
build went down. Wrote the replacement back properly.

**Openverse could only find 2 of 9 baseline photos.** Its CC0 pool is thin for
specific plants. Pexels found the rest, but searching "money plant" returned a
Bitcoin buried in a pot, which is exactly why I look at a contact sheet instead
of trusting a search. Replaced it with a photograph of somebody watering a
pothos.

### What I checked rather than assumed

Set the 5% soil threshold against real frames instead of picking a number. A
watered pot reads 28.4% darker than its dry baseline; the same frame against
itself reads 0.0%. Both verified in the browser too: uploading the baseline
back into the water task correctly failed with "the soil is no darker than this
plant's dry baseline", while framing passed.

The demo account also needed to stop being obviously a mock-up. It greeted
everybody as "there", the Me tab bounced to the sign-up form, and the profile
said verified 0 over a plant 119 days old. The demo link signs you into a real
account now, with four months of ledger behind it.

## Sep 17, 2026, later

Live at https://rootedplants.vercel.app.

Deployed with the CLI from `web/`, which is the project root on Vercel. The
GitHub connection failed because the repo is private and the Vercel app has no
access to it, so pushes do not deploy themselves yet. `npx vercel --prod` from
`web/` is the command until that is connected.

Vercel appended `.env*` to `web/.gitignore` during linking, after the
`!.env.example` line that exists to keep that one file committed. A negation
only holds until something re-ignores the pattern below it, so that would have
quietly dropped the example env file out of the repo on the next clone. Removed
it, and the duplicate `.vercel` entry it added alongside.

Checked every route against the live deployment rather than assuming the local
build was representative: all of them answer, the weather API returns
`live: true` with real readings, the server clock answers, and the 13MB OpenCV
file serves. That last one matters, because it is the only asset the identity
check cannot do without.

Also worth writing down: the site being on HTTPS is what makes the camera and
the location checks work at all. Both are only available on a secure origin, so
on `localhost` over plain HTTP they were never going to run, and every
verification I did here fell back to the file picker and reported honestly that
it had. The first real end-to-end pass has to happen on a phone against this
URL.

### The deploy that opened for me and not for anybody else

Two things were wrong at once and they looked like one thing.

**The project root.** Vercel created the project with the root directory set to
`.`, but the app lives in `web/`. Deploying from the CLI hid this completely,
because the CLI uploads whatever directory you run it in, so my deploys worked
while the first git-triggered build died in six seconds with "Couldn't find any
`pages` or `app` directory". Set the root to `web` and that build has something
to find.

**Deployment protection.** The project came with SSO protection on every
`vercel.app` domain, so `rooted-vicky-sharma.vercel.app` answers a stranger
with a Vercel login page. The alias `rootedplants.vercel.app` is open and
serves the real site, which is why it worked for me and not from another
machine. Worth knowing before a judge clicks the wrong one.

The lesson I want to keep: a deploy that works from my own machine has proved
almost nothing. Both faults were invisible from here and both would have been
discovered by somebody else, at the worst moment.

Resolved both, and took a readable domain while I was there:
**rootedplants.vercel.app**, attached to the project rather than pinned to one
deployment, so it follows production instead of going stale the next time
something ships. Protection is off, so the link opens for anybody without a
Vercel account, which is the only thing that matters when a judge clicks it.

## Sep 18, 2026

The day the app stopped being a loop and became a product, and the day I built
the film.

### Species identification, and what measuring saved me from

The add-plant flow asked people to pick from twelve tiles. Somebody with a
lemon tree had nothing to choose, so I set out to identify the plant from its
photograph on the device, from colour and texture.

**I measured it before shipping it.** Against seventeen labelled photographs it
put the right species first **zero times**, against eight percent for guessing
at random. Neem and curry leaf are both green pinnate leaves and no histogram
separates them. So it went in the bin, and PlantNet does that job: neem comes
back at 93%, and the genus fallback catches Epipremnum pinnatum against our
aureum.

That call costs something honest. It is the only moment in the app when a
photograph leaves the phone, so it is asked for once, before the camera opens,
in a sentence that says exactly that, and the privacy page names the exception
rather than keeping a claim that had stopped being true.

PlantNet also reads back whether there is a plant in the photograph at all.
Noise returns 404, a wall 0.5%, a plain object 0.2%, while the weakest real
plant photograph in testing still scored 9%. Three percent sits in that gap,
which is how registering a notebook now fails on "It is a plant" rather than
sailing through to the species picker.

### Seventy-eight species, and a search box

Twelve became seventy-eight, with the names people actually use attached, so
"mogra" finds jasmine and "kadi patta" finds curry leaf. A grid of
seventy-eight would have been worse than twelve, so the picker leads with
search.

And five profiles for anything not on the list. Naming a plant and knowing how
to keep it alive are separate jobs: somebody who cannot name what is in front
of them still knows whether it is a tree in the ground or a succulent on a
windowsill, and those want opposite treatment.

### Reminders, and the one thing that had to go on a server

The channels on the account screen were switches that did nothing.

The awkward part is that plants live on the phone, so no server knows whose
plant is overdue and there is nothing for a clock to run against. The smallest
thing that solves it: the browser registers who to reach, what the plant is
called, and when the next few tasks are due. No photographs, no coordinates, no
points. A daily cron reads that and sends on whichever channels are on.

It was hourly until it met the plan it runs on. A Hobby account allows one cron
a day, so the deploy carrying the whole reminder pipeline was refused outright
and I did not notice, because every push after it touched only the video and
the docs, which Vercel correctly skips when the root directory is the app. The
app sat eight commits behind production for a day. Daily is the better
behaviour anyway: nobody wants to hear about a plant every hour, and watering
is a morning job.

### What broke

**The guide swallowed the verdict.** The results screen said nothing out loud.
The verdict was spoken and then killed mid-sentence, because the stage changed,
the screen guide fired with an empty line, and an empty line still calls
cancel.

**A pest photo could never pass.** It is a close-up of one leaf and the baseline
is the whole plant, so the framing check refused it every time. Pest photos
skip framing entirely now.

**The demo plants were pinned to one city.** Anybody opening the demo anywhere
else was 234km from a plant the app had just handed them. The check was working
perfectly and looked broken.

**The videos were never in git.** A rule called them too big; they are 9MB.
Deploying with the CLI uploads whatever is in the folder, so the backdrop
played every time I looked, and the first build from the repo alone served 404
for every one of them.

### The film

Not a screen recording with somebody talking over it. Eighteen designed frames
in the app's own tokens, rendered headless out of the browser, with recordings
of the real site playing inside the phone in six of them.

Those recordings come straight off Chrome's compositor at 390 by 844, so the
forest behind the landing page is actually moving rather than frozen. Three
things fought that: Chrome answers 404 on its debug endpoints unless the Host
header says localhost, it rejects a websocket carrying an Origin it was not
told to expect, and it emits a frame when something changes rather than on a
clock, so writing them at a fixed rate turned twenty seconds of scrolling into
six.

**And the voice drifted behind the picture.** Every MP3 carries encoder padding
at each end, and joining fifty-six of them by copy added three and a quarter
seconds the frames knew nothing about. The narration goes through WAV now and
the build prints the disagreement: zero milliseconds.

The problem section is no longer an assertion. India's national auditor spent
ten years looking: about five percent of the target achieved, no improvement in
tree cover at seventy percent of sites, and one site that reported two thousand
plantings where thirty were found and none had survived. The figure that is
actually our product is that four out of five plantation records did not say
what was planted, where it stood, or whether it lived. Every number is in
`docs/evidence.md` with its source.
