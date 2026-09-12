"use client";

import { useActionState } from "react";
import { IconAlert, IconCheck } from "@/components/Icons";

export interface ActionState {
  ok?: string;
  error?: string;
}

type Action = (prev: ActionState | null, form: FormData) => Promise<ActionState | void>;

/**
 * Wraps a server action with pending state and inline feedback, so every admin
 * form reports success or failure the same way.
 */
export default function ActionForm({
  action,
  children,
  className,
  submitLabel,
  submitClass = "btn btn-sm",
  quiet = false,
}: {
  action: Action;
  children?: React.ReactNode;
  className?: string;
  submitLabel: string;
  submitClass?: string;
  /** Report as a compact marker rather than a block — for table rows. */
  quiet?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState | null, form: FormData) => (await action(prev, form)) ?? {},
    null,
  );

  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" className={submitClass} disabled={pending}>
        {pending ? "…" : submitLabel}
      </button>

      {!quiet && state?.error && (
        <p className="notice notice-red adm-flash" style={{ marginTop: 10 }}>
          <IconAlert size={16} /> <span>{state.error}</span>
        </p>
      )}
      {!quiet && state?.ok && (
        <p className="notice adm-flash" style={{ marginTop: 10, background: "rgba(0,128,9,0.08)", color: "#0a5c12" }}>
          <IconCheck size={16} /> <span>{state.ok}</span>
        </p>
      )}
      {quiet && (state?.error || state?.ok) && (
        <span
          className={state.error ? "pill pill-failed" : "pill pill-paid"}
          style={{ marginLeft: 6 }}
          title={state.error ?? state.ok}
        >
          {state.error ? "!" : "✓"}
        </span>
      )}
    </form>
  );
}
