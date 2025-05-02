import { test, expect } from '@playwright/test';






// Test to verify navigation to the Playwright homepage and check the title (intentional typo in the title for demonstration purposes)
test('[GLS-T108] should navigate to the Playwright homepage', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwrightr/); // This will fail due to the typo in "Playwrightr"
});

// Example test to verify navigation to the Playwright homepage and check the correct title
test('[GLS-T107] should navigate to the Playwright homepage 1', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/); // This should pass
});

// Another example test to verify navigation to the Playwright homepage and check the correct title
test('[GLS-T106] should navigate to the Playwright homepage 2', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/); // This should also pass
});
