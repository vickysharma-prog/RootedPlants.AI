"use client";

import { useActionState } from "react";
import { createAccount, type JoinState } from "@/app/join/actions";

const EMPTY: JoinState = { errors: {}, values: {} };

/**
 * The form that makes an account.
 *
 * A field is a label and a rule, not a box. Boxes stack into something that
 * looks like paperwork; rules read as a line to write on. An error appears
 * under its own field in plain words, and the rule it belongs to turns amber,
 * so nobody has to hunt for what went wrong.
 */
export function JoinForm() {
  const [state, action, pending] = useActionState(createAccount, EMPTY);

  return (
    <form action={action} className="flex max-w-[30rem] flex-col">
      <Field
        name="name"
        label="Your name"
        type="text"
        placeholder="Vicky"
        autoComplete="name"
        defaultValue={state.values.name}
        error={state.errors.name}
      />
      <Field
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        defaultValue={state.values.email}
        error={state.errors.email}
      />
      <Field
        name="mobile"
        label="Mobile"
        type="tel"
        placeholder="Where the reminders reach you"
        autoComplete="tel"
        defaultValue={state.values.mobile}
        error={state.errors.mobile}
        note="This is the one we actually need. A plant you forget is a plant that dies, so the reminder has to come to you rather than wait in an app you did not open."
      />

      <button
        type="submit"
        disabled={pending}
        className="btn mt-9 flex h-[56px] items-center justify-center rounded-full bg-cream text-[15.5px] font-semibold tracking-[0.01em] text-bg disabled:opacity-70"
      >
        <span className="btn-label">
          {pending ? "Setting things up" : "Create my account"}
        </span>
        <span className="btn-arrow">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>

      <p className="mt-4 text-[14.5px] leading-[1.7] text-faint">
        No password. This device stays signed in until you sign out.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  defaultValue,
  error,
  note,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  defaultValue?: string;
  error?: string;
  note?: string;
}) {
  return (
    <label
      className="group flex flex-col gap-1 border-b py-4 focus-within:border-moss"
      style={{ borderColor: error ? "var(--overdue)" : "var(--line)" }}
    >
      <span className="label" style={error ? { color: "var(--overdue)" } : undefined}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className="h-8 bg-transparent text-[16.5px] text-cream outline-none placeholder:text-faint"
      />
      {error ? (
        <span className="mt-1 text-[14px]" style={{ color: "var(--overdue)" }}>
          {error}
        </span>
      ) : note ? (
        <span className="mt-1.5 text-[14px] leading-[1.6] text-faint">{note}</span>
      ) : null}
    </label>
  );
}
