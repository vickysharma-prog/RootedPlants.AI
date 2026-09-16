import { Page, Section } from "@/components/Legal";

export const metadata = { title: "How it works - Rooted" };

export default function HowItWorks() {
  return (
    <Page
      eyebrow="How it works"
      title="Paid against proof, not against a promise."
      lede="Rooted pays you for keeping a plant alive. That only means anything if the app can tell whether the work was actually done, so the checking is the product rather than a detail of it."
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
      </Section>

      <Section heading="Four things are checked, every time">
        <p>
          The photograph comes from inside the app, so there is nothing to feed
          an old picture into. The time is taken on our side, never read off
          the file. The location has to match the spot where the plant was
          registered. And the picture is registered against the plant&apos;s
          first photograph, so the same physical pixels can be compared over
          time.
        </p>
        <p>
          On top of those, each kind of task has its own check. For watering,
          the soil in the aligned photograph has to have darkened against that
          plant&apos;s own dry baseline.
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
