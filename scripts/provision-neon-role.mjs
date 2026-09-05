// One-off: create the scoped, least-privilege `trackme_app` role on the Neon production
// database, matching the local-dev role from Phase 3 (see DECISIONS.md). Must be run with
// the Neon owner/admin connection string (passed via NEON_ADMIN_URL env var, not stored).
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

function loadAdminUrl() {
  const envPath = path.join(repoRoot, ".env.production.local");
  const contents = readFileSync(envPath, "utf8");
  const match = contents.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error("DATABASE_URL not found in .env.production.local");
  return match[1].trim();
}

const adminUrl = loadAdminUrl();
const pwFile = process.argv[2];
if (!pwFile) {
  console.error("Usage: node scripts/provision-neon-role.mjs <path-to-password-file>");
  process.exit(1);
}
const appPassword = readFileSync(pwFile, "utf8").trim();

async function main() {
  const admin = new pg.Pool({ connectionString: adminUrl });

  const exists = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = 'trackme_app'");
  if (exists.rowCount === 0) {
    await admin.query(`CREATE ROLE trackme_app WITH LOGIN PASSWORD '${appPassword}'`);
    console.log("Created role trackme_app.");
  } else {
    await admin.query(`ALTER ROLE trackme_app WITH LOGIN PASSWORD '${appPassword}'`);
    console.log("Role trackme_app already existed; password reset.");
  }

  await admin.query("GRANT CONNECT ON DATABASE neondb TO trackme_app");
  await admin.query("GRANT USAGE ON SCHEMA public TO trackme_app");
  await admin.query("GRANT SELECT, INSERT, UPDATE, DELETE ON users, sessions, entries TO trackme_app");
  await admin.query("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO trackme_app");
  console.log("Grants applied: CONNECT + CRUD on users/sessions/entries, sequence usage.");

  await admin.end();
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
