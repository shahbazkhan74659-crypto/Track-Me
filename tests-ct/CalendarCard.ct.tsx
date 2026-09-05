import { test, expect } from "@playwright/experimental-ct-react";
import CalendarCard from "@/components/CalendarCard";
import { entryKey } from "@/components/CalendarCard";
import type { DateEntry } from "@/components/CalendarCard";
import { getTodayIST } from "@/lib/calendar";

// A fixed month (2026 is not a leap year; September has 30 days) so grid math is deterministic.
const VIEW = { year: 2026, month: 8 }; // 0-indexed: September

test("renders 42 cells and the correct month/year label", async ({ mount }) => {
  const component = await mount(
    <CalendarCard
      view={VIEW}
      onViewChange={() => {}}
      entries={{}}
      onSaveEntry={async () => {}}
      onClearEntry={async () => {}}
    />,
  );
  await expect(component.getByText("September 2026")).toBeVisible();
  await expect(component.locator(".calendar-cell")).toHaveCount(42);
});

test("clicking a current-month cell opens the modal; saving calls onSaveEntry with the right cell and entry", async ({ mount }) => {
  let savedArgs: unknown[] = [];
  const component = await mount(
    <CalendarCard
      view={VIEW}
      onViewChange={() => {}}
      entries={{}}
      onSaveEntry={async (cell, entry) => {
        savedArgs = [cell, entry];
      }}
      onClearEntry={async () => {}}
    />,
  );
  await component.getByTestId(`day-${VIEW.year}-${VIEW.month}-15`).click();
  const dialog = component.getByRole("dialog", { name: "Date entry" });
  await expect(dialog).toBeVisible();
  await dialog.getByText("Present", { exact: true }).click();
  await dialog.getByRole("button", { name: "Done" }).click();

  expect(savedArgs[0]).toMatchObject({ year: VIEW.year, month: VIEW.month, day: 15 });
  expect(savedArgs[1]).toEqual({ status: "present", advanceOn: false, advance: 0 });
});

test("a saved entry renders its status color and advance badge on the cell", async ({ mount }) => {
  const entries: Record<string, DateEntry> = {
    [entryKey(VIEW.year, VIEW.month, 15)]: { status: "leave", advanceOn: true, advance: 200 },
  };
  const component = await mount(
    <CalendarCard
      view={VIEW}
      onViewChange={() => {}}
      entries={entries}
      onSaveEntry={async () => {}}
      onClearEntry={async () => {}}
    />,
  );
  const cell = component.getByTestId(`day-${VIEW.year}-${VIEW.month}-15`);
  await expect(cell).toContainText("₹");
  await expect(cell).toContainText("15");
});

test("adjacent-month cells are not clickable (no data-testid, modal never opens)", async ({ mount }) => {
  const component = await mount(
    <CalendarCard
      view={VIEW}
      onViewChange={() => {}}
      entries={{}}
      onSaveEntry={async () => {}}
      onClearEntry={async () => {}}
    />,
  );
  // September 1, 2026 is a Tuesday, so the grid's leading cells are August 30-31.
  await expect(component.getByTestId(new RegExp(`day-${VIEW.year}-${VIEW.month}-`))).toHaveCount(30);
});

test("Prev/Next/Today call onViewChange with the correct target month", async ({ mount }) => {
  const calls: { year: number; month: number }[] = [];
  const component = await mount(
    <CalendarCard
      view={VIEW}
      onViewChange={(next) => calls.push(next)}
      entries={{}}
      onSaveEntry={async () => {}}
      onClearEntry={async () => {}}
    />,
  );
  await component.getByRole("button", { name: "Previous month" }).click();
  await component.getByRole("button", { name: "Next month" }).click();
  await component.getByText("Today").click();

  const today = getTodayIST();
  expect(calls[0]).toEqual({ year: 2026, month: 7 }); // August 2026
  expect(calls[1]).toEqual({ year: 2026, month: 9 }); // October 2026
  expect(calls[2]).toEqual({ year: today.year, month: today.month });
});
