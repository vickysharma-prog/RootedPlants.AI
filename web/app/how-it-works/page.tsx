import { Page, Section } from "@/components/Legal";

export const metadata = { title: "How it works - Rooted" };

export default function HowItWorks() {
  return (
    <Page
      eyebrow="How it works"
      title="Paid against proof, not against a promise."
      lede="Rooted pays you for keeping a plant alive. That only means anything if the app can tell whether the work was actually done, so the checking is the product rather than a detail of it."
      clip={{
        src: "/video/planting.mp4",
        poster: "/video/planting-poster.jpg",
        caption:
          "This is the moment everybody records. Everything below is about the two years after it.",
        ratio: "11 / 6",
      }}
    >
      <Section heading="The schedule follows your weather">
        <p>
          Every species carries a hand-written care profile: how often it wants
          water, how often it wants feeding, and what to look at rather than
          what to measure.
        </p>
        <p>
          That profile is then moved by the weather at your plant&apos;s own
          coordinates. Rain in the last few days pushes the next watering out.
          A hot day pulls it in. The line under each task tells you which it
          was, so the app is visibly paying attention rather than counting
          days.
        </p>
      </Section>

      <Section heading="You always know what the photo has to show">
        <p>
          Before the camera opens, the task says exactly what to capture.
          Water the plant while photographing it, with the base and the wet
          soil both in frame. There is no hidden test: the instruction is the
          check, so following it passes every time.
        </p>
        <p>
          While the camera is open it reads the live frame a few times a second
          and says the one thing that would make this shot pass. Tilt down so
          the soil is in frame. Hold still. Too dark. That is it, take it. Out
          loud, because whoever is holding the phone is also holding a watering
          can, and the ring around the shutter turns green at the same moment
          for anybody with the sound off.
        </p>
      </Section>

      <Section heading="Three things are checked on every photograph">
        <p>
          It came off the camera rather than out of a file picker, so there is
          nothing to feed an old picture into. The time is taken on our side,
          never read off the file. And the location has to be within 120 metres
          of the spot where the plant was registered.
        </p>
      </Section>

      <Section heading="And it has to be that plant">
        <p>
          The new photograph and the plant&apos;s first one are both searched for
          keypoints, the two sets are matched, and the matches are then asked
          whether they agree on a single viewpoint. The same plant returns
          several hundred points that agree. A different plant of the same
          species, in a similar pot, returns about four.
        </p>
        <p>
          It runs on your phone, on a small copy of the picture, and nothing is
          uploaded to do it.
        </p>
      </Section>

      <Section heading="Then a check for the task itself">
        <p>
          Watering has to show soil at least five percent darker than that
          plant&apos;s own dry baseline, which is what wet soil does. Feeding
          has to show the soil surface changed from bare. A check-in has to
          show the leaves. A pest photograph has to be close enough, and sharp
          enough, that something the size of an aphid would be visible on a
          leaf.
        </p>
        <p>
          Every check reports the number it measured, in a sentence, and claims
          nothing beyond it. A location match says the photograph came from the
          right spot. It does not say it is the right plant, because a
          coordinate cannot know that.
        </p>
      </Section>

      <Section heading="Fertiliser and pests, the least that works">
        <p>
          Each species carries what to feed it with and what actually goes wrong
          with it, written as something to look at rather than a number to hit.
          Both tasks say the same thing about quantity: fertiliser the roots do
          not take ends up in the groundwater, and a spray kills the ladybirds
          that were handling the aphids for you. Start with the mildest thing
          that works.
        </p>
        <p>
          The pest check comes round sooner after warm, wet days, because that
          is when pests turn up.
        </p>
      </Section>

      <Section heading="Health is care, not diagnosis">
        <p>
          Every plant carries a score and one sentence saying what moved it. It
          is built from how the watering has gone against the schedule that
          species wants, and how long the run is.
        </p>
        <p>
          It deliberately does not read the leaves and tell you the plant is
          sick. A photograph shows a yellow leaf for a dozen reasons, and a
          number invented from one is a number that gets trusted.
        </p>
      </Section>

      <Section heading="When something does not line up">
        <p>
          The task stays open and you are told which check did not work, in
          plain words, with a button to take the photo again. Your streak is
          held while it waits. Nothing is silently rejected.
        </p>
      </Section>

      <Section heading="Losing a plant costs you nothing">
        <p>
          Plants die for reasons that have nothing to do with the person caring
          for them. Report it with a photograph: the points you earned stay
          earned, your streak carries to the next plant, and replanting earns a
          bonus.
        </p>
      </Section>

      <Section heading="Where the rewards come from">
        <p>
          Organisations spend heavily on planting drives every year and get
          back a photograph from planting day. Rooted produces the record of
          what actually survived, and that record is what funds the rewards.
          Partners fund their own offers, because for them it is the
          acquisition spend they were making anyway.
        </p>
      </Section>
    </Page>
  );
}
