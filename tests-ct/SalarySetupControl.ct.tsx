import { test, expect } from "@playwright/experimental-ct-react";
import SalarySetupControl from "@/components/SalarySetupControl";

test("shows 'Not set' when no rate is configured", async ({ mount }) => {
  const component = await mount(<SalarySetupControl perDaySalary={null} onSave={async () => {}} />);
  await expect(component.getByText("Not set")).toBeVisible();
});

test("shows the formatted rate when one is set", async ({ mount }) => {
  const component = await mount(<SalarySetupControl perDaySalary={650} onSave={async () => {}} />);
  await expect(component.getByText("₹650 / day")).toBeVisible();
});

test("Save is disabled for empty/zero/negative input and enabled for a positive number", async ({ mount }) => {
  const component = await mount(<SalarySetupControl perDaySalary={null} onSave={async () => {}} />);
  await component.getByRole("button", { name: "Salary Setup" }).click();
  const input = component.getByLabel("Per day salary");
  const save = component.getByRole("button", { name: "Save" });

  await expect(save).toBeDisabled();
  await input.fill("0");
  await expect(save).toBeDisabled();
  await input.fill("-10");
  await expect(save).toBeDisabled();
  await input.fill("500");
  await expect(save).toBeEnabled();
});

test("calls onSave with the parsed number and shows a thrown error message", async ({ mount }) => {
  let received: number | null = null;
  const component = await mount(
    <SalarySetupControl
      perDaySalary={null}
      onSave={async (rate) => {
        received = rate;
        throw new Error("Server rejected it.");
      }}
    />,
  );
  await component.getByRole("button", { name: "Salary Setup" }).click();
  await component.getByLabel("Per day salary").fill("900");
  await component.getByRole("button", { name: "Save" }).click();

  await expect(component.getByText("Server rejected it.")).toBeVisible();
  expect(received).toBe(900);
});

test("Cancel closes the modal without calling onSave", async ({ mount }) => {
  let called = false;
  const component = await mount(
    <SalarySetupControl perDaySalary={null} onSave={async () => { called = true; }} />,
  );
  await component.getByRole("button", { name: "Salary Setup" }).click();
  await component.getByLabel("Per day salary").fill("900");
  await component.getByRole("button", { name: "Cancel" }).click();

  await expect(component.getByRole("dialog", { name: "Salary Setup" })).toBeHidden();
  expect(called).toBe(false);
});
