import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./fixtures";

test.describe("Salary Setup", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("Save is disabled for empty, zero, and negative rates", async ({ page }) => {
    await page.getByRole("button", { name: "Salary Setup" }).click();
    const rateInput = page.getByLabel("Per day salary");
    const saveButton = page.getByRole("button", { name: "Save" });

    // The modal seeds its draft from whatever rate is already saved (non-null after
    // other tests/runs have set one), so start from a known-empty draft explicitly
    // rather than assuming the modal opens blank.
    await rateInput.fill("");
    await expect(saveButton).toBeDisabled();

    await rateInput.fill("0");
    await expect(saveButton).toBeDisabled();

    await rateInput.fill("-50");
    await expect(saveButton).toBeDisabled();

    await rateInput.fill("500");
    await expect(saveButton).toBeEnabled();
  });

  test("saves a rate and it persists across reload", async ({ page }) => {
    await page.getByRole("button", { name: "Salary Setup" }).click();
    await page.getByLabel("Per day salary").fill("777");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("₹777 / day")).toBeVisible();

    await page.reload();
    await expect(page.getByText("₹777 / day")).toBeVisible();
  });
});
