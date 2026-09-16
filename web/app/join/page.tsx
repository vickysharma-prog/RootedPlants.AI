import Link from "next/link";
import { ForestBackdrop } from "@/components/ForestBackdrop";

export default function Join() {
  return (
    <>
      <ForestBackdrop />

      <main className="on-forest flex flex-1 flex-col px-6 pt-16 pb-10">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f2efe4]/20"
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </Link>

        <h1 className="mt-8 font-display text-[32px] leading-[1.1] font-extrabold tracking-[-0.025em]">
          Start with one plant
        </h1>
        <p className="mt-3 max-w-[20rem] text-[15px] leading-relaxed text-[#cfd3c4]">
          One is enough. The neem in the backyard, the tulsi on the balcony, the
          sapling from last month&apos;s drive.
        </p>

        <form className="mt-8 flex flex-col gap-3.5">
          <Field label="Your name" type="text" placeholder="Vicky" autoComplete="name" />
          <Field label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <Field
            label="Mobile"
            type="tel"
            placeholder="For reminders on WhatsApp"
            autoComplete="tel"
          />

          <button
            type="submit"
            className="mt-2 flex h-[54px] items-center justify-center rounded-2xl bg-[#f2efe4] text-[16px] font-semibold text-[#0b1c17] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
          >
            Create my account
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#f2efe4]/15" />
          <span className="text-xs text-[#8d9285]">or</span>
          <span className="h-px flex-1 bg-[#f2efe4]/15" />
        </div>

        <button
          type="button"
          className="mt-6 flex h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-[#f2efe4]/25 text-[15px] font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M8 11l4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-7 text-[13px] leading-relaxed text-[#8d9285]">
          Your plant photos stay private. Anywhere a plant appears publicly, it
          appears in an area rather than at an address.
        </p>

        <div className="flex-1" />

        <p className="mt-8 text-center text-sm text-[#b9beac]">
          Already growing something?{" "}
          <Link href="/today" className="font-semibold text-[#f0c979] underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>
    </>
  );
}

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
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#b9beac]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-[52px] rounded-2xl border border-[#f2efe4]/18 bg-[#0a1a15]/60 px-4 text-[15px] text-[#f2efe4] outline-none placeholder:text-[#7c8175] focus:border-[#9ec9ad]/70"
      />
    </label>
  );
}
