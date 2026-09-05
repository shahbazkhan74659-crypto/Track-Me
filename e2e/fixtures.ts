import type { Page } from "@playwright/test";

export const TEST_USERNAME = process.env.E2E_USERNAME ?? "";
export const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "";

if (!TEST_USERNAME || !TEST_PASSWORD) {
  throw new Error(
    "E2E_USERNAME/E2E_PASSWORD not set — check .env.test.local exists and playwright.config.ts loads it.",
  );
}

export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Username").fill(TEST_USERNAME);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Salary Setup" }).waitFor();
}

export async function logout(page: Page): Promise<void> {
  await page.getByText("Log out").click();
  await page.getByLabel("Username").waitFor();
}

/** Clears every entry the test account currently has in the given month, via the real API (fast, no UI clicking). */
export async function clearMonthEntries(page: Page, year: number, month: number): Promise<void> {
  const res = await page.request.get(`/api/entries?year=${year}&month=${month}`);
  if (!res.ok()) return;
  const data = (await res.json()) as { entries: { day: number }[] };
  for (const entry of data.entries) {
    await page.request.delete("/api/entries", {
      data: { year, month, day: entry.day },
    });
  }
}

/** The server's current Asia/Kolkata year/month — same defaulting every date-scoped route uses. */
export async function getCurrentView(page: Page): Promise<{ year: number; month: number }> {
  const res = await page.request.get("/api/entries");
  const data = (await res.json()) as { year: number; month: number };
  return { year: data.year, month: data.month };
}
