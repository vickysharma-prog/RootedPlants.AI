# State

Where things stand right now. Read this first after any break. It holds
decisions that are settled, questions that are still open, and the facts about
the environment that are easy to forget.

**Last updated:** 2026-09-16

---

## Countdown

| | |
|---|---|
| Deadline | **Sep 20, 2026 @ 5:00pm EDT** |
| Same in IST | Sep 21, 2026 @ 2:30am |
| Working days left | 4 |

Plan against Sep 20. See "Open questions" below for why that date is worth a
second look.

---

## Decided

- Entering NextStep Hacks 2026, Earth Forward track, solo.
- **The build is Rooted**: register a tree, get a weather-adjusted care
  schedule, complete care tasks with a proof photo, earn points, redeem them
  from a partner catalogue. Full writeup in `project.md` section 2.
- **Website built as a PWA, not a native app.** Camera and phone layout
  without an app store between the judge and the demo.
- Stack: Next.js on Vercel, Postgres, object storage for photos, open-meteo
  for weather, hand-authored care profiles for 10 to 15 species.
- Scope is one closed loop. Push notifications, social feed, teams and real
  partner integrations are out, and that is settled.
- **Rewards go against verified tasks, not plant condition.** Condition is
  slow, partly outside the user's control, and stretches the user too far.
  Task-level is tight: small ask, done today, paid today.
- **Both audiences are first class**, event planting and household plants.
- **Money:** CSR, government and NGO programmes first, then partner-funded
  offers, then advertising. Rewards are the hook, the survival record is the
  asset.
- **Loss is reported, never penalised.** Points stay, streak carries, replant
  earns a bonus.
- **Reminders go out on every channel** the user has given us, push, email and
  WhatsApp together. Out of scope for the build, in scope for the pitch. The
  Today list is the demo surface.
- **Verification is registration-first**, following my own prior CV pipeline:
  align the proof photo onto the plant's baseline, then compare the same
  physical pixels. See `docs/verification.md`.
- Demo runs on a seeded account with plants already due, plus a "jump forward
  3 days" control. A schedule cannot be demonstrated by waiting for it.
- **Repo is private while building, and goes public before submission.** The
  rules require a viewable code link, so it has to flip on or before Sep 20.
  Put it on the submission checklist, not in memory.
- The commit history dated inside Aug 21 - Sep 20 is what proves the project
  was built in-period. That holds whether the repo is private or public, the
  dates travel with the commits. So: commit early, commit often, and do not
  squash the history into one drop at the end.
- Tracking lives in three files at the repo root: `project.md` (what and why),
  `progress.md` (dated log) and `state.md` (this file).

## Open questions

Each of these blocks something. Answer them before building past them.

1. **Eligibility, blocking.** Students only, 13 to 24 as of 21 Aug 2026,
   entering as an individual and not on behalf of a company. This voids the
   whole week if it is wrong, so it gets answered before anything else.
2. **Deadline, worth one check.** The Devpost header says
   "Deadline: Sep 20, 2026 @ 5:00pm EDT", and the rules page agrees. But the
   overview prose also describes the period as "Aug 21 to Sep 13, extended one
   additional week", which would read as Sep 27. The two do not reconcile.
   Planning to Sep 20 because it is the tighter of the two and the one stated
   as the deadline. If it turns out to be the 27th, that is a free week. The
   reverse mistake would be fatal, so it is not worth making.
3. **The watering check is not validated yet.** Soil darkening on aligned
   pixels is the one genuine sensor for "did you water". Two photos of one pot,
   dry and just watered, run through `tools/soil_delta.py`, settles it in
   fifteen minutes. If the drop is inside the noise, watering falls back to a
   vision check for visible water and the other layers carry more weight.
   **Do this before building on it.**
4. **Name.** "Rooted" is a working name. Cheap to change until the video is
   recorded, expensive after.
5. **Live deployment.** Decided: yes, Vercel, live from day one so the link is
   never a last-day job.

## Prior art carried in

Anything in this repo that was written before Aug 21, 2026 gets listed here:
what it is, where it came from, and what it does. This is the disclosure the
rules ask for, and it is also what keeps the in-period claim clean.

Nothing has been carried in. No code, no data, no assets. Everything in this
repo was written on or after 2026-09-16, inside the hackathon window, and the
commit history shows it.

| Component | Origin | Status |
|---|---|---|
| _(nothing)_ | | |

If anything is copied in later it gets a row here, named by file, before it is
committed. Knowing how to do something is not something that gets carried in,
it is just knowing how to do it.

## Environment

- Machine: Windows 11, PowerShell primary.
- Repo: `C:\Users\admin\nextstep-2026`
- GitHub account: `vickysharma-prog`
- Git identity: `vicky sharma <raghunathsharma296@gmail.com>`. This has to be
  an email on the GitHub account, otherwise commits will not link to the
  profile and the contribution graph will not back up the in-period claim.
  Unverified, `gh` lacks the `user` scope to read the account's email list.
  Check it on github.com/settings/emails, it takes ten seconds.
- Secrets live in `.env`, which is gitignored. Never in a committed file, and
  never in a screenshot in the demo video.

## Submission checklist

Tick these on the day, not on the hour.

- [ ] Demo video recorded, between 3:00 and 5:00, both bounds respected
- [ ] Video uploaded and the link is public and plays in an incognito window
- [ ] **Repo flipped to public** (`gh repo edit --visibility public`), README
      explains how to run it
- [ ] Live link works, if there is one
- [ ] Devpost project page complete
- [ ] `state.md` "Prior art carried in" is accurate and honest
- [ ] Submitted, with hours to spare, not minutes
