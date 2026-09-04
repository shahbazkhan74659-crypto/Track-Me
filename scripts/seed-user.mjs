// One-off admin utility: creates or resets the app's single login account.
// Usage: node scripts/seed-user.mjs <username> <password>
// There is no signup flow — this script is the only way an account gets created.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = path.join(__dirname, "..", ".env.local");
  const contents = readFileSync(envPath, "utf8");
  const match = contents.match(/^DATABASE_URL=(.*)$/m);
  if (!match) {
    throw new Error("DATABASE_URL not found in .env.local or the environment.");
  }
  return match[1].trim();
}

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: node scripts/seed-user.mjs <username> <password>");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: loadDatabaseUrl() });
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash],
  );

  console.log(`User "${username}" created/updated.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
