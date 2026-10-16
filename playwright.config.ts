import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}",
  fullyParallel: true,
  retries: 0,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  use: { baseURL: "http://127.0.0.1:5190", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  webServer: { command: "npm run dev -- --host 127.0.0.1", url: "http://127.0.0.1:5190", reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
