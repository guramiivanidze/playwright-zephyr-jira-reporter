// src/ZephyrJiraReporter.ts
import { FullConfig, Suite, Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';


export class ZephyrJiraReporter implements Reporter {

    onBegin(config: FullConfig, suite: Suite) {
        console.log(`Starting the run with ${suite.allTests().length} tests`);
    }

    onTestBegin(test: TestCase, result: TestResult) {
        console.log(`Starting test ${test.title}`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        console.log(`Finished test ${test.title} with status: ${result.status}`);
    }

    onEnd(result: FullResult) {
        console.log(`Finished the run: ${result.status}`);
    }

}

export const zephyrJiraReporter = new ZephyrJiraReporter();
