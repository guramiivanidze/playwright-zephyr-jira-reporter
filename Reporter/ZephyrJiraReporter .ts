// src/ZephyrJiraReporter.ts
import { FullConfig, Suite, Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import axios from 'axios';

export class ZephyrJiraReporter implements Reporter {



    onBegin(config: FullConfig, suite: Suite) {
        console.log(`Starting the run with ${suite.allTests().length} tests`);
    }

    onTestBegin(test: TestCase, result: TestResult) {
        console.log(`Starting test ${test.title}`);
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === 'failed') {
            await this.reportToZephyrScale(test, result);
            await this.createJiraBug(test, result);
        }
    }

    onEnd(result: FullResult) {
        console.log(`Finished the run: ${result.status}`);
    }



    private async reportToZephyrScale(test: TestCase, result: TestResult) {
        // Example API call to Zephyr Scale (modify as per your setup)
        await axios.post('https://your-zephyr-instance/api/test-executions', {
            testCaseKey: test.title,
            status: result.status,
        }, {
            headers: {
                Authorization: `Bearer YOUR_ZEPHYR_TOKEN`
            }
        });
    }

    private async createJiraBug(test: TestCase, result: TestResult) {
        await axios.post('https://your-domain.atlassian.net/rest/api/3/issue', {
            fields: {
                project: { key: "PROJ" },
                summary: `[AUTOMATION BUG] ${test.title}`,
                description: `Test failed: ${test.title}\n\nError:\n${result.errors?.[0]?.message || 'No message'}`,
                issuetype: { name: "Bug" },
            }
        }, {
            auth: {
                username: 'your-email@example.com',
                password: 'your-api-token',
            },
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const zephyrJiraReporter = new ZephyrJiraReporter();
