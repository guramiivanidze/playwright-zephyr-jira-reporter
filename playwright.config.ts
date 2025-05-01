import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,


  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['./Reporter/ZephyrJiraReporter.ts', {
      Zephyr_Base_URL: 'https://api.zephyrscale.example.com/v2',
      Zephyr_Access_Token: '..abcdefghijklmnopqrstuvwxyz1234567890',
      Zephyr_Test_Cycle_ID: 'TEST-CYCLE-123',
      Zephyr_Test_Project_Key: 'TEST',
      Zephyr_Enabled: true,

      Jira_Base_URL: 'https://example.atlassian.net',
      Jira_Access_Token: 'ATATT3xFfGF0aBZay--=EXAMPLE123',
      Jira_Email: 'user@example.com',
      Jira_project_Key: 'TEST',
      Jira_Enabled: true,

    }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    screenshot: 'only-on-failure',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

  ],

});
