import path from "path";
import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
  testDir: "./tests-ct",
  testMatch: /.*\.ct\.tsx/,
  snapshotDir: "./tests-ct/__snapshots__",
  timeout: 10_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
    ctViteConfig: {
      resolve: {
        alias: {
          "@": path.resolve(__dirname),
        },
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
