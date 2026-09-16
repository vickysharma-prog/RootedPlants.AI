import { Page, Section } from "@/components/Legal";

export const metadata = { title: "Accessibility - Rooted" };

export default function Accessibility() {
  return (
    <Page
      eyebrow="Accessibility"
      title="Built to be used outdoors, one handed."
      lede="Rooted is opened in sunlight, on a phone, often while holding a watering can. That is the same set of constraints that good accessibility asks for, so it is built in rather than added afterwards."
    >
      <Section heading="Reading it">
        <p>
          Body text sits at a line height near 1.8 and never drops below 13
          pixels. Text is cream on a dark background rather than pure white,
          which is easier on the eye and still clears contrast requirements.
        </p>
        <p>
          Nothing important is carried by colour alone. A task that is late
          says how late in words as well as in amber.
        </p>
      </Section>

      <Section heading="Touching it">
        <p>
          Every control is at least 44 pixels tall, and the main action on any
          screen sits in the lower half where a thumb reaches.
        </p>
      </Section>

      <Section heading="Motion">
        <p>
          The forest moves slowly and the reward animates. Both respect
          <span className="text-cream"> prefers-reduced-motion</span>: turn
          motion down in your device settings and the page holds still, with
          nothing lost.
        </p>
        <p>
          Sound is never automatic. It plays only after you ask for it, and it
          fades rather than cutting in.
        </p>
      </Section>

      <Section heading="The camera speaks">
        <p>
          While the camera is open, the app says the one thing that would make
          your photograph pass: too dark, hold still, tilt down so the soil is
          in frame, that is it. It uses the voice your device already has, so
          there is nothing to download and nothing is sent anywhere.
        </p>
        <p>
          It is there so that doing a task does not require reading a screen
          while holding a watering can. The same advice is always on screen as
          well, and the ring around the shutter turns green at the same moment,
          so nothing is only available as sound.
        </p>
        <p>
          There is a control beside the instruction to switch the voice off,
          and the choice is remembered.
        </p>
      </Section>

      <Section heading="Screen readers">
        <p>
          Headings are ordered, every control is labelled, and decorative
          artwork is hidden from the reading order. Photographs of plants carry
          the species as their description.
        </p>
        <p>
          The verification result is read as a list of checks with a plain
          reason each, which is the same thing a sighted person sees.
        </p>
      </Section>

      <Section heading="Where it falls short">
        <p>
          This is an early build. If something is hard to use, tell us at{" "}
          <span className="text-cream">access@rooted.example</span> and it gets
          treated as a bug rather than a request.
        </p>
      </Section>
    </Page>
  );
}
