import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./fixtures";

test.describe("Mobile layout (Phase 15)", () => {
  test("calendar renders above the stat cards, and the page never scrolls horizontally", async ({ page }) => {
    await loginAsTestUser(page);

    const calendarBox = await page.locator(".calendar-card").boundingBox();
    const statsBox = await page.locator(".stat-cards-grid").boundingBox();
    expect(calendarBox).not.toBeNull();
    expect(statsBox).not.toBeNull();
    // Calendar's top edge must sit above (a smaller y than) the stat cards' top edge.
    expect(calendarBox!.y).toBeLessThan(statsBox!.y);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("chevron buttons meet the mobile touch-target bump", async ({ page }) => {
    await loginAsTestUser(page);
    const box = await page.locator(".chevron-btn").first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });
});
