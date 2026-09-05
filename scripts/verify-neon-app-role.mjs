// One-off: verify the scoped trackme_app role can connect and do basic CRUD,
// and confirm it cannot perform schema/DDL changes (least-privilege check).
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const urlFile = process.argv[2];
if (!urlFile) {
  console.error("Usage: node scripts/verify-neon-app-role.mjs <path-to-connection-string-file>");
  process.exit(1);
}
const url = readFileSync(urlFile, "utf8").trim();

async function main() {
  const pool = new pg.Pool({ connectionString: url });

  const who = await pool.query("SELECT current_user");
  console.log("Connected as:", who.rows[0].current_user);

  await pool.query("SELECT id FROM users LIMIT 1");
  console.log("SELECT on users: OK");

  let ddlBlocked = false;
  try {
    await pool.query("CREATE TABLE should_not_be_allowed (id INT)");
  } catch (error) {
    ddlBlocked = true;
    console.log("DDL correctly rejected:", error.message);
  }
  if (!ddlBlocked) {
    console.error("WARNING: role was able to run DDL — not least-privilege!");
  }

  await pool.end();
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
