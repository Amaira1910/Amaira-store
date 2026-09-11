"use client";

import Link from "next/link";
import { IconCheck } from "@/components/Icons";
import { useCart } from "@/lib/cart";

/** Renders the cart's toast queue. Mounted once, in the root layout. */
export default function ToastHost() {
  const { toasts } = useCart();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <IconCheck size={18} />
          <span className="grow">{t.message}</span>
          {t.href && (
            <Link href={t.href}>{t.linkText ?? "View"}</Link>
          )}
        </div>
      ))}
    </div>
  );
}
