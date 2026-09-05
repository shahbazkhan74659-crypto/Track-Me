import { test, expect } from "@playwright/test";
import { loginAsTestUser, getCurrentView, clearMonthEntries } from "./fixtures";

test.describe("Stat cards", () => {
  let year: number;
  let month: number;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    ({ year, month } = await getCurrentView(page));
    await clearMonthEntries(page, year, month);

    await page.getByRole("button", { name: "Salary Setup" }).click();
    await page.getByLabel("Per day salary").fill("800");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("₹800 / day")).toBeVisible();

    // 3 present, 1 half, 1 leave, ₹500 advance — created via the API directly
    // (the UI flow for a single save/clear is already covered by calendar-entries.spec.ts).
    const entries = [
      { day: 1, status: "present", advanceOn: false, advance: 0 },
      { day: 2, status: "present", advanceOn: false, advance: 0 },
      { day: 3, status: "present", advanceOn: false, advance: 0 },
      { day: 4, status: "half", advanceOn: false, advance: 0 },
      { day: 5, status: "leave", advanceOn: true, advance: 500 },
    ];
    for (const entry of entries) {
      const res = await page.request.put("/api/entries", { data: { year, month, ...entry } });
      expect(res.ok()).toBeTruthy();
    }
  });

  test.afterEach(async ({ page }) => {
    await clearMonthEntries(page, year, month);
  });

  test("earned/advance/net match the formula: present*rate + half*rate/2 - advance", async ({ page }) => {
    await page.reload();

    // earned = 3*800 + 1*400 = 2800; advance = 500; net = 2300.
    await expect(page.getByText("₹2,800")).toBeVisible();
    await expect(page.getByText("3 present · 1 half-day · 1 leave")).toBeVisible();
    await expect(page.getByText("₹500", { exact: true })).toBeVisible();
    await expect(page.getByText("₹2,300")).toBeVisible();
  });
});
