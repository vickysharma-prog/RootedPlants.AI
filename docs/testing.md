# Testing it, feature by feature

Live: **https://rootedplants.vercel.app**

Open it on a phone. The camera and the location checks only work on a secure
origin, so on a laptop over `localhost` the camera falls back to the file
picker and the card says so. Everything else works anywhere.

To start clean at any point: browser settings, clear site data for this site.
The demo account seeds itself again on the next load.

---

## 1. Landing

| What to do | What should happen |
|---|---|
| Open the site | Forest video moving behind the words, not a still |
| Tap the sound bars, top right | Wind through trees fades in over a second, bars start moving. It is loud enough to hear over a room now |
| Hover the two buttons | Label slides left, an arrow arrives, a sheen crosses, background goes cream |
| Hover the four numbered steps | Hairline fills from the left, number turns gold and lifts, title and body slide right |
| Scroll the whole page | Two clips play inline with no visible edge or border, blended into the page |
| Bottom links | How it works, Privacy, Accessibility all open |

## 2. Sign up

| What to do | What should happen |
|---|---|
| Tap **Start with one plant** | Sign-up page, different forest clip from the landing |
| Focus each field | Rule under it grows, label turns gold then moss |
| Submit empty | Three errors, each in plain words, rules turn amber |
| Type a mobile number only | Name and email still complain. The number is required, and the note under it says why |
| Fill all three, submit | Straight into Today, greeted by your first name |
| **See the demo account** | Signs you in as Vicky with six plants and four months of history |

## 3. Today

| What to do | What should happen |
|---|---|
| Look at the top | Your initial, your points, your streak |
| Look at a task | Plant name, what to do, and **why now**, for example "7mm of rain recently, 33° today". That line is live weather at that plant's coordinates |
| Look for overdue | Late tasks say how late, in amber, and sort to the top |
| Tap **+3 days** | The whole schedule moves. Tasks that were coming up are now due |
| Tap **reset** | Back to today |

## 4. Doing a task, the main loop

| What to do | What should happen |
|---|---|
| Tap any task row | The brief: what to photograph, what it pays, and this species' own advice |
| A feeding or pest task | Also says what to feed it with, or what goes wrong with that plant, and to use the least that works |
| Tap **Open the camera** | Viewfinder, with the plant's first photograph faint over the live frame so you can line it up |
| Point it at the floor | It says "Point it at the plant", out loud |
| Cover the lens | "Too dark to check" |
| Frame the plant properly | "That is it. Take it." and the ring around the shutter turns green |
| Tap the speaker icon | Voice stops. The advice stays on screen and the ring still turns green |
| Press the shutter | Checks arrive one at a time, each saying the number it measured |
| Watch the identity check | "It is this plant" with how many points lined up with its first photograph. Several hundred means yes |
| If everything passes | Card lifts, points count up, leaves drift past |
| Photograph a different plant | "It is this plant" fails, with the count. Task stays open, streak held |
| Tap **Take it again** | Straight back to the camera |

**Worth trying on purpose:** point the camera at a different plant of the same
species. That is the check that used to pass and now does not.

## 5. Your plants

| What to do | What should happen |
|---|---|
| Tap **Plants** | Six plants, each with its own last photograph, not a stock species picture |
| Look at the bar on a card | Thriving, Steady, Watch it or At risk, with a score |
| Tap a plant | Its whole record |
| On the plant page | Days old, streak, photo count, health with a sentence saying what moved it |
| Scroll down | Every photograph in order, oldest at the bottom |
| Tap **Report that this plant is gone** | Reasons to pick from, including "I do not know". It says your points stay and your streak carries |
| Report it | Plant moves to "No longer with you" with its points kept |

## 6. Adding a plant

| What to do | What should happen |
|---|---|
| Plants, then **Add a plant** | Step one of three: photograph it |
| Take the photo | Step two, with an offer to identify it from the photograph |
| **Identify it** | Names the plant with how confident it is, selects it below, and reorders the list so its guesses are first |
| **I know what it is** | The offer goes away and the picker behaves as it always did |
| Pick one | Step three: name, where it stands, and its spot |
| Tap **Use where I am now** | Coordinates appear, taken from the device rather than typed |
| Register it | Straight to its page, with your photo as its baseline |
| Go to Today | The new plant's tasks are in the list, on its species' own schedule |

## 7. Rewards

| What to do | What should happen |
|---|---|
| Tap **Rewards** | Balance at the top, five offers below |
| An offer you cannot afford | Says how many more points to go, not just greyed out |
| An offer you can afford | **Redeem it**, then a confirm step |
| Redeem | Code appears with the same lift and leaves, balance drops |
| Scroll down | Every point accounted for, by plant and task |

## 8. You

| What to do | What should happen |
|---|---|
| Tap **Me** | Name, email, number, and four counts |
| The three channels | Text message, WhatsApp, email, each switchable on its own |
| Switch one off and reload | It stays off |
| **Sign out** | Back to the landing. Signing in again keeps your plants, because they are on the device |

## 9. The written pages

How it works, Privacy and Accessibility should each describe what the app
actually does. If anything on those pages is no longer true of the app, that is
a bug in the page.

---

## Known to be untested

The camera, the spoken guide and the identity check have only ever run through
the file picker on a laptop with no camera. Their first run against a real
phone camera is still ahead.
