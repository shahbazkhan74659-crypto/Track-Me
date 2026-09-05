import { test, expect } from "@playwright/experimental-ct-react";
import ProfileBadge from "@/components/ProfileBadge";

test("shows the username, the 'Personal record' subtitle, and a title tooltip", async ({ mount }) => {
  const component = await mount(<ProfileBadge username="shahbaz" />);
  await expect(component).toContainText("shahbaz");
  await expect(component).toContainText("Personal record");
  await expect(component.locator("[title='shahbaz']")).toBeVisible();
});
