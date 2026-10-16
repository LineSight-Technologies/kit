import { expect, test, type Page } from "@playwright/test";
import { MANIFEST_IDS } from "../../src/catalog/manifest";

/** Fonts are self-hosted and lazy: ask for both families, then wait for the set to settle. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 1em "Inter Tight"'), document.fonts.load('400 1em "Lexend"')]);
    await document.fonts.ready;
  });
}

test.describe("catalog entries (bare)", () => {
  for (const id of MANIFEST_IDS) {
    test(id, async ({ page }) => {
      await page.goto(`/#${id}?bare`);
      await settle(page);
      // A missing entry renders the "Not built yet" stage, which snapshots just as stably.
      await expect(page.locator(`[data-bare="${id}"] [data-stage]`).first()).toBeVisible();
      await expect(page).toHaveScreenshot(`${id}.png`, { fullPage: true });
    });
  }
});

test("catalog chrome", async ({ page }) => {
  await page.goto("/#button");
  await settle(page);
  await expect(page.getByRole("navigation", { name: "Catalog" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  await expect(page).toHaveScreenshot("catalog-chrome.png", { fullPage: true });
});
