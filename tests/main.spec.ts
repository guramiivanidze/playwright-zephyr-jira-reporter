import { test, expect } from '@playwright/test';






// Example 1: Basic navigation test
test('should navigate to the Playwright homepage', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
});

// Example 2: Form interaction test
test('should fill and submit a form', async ({ page }) => {
    await page.goto('https://example.com/form');
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'johndoe@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toHaveText('Form submitted successfully!');
});