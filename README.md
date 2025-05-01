# 🎭 Playwright Zephyr Jira Reporter

A custom [Playwright](https://playwright.dev/) test reporter that integrates seamlessly with **Zephyr Scale** and **Jira**, allowing you to automatically publish test results, link test executions, and keep traceability across QA processes.

> 🧪 Designed to streamline test reporting and keep your QA workflow in sync with your project management tools.

---

## ✨ Features

- 📤 Report test results from Playwright to **Zephyr Scale**
- 🔗 Automatically link test cases to test executions in **Jira**
- 📘 Add comments, status updates, and metadata to Jira issues
- 🔄 Configurable reporter to fit your test lifecycle and project needs

---

## 📦 Installation


```
bash
npm install -D @gurglosa/playwright-zephyr-jira-reporter

Or with Yarn:
yarn add -D @gurglosa/playwright-zephyr-jira-reporter

```

---
## ⚙️ Configuration

```
export default defineConfig({
  reporter: [
    ['./Reporter/ZephyrJiraReporter.ts', {
      Zephyr_Base_URL: 'https://api.zephyrscale.example.com/v2',
      Zephyr_Access_Token: 'yourtoken',
      Zephyr_Test_Cycle_ID: 'TEST-CYCLE-123',
      Zephyr_Test_Project_Key: 'TEST',
      Zephyr_Enabled: true,

      Jira_Base_URL: 'https://example.atlassian.net',
      Jira_Access_Token: 'EXAMPLE123',
      Jira_Email: 'user@example.com',
      Jira_project_Key: 'TEST',
      Jira_Enabled: true,

    }],
  ],
});
```
---

## 🧪 Test Case Linking

> To link a test with a Zephyr Scale test case or Jira issue, use a tag in the test title or annotations:
```
test('[GLS-T108] should navigate to the Playwright homepage', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwrightr/);
});
```

---

## 📄 Environment Variables (Optional)
```
To avoid hardcoding credentials, use environment variables:

ZEPHYR_JIRA_BASE_URL=https://your-domain.atlassian.net
ZEPHYR_JIRA_USER=your-email@example.com
ZEPHYR_JIRA_TOKEN=your-api-token

You can then reference these in your playwright.config.ts:

jiraBaseUrl: process.env.ZEPHYR_JIRA_BASE_URL,
jiraUser: process.env.ZEPHYR_JIRA_USER,
jiraToken: process.env.ZEPHYR_JIRA_TOKEN,
```
---
## ✅ Best Practices
```
- Use consistent test case IDs ([ZEPHYR-T123]) across your tests.
- Create dedicated test cycles for each run or CI pipeline.
- Use Jira workflows that align with your team's status mapping.
```
---
## 🧩 Contributing
```
Have an idea or improvement? Feel free to open an issue or PR!
```


## 📫 Contact
Maintained by @gurglosa – feel free to reach out with questions or feedback.
