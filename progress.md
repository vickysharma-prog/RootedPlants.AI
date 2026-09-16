# Progress log

One entry per working session. Newest at the top. This is not just a diary:
"Learning" is a scored criterion at NextStep Hacks, and it is scored on what
I can say about what I built and what it cost me. The honest notes here are the
raw material for that. Write down the thing that broke, not only the thing that
worked.

**Format:** date, what got done, what broke, what is next.

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
