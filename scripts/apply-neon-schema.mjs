// One-off: verify connectivity to the Neon production database and apply db/schema.sql.
// Usage: node scripts/apply-neon-schema.mjs
// Reads DATABASE_URL from .env.production.local (gitignored). Not part of the app runtime.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

function loadDatabaseUrl() {
  const envPath = path.join(repoRoot, ".env.production.local");
  const contents = readFileSync(envPath, "utf8");
  const match = contents.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error("DATABASE_URL not found in .env.production.local");
  return match[1].trim();
}

async function main() {
  const pool = new pg.Pool({ connectionString: loadDatabaseUrl() });

  const version = await pool.query("SELECT version()");
  console.log("Connected. Server:", version.rows[0].version.split(",")[0]);

  const schemaSql = readFileSync(path.join(repoRoot, "db", "schema.sql"), "utf8");
  await pool.query(schemaSql);
  console.log("Schema applied (or already present).");

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables in public schema:", tables.rows.map((r) => r.table_name).join(", "));

  await pool.end();
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
