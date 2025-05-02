# 🎭 Playwright Zephyr Jira Reporter

A custom [Playwright](https://playwright.dev/) test reporter that integrates seamlessly with **Zephyr Scale** and **Jira**, allowing you to automatically publish test results, link test executions, and keep traceability across QA processes.

> 🧪 Designed to streamline test reporting and keep your QA workflow in sync with your project management tools.

---

## ✨ Features

### ✅ Automatic Zephyr Test Case Update

>Each Playwright test must include the corresponding Zephyr Test Case Key in its title (e.g., CYP-T123: should login with valid credentials). After execution:

- The test result is reported to Zephyr.

- Each individual test step status is updated based on the execution outcome, making it easier to identify which step failed.

### 🐞 Automatic Bug Creation in Jira
>
> If a test fails:

- A bug is automatically created in Jira.

> The issue contains:

- A custom field with the Zephyr Test Case Key

- A detailed description including:
  The failed steps
  The exact error message encountered during test execution

### 🔁 Jira Issue Status Management

- If a related Jira issue is already in "Testing", and the test is Faild:
The issue is moved to "In Progress".

- If the test passes successfully:
The issue status is transitioned to "Done".

### 📋 Step Synchronization

Zephyr Test Cases must have exactly the same steps as defined in the Playwright test. This ensures step-by-step result tracking and consistency.

### 🧩 Custom Field Requirement in Jira

Jira must have a custom field configured to store the Zephyr Test Case Key for proper linkage between test results and issues.

---

## 📦 Installation

> bash

```
npm install -D @gurglosa/playwright-zephyr-jira-reporter
```

> Or with Yarn:

```
yarn add -D @gurglosa/playwright-zephyr-jira-reporter
```

---

## ⚙️ Configuration

```
export default defineConfig({
  reporter: [
    ['@gurglosa/playwright-zephyr-jira-reporter/dist/Reporter/ZephyrJiraReporter', {
      Zephyr_Base_URL: 'https://api.zephyrscale.example.com/v2',
      Zephyr_Access_Token: 'yourtoken',
      Zephyr_Test_Cycle_ID: 'TEST-CYCLE-123',
      Zephyr_Test_Project_Key: 'TEST',
      Zephyr_Enabled: true,

      Jira_Base_URL: 'https://example.atlassian.net',
      Jira_Access_Token: 'EXAMPLE123',
      Jira_Email: 'user@example.com',
      Jira_project_Key: 'TEST',npx
      Jira_Enabled: true,

    }],
  ],
});
```

>You Have to set Your Jira Status ID in JiraService.ts

```
export enum IssueStatusTransition {
    to_do = '11',
    in_progress = '21',
    done = '31',
    ready_for_testing = '3',
    testing = '2'
}
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

> To avoid hardcoding credentials, use environment variables:

```
ZEPHYR_JIRA_BASE_URL=https://your-domain.atlassian.net
ZEPHYR_JIRA_USER=your-email@example.com
ZEPHYR_JIRA_TOKEN=your-api-token
```

> You can then reference these in your playwright.config.ts:

```
jiraBaseUrl: process.env.ZEPHYR_JIRA_BASE_URL,
jiraUser: process.env.ZEPHYR_JIRA_USER,
jiraToken: process.env.ZEPHYR_JIRA_TOKEN,
```

---

## ✅ Best Practices

- Use consistent test case IDs ([ZEPHYR-T123]) across your tests.
- Create dedicated test cycles for each run or CI pipeline.
- Use Jira workflows that align with your team's status mapping.

---

## ⚠️ Warnings ⚠️

- All tests that need to be run must be grouped into one specific cycle.
- Ensure your **Zephyr Scale** and **Jira** credentials are stored securely. Avoid committing sensitive information to version control.
- Misconfigured environment variables or reporter settings may result in failed test result uploads or incorrect data mapping.
- Be cautious when modifying `IssueStatusTransition` values in `JiraService.ts`, as incorrect mappings can disrupt Jira workflows.
- Always validate your test case IDs and ensure they exist in **Zephyr Scale** or **Jira** before running tests.
- Using outdated versions of the reporter may lead to compatibility issues with Playwright or API changes in **Zephyr Scale**/**Jira**.
- Excessive API calls to **Zephyr Scale** or **Jira** may lead to rate-limiting or account suspension. Use the reporter responsibly.
- Test execution data is irreversible once uploaded. Double-check configurations before running in production environments.
- Ensure your Playwright version is compatible with the reporter to avoid unexpected behavior.
- Avoid hardcoding sensitive data directly in your configuration files; use environment variables instead.
- Regularly review and update your API tokens to maintain security and access compliance.

---

## 🧩 Contributing

```
Have an idea or improvement? Feel free to open an issue or PR!
```

---

## 📫 Contact

Maintained by [@gurglosa](https://github.com/guramiivanidze) – feel free to reach out with questions or feedback.

---
