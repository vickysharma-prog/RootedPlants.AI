# The numbers in the pitch

Every figure spoken in the video, with what it measures and where it came
from. Nothing here is rounded in our favour and nothing is quoted without its
source.

## The problem

From the Comptroller and Auditor General of India's performance audit of the
Green India Mission, covering 2015 to 2025 across 15 states and one union
territory.

| Figure | What it measures |
|---|---|
| **~5%** | Of the 2.8 million hectare afforestation target actually achieved |
| **97.57%** | Missed on the 1.4 million hectare ecosystem restoration goal |
| **~70%** | Of assessed plantation locations showed little to no improvement in tree cover |
| **431 of 556** (77.52%) | Plantation journals that lacked the species planted, the coordinates, or the survival percentage |
| **95 of 559** sites | Physically verified at 0 to 40% survival. Another 180 sat between 41 and 70%. Only 284, half of them, reached 70% or above |
| **22.42 cm** | Average height of surviving plants after two years, against a prescribed minimum of 75 cm |
| **2,000 reported, 0 survived** | One site in Uttarakhand, where 30 to 40 saplings were found on the ground and none of them had lived |

Sources:
- <https://india.mongabay.com/2026/08/audit-exposes-fundamental-flaws-in-green-india-missions-execution/>
- <https://www.thestatesman.com/cities/kolkata/70-plantation-sites-show-no-change-in-tree-cover-cag-finds-1503630988.html>

**The line that matters most is the fourth one.** Four out of five plantation
records did not say what was planted, where it stands, or whether it lived.
That is not a reporting problem to be fixed with a better form. It is the
absence of the thing this product makes: a record of what survived, produced
by the person who kept it alive, as they keep it alive.

## Our own measurements

These are ours, taken from the app itself and repeatable from this repo.

| Figure | What it measures | Where |
|---|---|---|
| **485 vs 4** | Keypoint inliers against a plant's own baseline, versus a different plant of the same species | `web/lib/identity.ts`, measured live in the app |
| **28.4% vs 0.0%** | A watered pot against its dry baseline, and the same frame against itself | `docs/verification.md` |
| **0 of 17** | Times an on-device colour and texture descriptor picked the right species, against 8% for guessing at random | `docs/verification.md` |
| **0.2% and 0.5%** | What a photograph of a plain object and a wall score as plants. The weakest real plant photograph scored 9% | `web/app/api/identify/route.ts` |
