"use client";

import { useState } from "react";
import { IconAlert, IconChat, IconCheck, IconPhone } from "@/components/Icons";

type Kind = "general" | "business" | "service";

const SUBJECTS: Record<Kind, string[]> = {
  general: ["A question about a product", "Stock and availability", "An existing order", "Something else"],
  business: ["Bulk hardware quote", "GST invoicing", "Deployment and MDM", "Ongoing support"],
  service: ["Repair or diagnostics", "Battery replacement", "Data transfer", "AppleCare+"],
};

export default function ContactForm({
  kind = "general",
  phone,
  phoneHref,
  email,
  whatsappHref,
}: {
  kind?: Kind;
  phone: string;
  phoneHref: string;
  email: string;
  whatsappHref?: string;
}) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", subject: SUBJECTS[kind][0], message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  /* Editing a field clears its error, so a corrected value stops looking wrong. */
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) errs.phone = "Enter a 10-digit Indian mobile number.";
    if (form.message.trim().length < 10) errs.message = "A sentence or two helps us answer properly.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind }),
      });
      const data = await res.json();
      if (res.ok && data.ok) setState("sent");
      else { setState("error"); setServerError(data.error ?? "We could not send that."); }
    } catch {
      setState("error");
      setServerError("We could not reach our server.");
    }
  }

  if (state === "sent") {
    return (
      <div className="notice" style={{ background: "rgba(0,128,9,0.07)", color: "#0a5c12", alignItems: "center" }}>
        <IconCheck size={20} />
        <span>
          <strong>Thank you — we have your message.</strong> We reply within one working day, usually
          much sooner. If it is urgent, call <a href={phoneHref}>{phone}</a>.
        </span>
      </div>
    );
  }

  const field = (
    name: keyof typeof form,
    label: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <label className={`field${errors[name] ? " has-error" : ""}`}>
      <input
        className="field-input"
        type={type}
        value={form[name]}
        onChange={set(name)}
        placeholder=" "
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[name])}
      />
      <span className="field-label">{label}</span>
      {errors[name] && <span className="field-error"><IconAlert size={14} /> {errors[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div className="fieldset-grid fieldset-grid-2">
        {field("name", "Your name", "text", "name")}
        {field("phone", "Mobile number", "tel", "tel")}
      </div>
      {field("email", "Email", "email", "email")}
      {kind === "business" && field("company", "Company (optional)", "text", "organization")}

      <label className="field field-select">
        <select className="field-input" value={form.subject} onChange={set("subject")}>
          {SUBJECTS[kind].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="field-label" style={{ transform: "translateY(-9px) scale(0.75)" }}>What is it about?</span>
      </label>

      <label className={`field${errors.message ? " has-error" : ""}`}>
        <textarea
          className="field-input"
          rows={5}
          value={form.message}
          onChange={set("message")}
          placeholder=" "
          aria-invalid={Boolean(errors.message)}
        />
        <span className="field-label">Your message</span>
        {errors.message && <span className="field-error"><IconAlert size={14} /> {errors.message}</span>}
      </label>

      {state === "error" && (
        <div className="notice notice-red" style={{ marginTop: "var(--s-4)" }}>
          <IconAlert size={18} />
          <span>
            {serverError} Please call <a href={phoneHref}>{phone}</a> or email{" "}
            <a href={`mailto:${email}`}>{email}</a> instead.
          </span>
        </div>
      )}

      <div className="row-wrap" style={{ marginTop: "var(--s-5)" }}>
        <button type="submit" className="btn" disabled={state === "sending"}>
          {state === "sending" ? (<><span className="spinner" /> Sending…</>) : "Send message"}
        </button>
        <a href={phoneHref} className="btn btn-secondary"><IconPhone size={17} /> {phone}</a>
        {whatsappHref && (
          <a href={whatsappHref} className="link-cta" target="_blank" rel="noopener noreferrer">
            <IconChat size={16} /> WhatsApp us instead
          </a>
        )}
      </div>

      <p className="t-caption muted" style={{ marginTop: "var(--s-4)" }}>
        We use your details only to answer this enquiry. We do not add you to a mailing list.
      </p>
    </form>
  );
}
