import { test, expect } from "@playwright/experimental-ct-react";
import DateEntryModal from "@/components/DateEntryModal";

test("Done is disabled until a status is picked", async ({ mount }) => {
  const component = await mount(
    <DateEntryModal title="Wed, Sep 10" existingEntry={null} onClose={async () => {}} onSave={async () => {}} onClear={async () => {}} />,
  );
  await expect(component.getByRole("button", { name: "Done" })).toBeDisabled();
  await component.getByText("Present", { exact: true }).click();
  await expect(component.getByRole("button", { name: "Done" })).toBeEnabled();
});

test("a blank advance amount saves as advance:0 while advanceOn stays true", async ({ mount }) => {
  let saved: unknown = null;
  const component = await mount(
    <DateEntryModal
      title="Wed, Sep 10"
      existingEntry={null}
      onClose={async () => {}}
      onSave={async (entry) => {
        saved = entry;
      }}
      onClear={async () => {}}
    />,
  );
  await component.getByText("Half-Day", { exact: true }).click();
  await component.getByLabel("Advance Salary").check();
  await component.getByRole("button", { name: "Done" }).click();

  expect(saved).toEqual({ status: "half", advanceOn: true, advance: 0 });
});

test("Done is disabled when the advance amount is present but not a finite number >= 0", async ({ mount }) => {
  const component = await mount(
    <DateEntryModal title="Wed, Sep 10" existingEntry={null} onClose={async () => {}} onSave={async () => {}} onClear={async () => {}} />,
  );
  await component.getByText("Present", { exact: true }).click();
  await component.getByLabel("Advance Salary").check();
  await component.getByLabel("Advance amount").fill("-5");
  await expect(component.getByRole("button", { name: "Done" })).toBeDisabled();

  await component.getByLabel("Advance amount").fill("250");
  await expect(component.getByRole("button", { name: "Done" })).toBeEnabled();
});

test("Clear does not appear when there is no existing entry", async ({ mount }) => {
  const component = await mount(
    <DateEntryModal title="Wed, Sep 10" existingEntry={null} onClose={async () => {}} onSave={async () => {}} onClear={async () => {}} />,
  );
  await expect(component.getByText("Clear", { exact: true })).toHaveCount(0);
});

test("Clear appears and invokes onClear when an entry already exists", async ({ mount }) => {
  let cleared = false;
  const component = await mount(
    <DateEntryModal
      title="Wed, Sep 10"
      existingEntry={{ status: "present", advanceOn: false, advance: 0 }}
      onClose={async () => {}}
      onSave={async () => {}}
      onClear={async () => {
        cleared = true;
      }}
    />,
  );
  await component.getByText("Clear", { exact: true }).click();
  expect(cleared).toBe(true);
});
