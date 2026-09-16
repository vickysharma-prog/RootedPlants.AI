import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { SoundToggle } from "@/components/SoundToggle";
import { Clip } from "@/components/Clip";

export default function Join() {
  return (
    <div className="page">
      <ForestBackdrop scene="trunks" />

      <main className="on-forest column flex flex-1 flex-col pt-14 pb-12">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-body"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>
          <SoundToggle />
        </div>

        <p className="label rise-in mt-10">Step one of one</p>

        <h1 className="display h-sub rise-in mt-3" style={{ animationDelay: "0.06s" }}>
          Start with{" "}
          <span className="italic text-body">one plant.</span>
        </h1>

        <p className="prose-lg rise-in mt-5 max-w-[30rem] text-body" style={{ animationDelay: "0.12s" }}>
          One is enough. The neem in the backyard, the tulsi on the balcony, the
          sapling from last month&apos;s drive.
        </p>

        <form className="rise-in mt-10 flex max-w-[30rem] flex-col" style={{ animationDelay: "0.18s" }}>
          <Field label="Your name" type="text" placeholder="Vicky" autoComplete="name" />
          <Field label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <Field
            label="Mobile"
            type="tel"
            placeholder="Reminders reach you here"
            autoComplete="tel"
          />

          <button
            type="submit"
            className="btn mt-9 flex h-[56px] items-center justify-center rounded-full bg-cream text-[15.5px] font-semibold tracking-[0.01em] text-bg"
          >
            <span className="btn-label">Create my account</span>
            <span className="btn-arrow">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </form>

        <div className="mt-7 flex max-w-[30rem] items-center gap-4">
          <span className="rule flex-1" />
          <span className="label">or</span>
          <span className="rule flex-1" />
        </div>

        <button
          type="button"
          className="mt-7 flex h-[54px] max-w-[30rem] items-center justify-center gap-2.5 rounded-full border border-line text-[15px] font-medium text-cream"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M8 11l4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Continue with Google
        </button>

        <div className="flex-1" />

        <figure className="mt-14 max-w-[30rem]">
          <Clip
            src="/video/planting-tall.mp4"
            poster="/video/planting-tall-poster.jpg"
            ratio="31 / 26"
          />
          <figcaption className="mt-4 text-[16px] leading-[1.68] text-body">
            The photograph you take first becomes{" "}
            <span className="font-semibold text-cream">this plant&apos;s baseline</span>.
            Every later check is measured against it.
          </figcaption>
        </figure>

        <div className="mt-16 max-w-[34rem]">
          <div className="rule" />
          <p className="mt-6 text-[16px] leading-[1.7] text-body">
            Your plant photographs{" "}
            <span className="font-semibold text-cream">stay private</span>.
            Anywhere a plant appears publicly it appears in an area, never at
            an address.
          </p>
          <p className="mt-7 text-[16.5px] text-body">
            Already growing something?{" "}
            <Link href="/today" className="link-arrow inline-flex text-cream">
              <span className="link-text font-semibold">Sign in</span>
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * A field is a label and a rule, not a box. Boxes stack into a form that
 * looks like paperwork; rules read as a line to write on.
 */
function Field({
  label,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="group flex flex-col gap-1 border-b border-line py-4 focus-within:border-moss">
      <span className="label">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-8 bg-transparent text-[16.5px] text-cream outline-none placeholder:text-faint"
      />
    </label>
  );
}
