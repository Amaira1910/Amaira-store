/* Server-only helpers for reading the admin session out of the cookie jar. */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type AdminUser, userForToken } from "@/lib/db/auth";

export async function currentAdmin(): Promise<AdminUser | null> {
  const jar = await cookies();
  return userForToken(jar.get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin page. Redirects to the login screen. */
export async function requireAdmin(returnTo = "/admin"): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Owner-only actions (user management, settings). */
export async function requireOwner(returnTo = "/admin"): Promise<AdminUser> {
  const user = await requireAdmin(returnTo);
  if (user.role !== "owner") redirect("/admin?denied=1");
  return user;
}
