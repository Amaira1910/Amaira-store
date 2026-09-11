"use client";

import { useActionState } from "react";
import { IconAlert } from "@/components/Icons";
import { loginAction } from "@/app/admin/actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(
    async (prev: { error?: string } | null, form: FormData) => (await loginAction(prev, form)) ?? {},
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />

      <label className="field">
        <input className="field-input" type="email" name="email" placeholder=" " autoComplete="username" required />
        <span className="field-label">Email</span>
      </label>

      <label className="field">
        <input
          className="field-input"
          type="password"
          name="password"
          placeholder=" "
          autoComplete="current-password"
          required
          minLength={8}
        />
        <span className="field-label">Password</span>
      </label>

      {state?.error && (
        <p className="field-error" style={{ marginTop: 10 }}>
          <IconAlert size={14} /> {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-block" style={{ marginTop: "var(--s-5)" }} disabled={pending}>
        {pending ? <span className="spinner" /> : "Sign in"}
      </button>
    </form>
  );
}
