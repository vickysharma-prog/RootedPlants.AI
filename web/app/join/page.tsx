import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";

export default function Join() {
  return (
    <>
      <ForestBackdrop />

      <main className="on-forest flex flex-1 flex-col px-6 pt-16 pb-12">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-body"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </Link>

        <p className="label rise-in mt-10">Step one of one</p>

        <h1 className="display rise-in mt-3 text-[38px]" style={{ animationDelay: "0.06s" }}>
          Start with
          <br />
          <span className="italic text-body">one plant.</span>
        </h1>

        <p className="prose rise-in mt-5 max-w-[22rem] text-body" style={{ animationDelay: "0.12s" }}>
          One is enough. The neem in the backyard, the tulsi on the balcony, the
          sapling from last month&apos;s drive.
        </p>

        <form className="rise-in mt-10 flex flex-col" style={{ animationDelay: "0.18s" }}>
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
            className="mt-9 flex h-[56px] items-center justify-center rounded-full bg-cream text-[15.5px] font-semibold tracking-[0.01em] text-bg"
          >
            Create my account
          </button>
        </form>

        <div className="mt-7 flex items-center gap-4">
          <span className="rule flex-1" />
          <span className="label">or</span>
          <span className="rule flex-1" />
        </div>

        <button
          type="button"
          className="mt-7 flex h-[54px] items-center justify-center gap-2.5 rounded-full border border-line text-[15px] font-medium text-cream"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M8 11l4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Continue with Google
        </button>

        <div className="flex-1" />

        <div className="mt-14">
          <div className="rule" />
          <p className="mt-6 text-[13.5px] leading-[1.75] text-faint">
            Your plant photographs stay private. Anywhere a plant appears
            publicly it appears in an area, never at an address.
          </p>
          <p className="mt-6 text-[14px] text-body">
            Already growing something?{" "}
            <Link href="/today" className="border-b border-line pb-px text-cream">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
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
