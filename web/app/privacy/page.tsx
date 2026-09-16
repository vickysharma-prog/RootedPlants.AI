import { Page, Section } from "@/components/Legal";

export const metadata = { title: "Privacy - Rooted" };

export default function Privacy() {
  return (
    <Page
      eyebrow="Privacy"
      title="What we hold, and why."
      lede="Rooted asks for a photograph of your plant and the spot it grows in. Both are sensitive, because together they say where you spend your time. Here is exactly what happens to them."
    >
      <Section heading="Your photographs">
        <p>
          Every photograph you take is private by default. Nobody else sees the
          picture of your neem unless you share it yourself.
        </p>
        <p>
          Photographs are used for one thing: checking that a care task was
          done, and building the growth timeline you see on your plant&apos;s
          page. They are not used to train anything, and they are not sold.
        </p>
        <p>
          As it stands they never leave your phone at all. Your plants, your
          photographs and your points are held by the browser on the device,
          and the checking runs there too, on a small copy of the picture. No
          photograph is uploaded, no model is called, and there is no server
          holding a library of where people live.
        </p>
        <p>
          The trade is that an account lives on one device. Clearing the
          browser&apos;s data for this site clears the plants with it.
        </p>
      </Section>

      <Section heading="Where your plant is">
        <p>
          A plant&apos;s coordinates are fixed when you register it, because
          every later check is measured against that point. That is what stops
          somebody photographing a tree that is not theirs.
        </p>
        <p>
          Anywhere a plant appears publicly, it appears in an area rather than
          at an address. A shared plant page says the neighbourhood, never the
          house.
        </p>
        <p>
          Location is read at two moments and no others: when you register a
          plant, and when you photograph a task so the two can be compared. It
          is not tracked in between. The three plants in the demo account are
          placed near wherever you open it, so the check has something real to
          measure against.
        </p>
      </Section>

      <Section heading="What a partner sees">
        <p>
          When a reward is redeemed, the partner is told that a valid code was
          used. They are not told which plants you keep, where they are, or
          what you photographed.
        </p>
        <p>
          When an organisation runs a planting drive through Rooted, it sees
          survival and care figures for the plants in that drive. It does not
          see the photographs or the exact locations behind them.
        </p>
      </Section>

      <Section heading="How we reach you">
        <p>
          Reminders go to the channels you give us and nowhere else. Turning a
          channel off turns it off; there is no separate marketing list.
        </p>
      </Section>

      <Section heading="Leaving">
        <p>
          You can export everything you have put in, and you can delete your
          account. Deleting removes your photographs and your plants&apos;
          locations. Aggregate survival counts that have already been reported
          stay, with nothing in them that points back to you.
        </p>
      </Section>

      <Section heading="Asking">
        <p>
          Questions about any of this go to{" "}
          <span className="text-cream">privacy@rooted.example</span>, and get a
          reply from a person.
        </p>
      </Section>
    </Page>
  );
}
