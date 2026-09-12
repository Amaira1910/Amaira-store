import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { currentAdmin } from "@/lib/admin-session";
import { adminUserCount } from "@/lib/db/auth";
import { STORE } from "@/data/store";

import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await currentAdmin()) redirect("/admin");
  const { next } = await searchParams;
  const noUsers = adminUserCount() === 0;

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <p className="t-caption muted" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {STORE.name} Admin
        </p>
        <h1 className="t-headline" style={{ marginTop: 6, marginBottom: "var(--s-5)" }}>
          Sign in
        </h1>

        {noUsers ? (
          <div className="notice notice-amber">
            <span>
              <strong>No admin account exists yet.</strong> Create one by setting{" "}
              <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> and restarting, or run{" "}
              <code>npm run db:admin -- you@example.com &quot;a long passphrase&quot;</code>.
            </span>
          </div>
        ) : (
          <LoginForm next={next ?? "/admin"} />
        )}

        <p className="t-caption muted" style={{ marginTop: "var(--s-5)" }}>
          <Link href="/">← Back to the shop</Link>
        </p>
      </div>
    </div>
  );
}
