// Full backend end-to-end test suite (Phase 8).
//
// Exercises every API route built in Phases 3-7 against the *running* dev
// server (http://localhost:3000 by default) using plain fetch - not a unit
// test framework, per this project's zero-new-dependency convention (see
// scripts/seed-user.mjs, which this script otherwise mirrors: plain Node
// ESM, CLI-arg credentials, no build step).
//
// Safe to run repeatedly against the REAL database:
//  - All entries-table tests run inside a clearly-fake test year (2099,
//    split across a few months so unrelated tests can't interfere with each
//    other) that can never collide with real attendance data. A pre-flight
//    step wipes any stray rows left behind by a previous interrupted run,
//    and every row this run creates is deleted again in a `finally` block.
//  - The one non-month-scoped mutable value in this app, users.per_day_salary,
//    is captured before any mutation and restored to its exact original
//    value afterward - including a direct Postgres UPDATE fallback for the
//    one case PUT /api/salary cannot express itself (restoring a NULL rate;
//    the route only accepts positive numbers). This mirrors
//    scripts/seed-user.mjs's own direct-Postgres-write pattern, used here
//    ONLY for that single restore case and for the pre-flight fake-year wipe
//    (there is no HTTP route for either operation).
//
// Usage: node scripts/test-backend.mjs <username> <password>
// Requires the dev server to already be running (`npm run dev`).

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// A year that can never collide with real attendance data. Split across
// several months so unrelated test groups (CRUD/validation vs. the
// hand-calculated summary check vs. the adjacent-month leak check) never
// interfere with each other's counts.
const ENTRIES_YEAR = 2099;
const ENTRIES_MONTH = 0; // January (31 days) - CRUD + validation tests
const SHORT_MONTH = 3; // April (30 days) - day-out-of-range validation only
const SUMMARY_MONTH = 6; // July (31 days) - hand-calculated summary check
const ADJACENT_MONTH = 7; // August - adjacent-month leak check

const TEST_SALARY = 700; // distinctive test rate; restored to the real value afterward

// ---------------------------------------------------------------------------
// Tiny assertion / reporting helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function record(name, ok, detail) {
  if (ok) {
    passed += 1;
    console.log(`  [PASS] ${name}`);
  } else {
    failed += 1;
    console.log(`  [FAIL] ${name}${detail ? ` -- ${detail}` : ""}`);
  }
}

function assert(name, condition, detail) {
  record(name, Boolean(condition), detail);
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}

