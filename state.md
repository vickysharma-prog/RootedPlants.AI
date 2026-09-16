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
- Repo is public from day one. The public commit history dated inside
  Aug 21 - Sep 20 is what proves the project was built in-period, which the
  rules require. So: commit early, commit often, do not squash the history
  into one drop at the end.
- Tracking lives in three files at the repo root: `project.md` (what and why),
  `progress.md` (dated log) and `state.md` (this file).

## Open questions

Each of these blocks something. Answer them before building past them.

1. **The idea.** Not recorded yet. Everything downstream waits on it.
2. **Deadline, worth one check.** The Devpost header says
   "Deadline: Sep 20, 2026 @ 5:00pm EDT", and the rules page agrees. But the
   overview prose also describes the period as "Aug 21 to Sep 13, extended one
   additional week", which would read as Sep 27. The two do not reconcile.
   Planning to Sep 20 because it is the tighter of the two and the one stated
   as the deadline. If it turns out to be the 27th, that is a free week. The
   reverse mistake would be fatal, so it is not worth making.
3. **Eligibility, to confirm.** The event is students only, ages 13 to 24 as of
   Aug 21 2026, and professional organisations are excluded. Entry is as an
   individual. Confirm both before sinking four days in.
4. **Live deployment.** A hosted link is listed as "if applicable", not
   required. Decide whether to ship one once the scope is set.

## Prior art carried in

Anything in this repo that was written before Aug 21, 2026 gets listed here:
what it is, where it came from, and what it does. This is the disclosure the
rules ask for, and it is also what keeps the in-period claim clean.

| Component | Origin | Pre-hackathon or in-period |
|---|---|---|
| _(nothing yet)_ | | |

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
- [ ] Repo public, README explains how to run it
- [ ] Live link works, if there is one
- [ ] Devpost project page complete
- [ ] `state.md` "Prior art carried in" is accurate and honest
- [ ] Submitted, with hours to spare, not minutes
