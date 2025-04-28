import { test, expect } from '@playwright/test';

// Example 1: Basic navigation test
test('[GLS-T108] should navigate to the Playwright homepage', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwrightr/);
});


// // Example 2: Check for a specific element on the page
// test('should display the Get Started button on the homepage', async ({ page }) => {

//     expect(1).toEqual(2);
// });