function assertEqual(name, actual, expected) {
  const ok = deepEqual(actual, expected);
  record(
    name,
    ok,
    ok ? undefined : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

function assertStatus(name, response, expectedStatus) {
  record(
    name,
    response.status === expectedStatus,
    response.status === expectedStatus
      ? undefined
      : `expected status ${expectedStatus}, got ${response.status} (body: ${JSON.stringify(response.body)})`,
  );
}

function section(title) {
  console.log(`\n${title}`);
}

// ---------------------------------------------------------------------------
// HTTP + cookie helpers (Node's fetch has no automatic cookie jar - capture
// Set-Cookie manually and re-attach it as a request header ourselves)
// ---------------------------------------------------------------------------

let sessionCookie = null;

function extractSessionCookie(rawResponse) {
  const headers =
    typeof rawResponse.headers.getSetCookie === "function"
      ? rawResponse.headers.getSetCookie()
      : [rawResponse.headers.get("set-cookie")].filter(Boolean);

  for (const header of headers) {
    const match = header.match(/^trackme_session=([^;]+)/);
    if (match) return `trackme_session=${match[1]}`;
  }
  return null;
}

async function call(method, url, body) {
  const headers = { "Content-Type": "application/json" };
  if (sessionCookie) headers.Cookie = sessionCookie;

  const rawResponse = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let json = null;
  try {
    json = await rawResponse.json();
  } catch {
    json = null;
  }

  return { status: rawResponse.status, body: json, raw: rawResponse };
}

const get = (url) => call("GET", url);
const put = (url, body) => call("PUT", url, body);
const del = (url, body) => call("DELETE", url, body);
const post = (url, body) => call("POST", url, body);

// ---------------------------------------------------------------------------
// Direct-Postgres fallback (mirrors scripts/seed-user.mjs). Used ONLY for two
// operations the HTTP API has no way to perform at all:
//   1. Restoring users.per_day_salary to NULL (PUT /api/salary only accepts
//      positive numbers - it cannot express "clear the rate").
//   2. A pre-flight wipe of any stray fake-test-year rows left behind by a
//      previous interrupted run (there is no "wipe a whole month/year" API
//      route - only single-day DELETE).
// Every other read/write in this script goes through the HTTP API, on purpose.
// ---------------------------------------------------------------------------

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.join(__dirname, "..", ".env.local");
  const contents = readFileSync(envPath, "utf8");
  const match = contents.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error("DATABASE_URL not found in .env.local or the environment.");
  return match[1].trim();
}

async function withPool(fn) {
  const pool = new pg.Pool({ connectionString: loadDatabaseUrl() });
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

async function wipeTestYearEntries(username) {
  await withPool((pool) =>
    pool.query(
      `DELETE FROM entries
       WHERE year = $1
         AND user_id = (SELECT id FROM users WHERE username = $2)`,
      [ENTRIES_YEAR, username],
    ),
  );
}

async function restoreSalaryToNull(username) {
  await withPool((pool) =>
    pool.query("UPDATE users SET per_day_salary = NULL WHERE username = $1", [username]),
  );
}

// ---------------------------------------------------------------------------
// Test sections
// ---------------------------------------------------------------------------

async function testLoggedOut401s() {
  section("Unauthenticated access (all protected routes reject with 401)");

  assertStatus("GET /api/salary -> 401", await get("/api/salary"), 401);
  assertStatus("PUT /api/salary -> 401", await put("/api/salary", { perDaySalary: 100 }), 401);
  assertStatus("GET /api/calendar -> 401", await get("/api/calendar"), 401);
  assertStatus(
    "GET /api/entries -> 401",
    await get(`/api/entries?year=${ENTRIES_YEAR}&month=${ENTRIES_MONTH}`),
    401,
  );
  assertStatus(
    "PUT /api/entries -> 401",
    await put("/api/entries", {
      year: ENTRIES_YEAR,
      month: ENTRIES_MONTH,
      day: 1,
      status: "present",
      advanceOn: false,
    }),
    401,
  );
  assertStatus(
    "DELETE /api/entries -> 401",
    await del("/api/entries", { year: ENTRIES_YEAR, month: ENTRIES_MONTH, day: 1 }),
    401,
  );
  assertStatus("GET /api/summary -> 401", await get("/api/summary"), 401);
}

async function login(username, password) {
  section("Login (Phase 3)");

  const wrong = await call("POST", "/api/auth/login", { username, password: `${password}-wrong` });
  assertStatus("wrong password -> 401", wrong, 401);
  assert(
    "wrong password -> generic error message present",
    typeof wrong.body?.error === "string" && wrong.body.error.length > 0,
    JSON.stringify(wrong.body),
  );

  const good = await call("POST", "/api/auth/login", { username, password });
  assertStatus("correct login -> 200", good, 200);
  const cookie = extractSessionCookie(good.raw);
  assert("correct login sets a trackme_session cookie", Boolean(cookie), "no Set-Cookie header found");
  sessionCookie = cookie;

  const session = await get("/api/auth/session");
  assertStatus("GET /api/auth/session (authenticated) -> 200", session, 200);
  assertEqual("session reports authenticated: true with the correct username", session.body, {
    authenticated: true,
    username,
  });
}

async function logout() {
  section("Logout (Phase 3)");
  const oldCookie = sessionCookie;

  const response = await post("/api/auth/logout");
  assertStatus("POST /api/auth/logout -> 200", response, 200);

  sessionCookie = null;
  const session = await get("/api/auth/session");
  assertStatus("GET /api/auth/session (after logout) -> 200", session, 200);
  assertEqual("session reports authenticated: false after logout", session.body, {
    authenticated: false,
  });

  // Re-attach the OLD cookie value manually (a real browser would have
  // dropped it after the Set-Cookie-delete response, but this proves the
  // session row was actually deleted server-side, not just cleared client-side).
  sessionCookie = oldCookie;
  const protectedCall = await get("/api/salary");
  assertStatus(
    "GET /api/salary -> 401 after logout (old cookie rejected server-side)",
    protectedCall,
    401,
  );
  sessionCookie = null;
}

async function testCalendar() {
  section("Calendar (Phase 5)");

  assertStatus("year without month -> 400", await get(`/api/calendar?year=${ENTRIES_YEAR}`), 400);
  assertStatus("month without year -> 400", await get("/api/calendar?month=0"), 400);
  assertStatus("non-integer year/month -> 400", await get("/api/calendar?year=abc&month=0"), 400);
  assertStatus("year out of range -> 400", await get("/api/calendar?year=1899&month=0"), 400);

  const noParams = await get("/api/calendar");
  assertStatus("no params -> 200 (defaults to current month)", noParams, 200);
  assertEqual("defaults requested month to current IST month", noParams.body?.requested, {
    year: noParams.body?.today?.year,
    month: noParams.body?.today?.month,
  });

  const today = noParams.body?.today;
  assert(
    "today shape sanity check (year/month/day/weekday are plausible integers)",
    Number.isInteger(today?.year) &&
      today.year > 1900 &&
      today.year < 2200 &&
      Number.isInteger(today.month) &&
      today.month >= 0 &&
      today.month <= 11 &&
      Number.isInteger(today.day) &&
      today.day >= 1 &&
      today.day <= 31 &&
      Number.isInteger(today.weekday) &&
      today.weekday >= 0 &&
      today.weekday <= 6,
    JSON.stringify(today),
  );

  const leapFeb = await get("/api/calendar?year=2028&month=1");
  assertStatus("leap-year Feb 2028 (year=2028,month=1) -> 200", leapFeb, 200);
  assert("42 cells always", leapFeb.body?.cells?.length === 42, `got ${leapFeb.body?.cells?.length}`);
  const leapCount = leapFeb.body?.cells?.filter((c) => c.isCurrentMonth).length;
  assert("leap-year Feb 2028 has exactly 29 isCurrentMonth cells", leapCount === 29, `got ${leapCount}`);

  const nonLeapFeb = await get("/api/calendar?year=2026&month=1");
  assertStatus("non-leap Feb 2026 (year=2026,month=1) -> 200", nonLeapFeb, 200);
  assert(
    "42 cells always (non-leap)",
    nonLeapFeb.body?.cells?.length === 42,
    `got ${nonLeapFeb.body?.cells?.length}`,
  );
  const nonLeapCount = nonLeapFeb.body?.cells?.filter((c) => c.isCurrentMonth).length;
  assert(
    "non-leap Feb 2026 has exactly 28 isCurrentMonth cells",
    nonLeapCount === 28,
    `got ${nonLeapCount}`,
  );
}

// undefined = not yet captured; the captured value may itself legitimately be null
let capturedOriginalSalary;

async function testSalary() {
  section("Salary Setup (Phase 4)");

  const before = await get("/api/salary");
  assertStatus("GET /api/salary -> 200", before, 200);
  if (before.status !== 200) {
    throw new Error(
      "Could not read the real per-day salary before testing - aborting without making any changes.",
    );
  }
  capturedOriginalSalary = before.body?.perDaySalary ?? null;
  console.log(`  (captured real per-day salary before testing: ${JSON.stringify(capturedOriginalSalary)})`);

  assertStatus("PUT perDaySalary: 0 -> 400", await put("/api/salary", { perDaySalary: 0 }), 400);
  assertStatus("PUT perDaySalary: -5 -> 400", await put("/api/salary", { perDaySalary: -5 }), 400);
  assertStatus("PUT perDaySalary: 'abc' -> 400", await put("/api/salary", { perDaySalary: "abc" }), 400);
  assertStatus("PUT missing perDaySalary -> 400", await put("/api/salary", {}), 400);

  const setResponse = await put("/api/salary", { perDaySalary: TEST_SALARY });
  assertStatus(`PUT perDaySalary: ${TEST_SALARY} -> 200`, setResponse, 200);
  assertEqual("PUT response reflects the new rate", setResponse.body, { perDaySalary: TEST_SALARY });

  const after = await get("/api/salary");
  assertStatus("GET /api/salary after PUT -> 200", after, 200);
  assertEqual("GET reflects the persisted test rate", after.body, { perDaySalary: TEST_SALARY });
}

async function restoreSalary(username) {
  if (capturedOriginalSalary === undefined) {
    console.log("\n(Skipping salary restore - the original value was never captured, so nothing was changed.)");
    return;
  }

  section("Restoring the real per-day salary");
  try {
    if (capturedOriginalSalary === null) {
      // PUT /api/salary only accepts positive numbers - it has no way to
      // express "clear the rate" - so restoring a NULL original value must
      // go directly to Postgres, exactly like scripts/seed-user.mjs does
      // for its own single write.
      await restoreSalaryToNull(username);
      console.log("  Restored per_day_salary to NULL via a direct Postgres UPDATE (the API cannot express NULL).");
    } else {
      const response = await put("/api/salary", { perDaySalary: capturedOriginalSalary });
      if (response.status !== 200) {
        throw new Error(
          `restore PUT failed with status ${response.status}: ${JSON.stringify(response.body)}`,
        );
      }
      console.log(`  Restored per_day_salary to ${capturedOriginalSalary} via PUT /api/salary.`);
    }

    const check = await get("/api/salary");
    assertEqual("real per-day salary restored exactly", check.body, {
      perDaySalary: capturedOriginalSalary,
    });
  } catch (error) {
    failed += 1;
    console.error("  [FAIL] CRITICAL: could not automatically restore the real per-day salary.");
    console.error(`         Original value was: ${JSON.stringify(capturedOriginalSalary)}`);
    console.error(`         Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error("         Restore it manually before trusting this account's data again.");
  }
}

const createdEntries = []; // {year, month, day} - deleted again in cleanupEntries()

function trackEntry(year, month, day) {
  createdEntries.push({ year, month, day });
}

async function testEntries() {
  section("Entries CRUD + validation (Phase 6)");

  // Present-only, no advance - must round-trip with advanceOn:false, advance:0.
  const day10 = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 10,
    status: "present",
    advanceOn: false,
  });
  assertStatus("PUT present-only entry -> 200", day10, 200);
  trackEntry(ENTRIES_YEAR, ENTRIES_MONTH, 10);
  assertEqual("present-only entry round-trips with advanceOn:false, advance:0", day10.body, {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 10,
    status: "present",
    advanceOn: false,
    advance: 0,
  });

  // advanceOn:true, advance:0 - must NOT collapse to advanceOn:false (regression case).
  const day11 = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 11,
    status: "present",
    advanceOn: true,
    advance: 0,
  });
  assertStatus("PUT entry with advanceOn:true, advance:0 -> 200", day11, 200);
  trackEntry(ENTRIES_YEAR, ENTRIES_MONTH, 11);
  assertEqual(
    "advanceOn:true + advance:0 round-trips WITHOUT collapsing to advanceOn:false",
    day11.body,
    { year: ENTRIES_YEAR, month: ENTRIES_MONTH, day: 11, status: "present", advanceOn: true, advance: 0 },
  );

  assertStatus(
    "PUT invalid status -> 400",
    await put("/api/entries", {
      year: ENTRIES_YEAR,
      month: ENTRIES_MONTH,
      day: 12,
      status: "vacation",
      advanceOn: false,
    }),
    400,
  );
  assertStatus(
    "PUT missing status -> 400",
    await put("/api/entries", { year: ENTRIES_YEAR, month: ENTRIES_MONTH, day: 12, advanceOn: false }),
    400,
  );

  // Day beyond the real month length (April 2099 has 30 days).
  const outOfRange = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: SHORT_MONTH,
    day: 31,
    status: "present",
    advanceOn: false,
  });
  assertStatus("PUT day 31 in a 30-day month -> 400", outOfRange, 400);
  assertEqual("400 error message names the correct max day for that month", outOfRange.body, {
    error: "day must be between 1 and 30 for the given year/month.",
  });

  assertStatus(
    "PUT non-boolean advanceOn -> 400",
    await put("/api/entries", {
      year: ENTRIES_YEAR,
      month: ENTRIES_MONTH,
      day: 13,
      status: "present",
      advanceOn: "yes",
    }),
    400,
  );
  assertStatus(
    "PUT negative advance with advanceOn:true -> 400",
    await put("/api/entries", {
      year: ENTRIES_YEAR,
      month: ENTRIES_MONTH,
      day: 13,
      status: "present",
      advanceOn: true,
      advance: -5,
    }),
    400,
  );
  assertStatus(
    "PUT non-numeric advance with advanceOn:true -> 400",
    await put("/api/entries", {
      year: ENTRIES_YEAR,
      month: ENTRIES_MONTH,
      day: 13,
      status: "present",
      advanceOn: true,
      advance: "lots",
    }),
    400,
  );

  // Upsert: create then update the same date in place.
  const created = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 14,
    status: "half",
    advanceOn: false,
  });
  assertStatus("PUT new entry (day 14) -> 200", created, 200);
  trackEntry(ENTRIES_YEAR, ENTRIES_MONTH, 14);

  const updated = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 14,
    status: "present",
    advanceOn: true,
    advance: 250,
  });
  assertStatus("PUT existing entry (day 14) upserts -> 200", updated, 200);
  assertEqual("upsert changed the entry in place", updated.body, {
    year: ENTRIES_YEAR,
    month: ENTRIES_MONTH,
    day: 14,
    status: "present",
    advanceOn: true,
    advance: 250,
  });

  // GET lists exactly what was created, nothing extra.
  const listing = await get(`/api/entries?year=${ENTRIES_YEAR}&month=${ENTRIES_MONTH}`);
  assertStatus("GET entries for the test month -> 200", listing, 200);
  assertEqual(
    "GET lists exactly the entries created (days 10, 11, 14), nothing extra",
    listing.body?.entries,
    [
      { day: 10, status: "present", advanceOn: false, advance: 0 },
      { day: 11, status: "present", advanceOn: true, advance: 0 },
      { day: 14, status: "present", advanceOn: true, advance: 250 },
    ],
  );

  // Delete one, confirm gone.
  const deleted = await del("/api/entries", { year: ENTRIES_YEAR, month: ENTRIES_MONTH, day: 10 });
  assertStatus("DELETE day 10 -> 200", deleted, 200);

  const afterDelete = await get(`/api/entries?year=${ENTRIES_YEAR}&month=${ENTRIES_MONTH}`);
  assertEqual("day 10 is gone after DELETE, days 11 and 14 remain", afterDelete.body?.entries, [
    { day: 11, status: "present", advanceOn: true, advance: 0 },
    { day: 14, status: "present", advanceOn: true, advance: 250 },
  ]);

  // Idempotent delete.
  const deletedAgain = await del("/api/entries", { year: ENTRIES_YEAR, month: ENTRIES_MONTH, day: 10 });
  assertStatus("DELETE an already-gone entry -> still 200 (idempotent)", deletedAgain, 200);
}

async function testSummary() {
  section("Summary (Phase 7)");

  assertStatus("year without month -> 400", await get(`/api/summary?year=${ENTRIES_YEAR}`), 400);
  assertStatus("month without year -> 400", await get("/api/summary?month=0"), 400);
  assertStatus("non-integer year/month -> 400", await get("/api/summary?year=abc&month=0"), 400);
  assertStatus("year out of range -> 400", await get("/api/summary?year=1899&month=0"), 400);

  // Known set in SUMMARY_MONTH: 3 present (one with a ₹500 advance), 2 half, 1 leave.
  const summaryEntries = [
    { day: 1, status: "present", advanceOn: true, advance: 500 },
    { day: 2, status: "present", advanceOn: false },
    { day: 3, status: "present", advanceOn: false },
    { day: 4, status: "half", advanceOn: false },
    { day: 5, status: "half", advanceOn: false },
    { day: 6, status: "leave", advanceOn: false },
  ];
  for (const entry of summaryEntries) {
    const response = await put("/api/entries", { year: ENTRIES_YEAR, month: SUMMARY_MONTH, ...entry });
    assertStatus(`seed summary entry day ${entry.day} -> 200`, response, 200);
    trackEntry(ENTRIES_YEAR, SUMMARY_MONTH, entry.day);
  }

  // One entry in the adjacent month, with a large distinctive advance - must
  // never leak into SUMMARY_MONTH's totals.
  const adjacentResponse = await put("/api/entries", {
    year: ENTRIES_YEAR,
    month: ADJACENT_MONTH,
    day: 1,
    status: "present",
    advanceOn: true,
    advance: 9999,
  });
  assertStatus("seed adjacent-month entry -> 200", adjacentResponse, 200);
  trackEntry(ENTRIES_YEAR, ADJACENT_MONTH, 1);

  const summary = await get(`/api/summary?year=${ENTRIES_YEAR}&month=${SUMMARY_MONTH}`);
  assertStatus("GET /api/summary for the test month -> 200", summary, 200);

  // Hand-calculated expectation with TEST_SALARY=700:
  //   earned = 3*700 + 2*(700/2) = 2100 + 700 = 2800
  //   netPayable = 2800 - 500 = 2300
  assertEqual("summary totals match the hand-calculated expectation exactly", summary.body, {
    year: ENTRIES_YEAR,
    month: SUMMARY_MONTH,
    perDaySalary: TEST_SALARY,
    presentDays: 3,
    halfDays: 2,
    leaveDays: 1,
    advanceTaken: 500,
    earned: 2800,
    netPayable: 2300,
  });

  assert(
    "the adjacent month's ₹9999 advance did not leak into this month's advanceTaken",
    summary.body?.advanceTaken === 500,
    `got advanceTaken=${summary.body?.advanceTaken}`,
  );
}

async function cleanupEntries() {
  section("Cleaning up test entries");
  for (const { year, month, day } of createdEntries) {
    try {
      const response = await del("/api/entries", { year, month, day });
      if (response.status !== 200) {
        failed += 1;
        console.error(
          `  [FAIL] CRITICAL: failed to delete test entry ${year}-${month}-${day} (status ${response.status}).`,
        );
      }
    } catch (error) {
      failed += 1;
      console.error(
        `  [FAIL] CRITICAL: error deleting test entry ${year}-${month}-${day}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  console.log(
    `  Deleted ${createdEntries.length} test entr${createdEntries.length === 1 ? "y" : "ies"} from year ${ENTRIES_YEAR}.`,
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: node scripts/test-backend.mjs <username> <password>");
    process.exit(1);
  }

  console.log(`Testing against ${BASE_URL} as "${username}"...`);

  console.log(`\nPre-flight: wiping any stray fake-test-year (${ENTRIES_YEAR}) rows from a previous run...`);
  await wipeTestYearEntries(username);

  await testLoggedOut401s();
  await login(username, password);

  try {
    await testCalendar();
    await testSalary();
    await testEntries();
    await testSummary();
  } finally {
    // Cleanup runs here, while still authenticated - both PUT /api/salary
    // (restoring a non-null rate) and DELETE /api/entries require a valid
    // session, so this MUST happen before logout below.
    await cleanupEntries();
    await restoreSalary(username);
  }

  await logout();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("\nTest run crashed unexpectedly:");
  console.error(error);
  process.exit(1);
});
