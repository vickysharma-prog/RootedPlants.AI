# The video

Three minutes minimum, five maximum, both hard. Target **4:30**.

Record on a phone against **https://rootedplants.vercel.app**, because the
camera, the location check and the voice only work on a real device over
HTTPS, and those are the parts worth showing.

---

## The shape

Every beat below is something that runs. Nothing here is a mockup and nothing
needs a caveat spoken over it.

### 0:00 – 0:35 · Why this exists

Landing page, forest moving behind it. Sound on for a moment.

> "Everybody plants a tree. A birthday, a school drive, a company CSR day.
> They plant it, they take the photo, they post it, and that is where it ends.
> Nobody finds out what happened to that tree.
>
> We hand out points for spending money. Pay a credit card bill on time and
> you earn something. So why not pay people for keeping something alive?"

**Serves:** Originality, Adherence to Track. The environmental connection is
the product, not an angle on it.

### 0:35 – 1:10 · The schedule is real

Sign in. Today, with tasks due.

Point at the line under a task: *"7mm of rain recently, 34° today"*.

> "That is not a timer. Every plant carries its own coordinates, and the
> schedule is moved by the weather actually over it. Rain pushes the next
> watering out. A heat spell pulls it in. A pest check comes round sooner
> after warm wet days, because that is when pests turn up."

Tap **+3 days**. The list refills.

> "That control is there because a watering due on Saturday cannot be shown in
> a five minute video."

### 1:10 – 2:20 · The loop

Tap a task.

> "It tells you exactly what the photograph has to show, before the camera
> opens. There is no hidden test."

Open the camera. **Let the voice be heard.** Point it away first so it says
*"Point it at the plant"*, then frame it properly until it says *"That is it.
Take it."* and the ring turns green.

> "Whoever is doing this is holding a watering can. So it reads the frame a few
> times a second and says the one thing that would make the shot pass, out
> loud."

Shutter. Checks land one at a time.

> "Each one says the number it measured. Where the photograph came from. The
> time, taken on our side, never read off the file. The location, against where
> this plant was registered."

Points, with leaves across the screen.

**Serves:** Completion. This is the whole product in seventy seconds.

### 2:20 – 3:05 · The check that makes it mean anything

Do the same task again, but point the camera at **a different plant of the
same species**.

> "This is the one that matters. If photographing any plant earned points, the
> points would be worth nothing."

Let it fail on **It is this plant**.

> "OpenCV finds keypoints in this photograph and in the plant's first one,
> matches them, and asks whether the matches agree on a single viewpoint. The
> same plant returns four hundred and eighty five. A different plant of the same
> species, in a similar pot, returns four.
>
> It runs on the phone. No photograph is uploaded to do it."

**Serves:** Technology. Say the two numbers out loud. They are the argument.

### 3:05 – 3:40 · Adding a plant

**Add a plant**, and photograph something that is not a plant first.

> "It checks the photograph before it accepts it."

*That is not a plant.* Then photograph a real one.

> "It works out what it is from the photograph, and it says how confident it
> is. Below thirty percent it will not fill the answer in for you."

Type **mogra** into the search.

> "Seventy-eight plants, and it searches the names people actually use. And for
> anything not on the list, five profiles by how it grows, because knowing a
> plant's name and knowing how to keep it alive are different jobs."

Register it. Points land.

### 3:40 – 4:05 · Where the money comes from

Rewards. Balance, then redeem one.

> "Organisations spend heavily on planting drives every year and get back a
> photograph from planting day. Rooted produces the record of what actually
> survived, and that record is what funds these. The offers here are
> stand-ins, because naming a real company in a demo would put words in their
> mouth."

### 4:05 – 4:30 · What I got wrong

The honest beat. Do not skip it, it is a scored criterion.

> "Two things I had to throw away.
>
> I tried to identify the species on the device, from colour and texture. I
> measured it before shipping it: it got the right species first zero times out
> of seventeen, against eight percent for guessing at random. Neem and curry
> leaf are both green pinnate leaves and no histogram separates them. So it
> went, and a real identification service does that job.
>
> And the check that says this is the same plant used to be a comparison of
> eight by eight brightness grids. A photograph of a different neem tree passed
> it. It was the weakest thing in the app wearing the name of the strongest, so
> it was replaced with keypoint matching.
>
> Nothing in here reports a number it did not measure."

---

## Before recording

- Phone, HTTPS, on the live URL. Not localhost.
- Sound on for the landing and for the camera.
- Have **two plants of the same species** to hand. The 2:20 beat needs them.
- Have something that is not a plant to hand for 3:05.
- Clear site data first so the demo account seeds fresh and the numbers are
  the ones described here.
- Check no real phone number is on screen in the account.

## What each criterion is served by

| Criterion | Beat |
|---|---|
| Originality | 0:00, rewards pointed at keeping rather than spending |
| Adherence to Track | 0:00, and the whole product |
| Completion | 1:10, the loop closed end to end |
| Learning | 4:05, what was measured and thrown away |
| Design | Throughout, without mentioning it |
| Technology | 2:20, the two numbers |
