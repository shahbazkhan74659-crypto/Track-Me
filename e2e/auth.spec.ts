import { test, expect } from "@playwright/test";
import { TEST_USERNAME, TEST_PASSWORD, loginAsTestUser, logout } from "./fixtures";

test.describe("Authentication", () => {
  test("shows the login gate when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("rejects invalid credentials with a visible error, no session set", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill(TEST_USERNAME);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
    // Still on the login gate, not the authenticated app.
    await expect(page.getByLabel("Username")).toBeVisible();
  });

  test("unauthenticated API requests are rejected with 401", async ({ request }) => {
    const res = await request.get("/api/salary");
    expect(res.status()).toBe(401);
  });

  test("logs in, reaches the authenticated app, and logs back out", async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page.getByRole("button", { name: "Salary Setup" })).toBeVisible();
    await expect(page.getByText(TEST_USERNAME)).toBeVisible();

    await logout(page);
    await expect(page.getByLabel("Username")).toBeVisible();

    // Session cookie is really gone server-side too, not just hidden client-side.
    const res = await page.request.get("/api/salary");
    expect(res.status()).toBe(401);
  });
});
