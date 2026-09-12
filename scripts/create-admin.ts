/* Creates an admin user.
   Usage:  npm run db:admin -- owner@amairastore.in "A long passphrase" "Ravi" owner */
import { getDb, closeDb } from "../lib/db/client";
import { createAdminUser, listAdminUsers } from "../lib/db/auth";

const [email, password, name = "Owner", role = "owner"] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run db:admin -- <email> <password> [name] [owner|manager|staff]');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Choose a password of at least 10 characters.");
  process.exit(1);
}

getDb();
const user = createAdminUser({ email, password, name, role: role as "owner" | "manager" | "staff" });
console.log(`Created ${user.email} (${user.role}).`);
console.log("Existing users:", listAdminUsers().map((u) => `${u.email} [${u.role}]`).join(", "));
closeDb();
