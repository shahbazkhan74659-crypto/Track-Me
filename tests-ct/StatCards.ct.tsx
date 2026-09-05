import { test, expect } from "@playwright/experimental-ct-react";
import StatCards, { type SummaryData } from "@/components/StatCards";

test("shows the placeholder state when no rate is set", async ({ mount }) => {
  const summary: SummaryData = {
    perDaySalary: null,
    presentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    advanceTaken: 0,
    earned: null,
    netPayable: null,
  };
  const component = await mount(<StatCards summary={summary} />);
  await expect(component.getByText("Set a rate to see earnings")).toHaveCount(2);
  await expect(component.getByText("No advances taken")).toBeVisible();
});

test("formats real earned/advance/net figures and the present/half-day/leave subtext", async ({ mount }) => {
  const summary: SummaryData = {
    perDaySalary: 800,
    presentDays: 3,
    halfDays: 1,
    leaveDays: 1,
    advanceTaken: 500,
    earned: 2800,
    netPayable: 2300,
  };
  const component = await mount(<StatCards summary={summary} />);
  await expect(component.getByText("₹2,800")).toBeVisible();
  await expect(component.getByText("3 present · 1 half-day · 1 leave")).toBeVisible();
  await expect(component.getByText("₹500", { exact: true })).toBeVisible();
  await expect(component.getByText("Deducted from this month")).toBeVisible();
  await expect(component.getByText("₹2,300")).toBeVisible();
});

test("renders a loading/unset state (summary=null) identically to the placeholder", async ({ mount }) => {
  const component = await mount(<StatCards summary={null} />);
  await expect(component.getByText("Set a rate to see earnings")).toHaveCount(2);
});
