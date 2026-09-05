import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const [pwFile, outFile] = process.argv.slice(2);
if (!pwFile || !outFile) {
  console.error("Usage: node scripts/build-app-url.mjs <password-file> <output-file>");
  process.exit(1);
}

const contents = readFileSync(path.join(repoRoot, ".env.production.local"), "utf8");
const match = contents.match(/^DATABASE_URL=(.*)$/m);
const current = new URL(match[1].trim());
const pw = readFileSync(pwFile, "utf8").trim();

current.username = "trackme_app";
current.password = pw;

writeFileSync(outFile, current.toString());
console.log("written to", outFile);
