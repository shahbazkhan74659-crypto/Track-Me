import { test, expect } from "@playwright/test";
import { loginAsTestUser, getCurrentView, clearMonthEntries } from "./fixtures";

const DAY = 10; // exists in every month; arbitrary, not "today" specifically.

test.describe("Calendar date entry", () => {
  let year: number;
  let month: number;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    ({ year, month } = await getCurrentView(page));
    await clearMonthEntries(page, year, month);
    await page.reload();
  });

  test.afterEach(async ({ page }) => {
    await clearMonthEntries(page, year, month);
  });

  test("saving a status colors the cell and persists after reload", async ({ page }) => {
    await page.getByTestId(`day-${year}-${month}-${DAY}`).click();
    const dialog = page.getByRole("dialog", { name: "Date entry" });
    await dialog.getByText("Present", { exact: true }).click();
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    const res = await page.request.get(`/api/entries?year=${year}&month=${month}`);
    const data = (await res.json()) as { entries: { day: number; status: string }[] };
    expect(data.entries).toContainEqual(expect.objectContaining({ day: DAY, status: "present" }));
  });

  test("a ₹0 advance still counts as taken, not collapsed to false", async ({ page }) => {
    await page.getByTestId(`day-${year}-${month}-${DAY}`).click();
    const dialog = page.getByRole("dialog", { name: "Date entry" });
    await dialog.getByText("Half-Day", { exact: true }).click();
    await dialog.getByLabel("Advance Salary").check();
    // Leave the amount blank — a blank amount must still save as advance:0, advanceOn:true.
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).toBeHidden();

    const res = await page.request.get(`/api/entries?year=${year}&month=${month}`);
    const data = (await res.json()) as {
      entries: { day: number; status: string; advanceOn: boolean; advance: number }[];
    };
    expect(data.entries).toContainEqual(
      expect.objectContaining({ day: DAY, status: "half", advanceOn: true, advance: 0 }),
    );
  });

  test("clearing an entry removes it", async ({ page }) => {
    await page.getByTestId(`day-${year}-${month}-${DAY}`).click();
    let dialog = page.getByRole("dialog", { name: "Date entry" });
    await dialog.getByText("Leave", { exact: true }).click();
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).toBeHidden();

    await page.getByTestId(`day-${year}-${month}-${DAY}`).click();
    dialog = page.getByRole("dialog", { name: "Date entry" });
    await dialog.getByText("Clear", { exact: true }).click();
    await expect(dialog).toBeHidden();

    const res = await page.request.get(`/api/entries?year=${year}&month=${month}`);
    const data = (await res.json()) as { entries: { day: number }[] };
    expect(data.entries.find((e) => e.day === DAY)).toBeUndefined();
  });
});
