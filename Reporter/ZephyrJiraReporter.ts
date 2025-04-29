// src/ZephyrJiraReporter.ts
import { FullConfig, Suite, Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

import { TestExecutionStatus, ZephyrServices } from './ZephyrServices';
import { JiraServices } from './JiraServices';

interface MainReporterConfig {
    Zephyr_Base_URL: string,
    Zephyr_Access_Token: string,
    Zephyr_Test_Cycle_ID: string,
    Zephyr_Test_Project_Key: string,
    Zephyr_Enabled: boolean,

    Jira_Base_URL: string,
    Jira_Access_Token: string,
    Jira_Email: string,
    Jira_project_Key: string,
    Jira_Enabled: boolean,
}

function extractKeys(title: string): { testCaseKey: string | null; testCycleKey: string | null } {
    const testCaseMatch = title.match(/\[([A-Z]+-T\d+)\]/); // Matches test case keys like [MYA-T123]
    const testCycleMatch = title.match(/\[([A-Z]+-R\d+)\]/); // Matches test cycle keys like [MYA-R9]

    return {
        testCaseKey: testCaseMatch ? testCaseMatch[1] : null,
        testCycleKey: testCycleMatch ? testCycleMatch[1] : null
    };
}

function mapTestStatus(status: TestResult['status']): TestExecutionStatus {
    switch (status) {
        case 'passed':
            return TestExecutionStatus.passed;
        case 'failed':
            return TestExecutionStatus.failed;
        case 'skipped':
            return TestExecutionStatus.skipped;
        case 'timedOut':
            return TestExecutionStatus.timedOut;
        case 'interrupted':
            return TestExecutionStatus.interrupted;
        default:
            return TestExecutionStatus.UNKNOWN;
    }
}

class ZephyrJiraReporter implements Reporter {
    private zephyrService: ZephyrServices | null = null; // Service for interacting with Zephyr Scale
    private jiraService: JiraServices | null = null; // Service for interacting with Jira
    private config: MainReporterConfig; // Configuration for the reporter
    private testResults: Map<string, {
        status: TestExecutionStatus;
        error?: string;
        testCycleKey: string;
        testScript?: any;
        duration: any;
    }> = new Map();

    constructor(config: MainReporterConfig) {
        // Initialize configuration with environment variables as fallback
        this.config = {
            Zephyr_Base_URL: process.env.ZEPHYR_BASE_URL || config.Zephyr_Base_URL,
            Zephyr_Access_Token: process.env.ZEPHYR_ACCESS_TOKEN || config.Zephyr_Access_Token,
            Zephyr_Test_Cycle_ID: process.env.ZEPHYR_TEST_CYCLE_ID || config.Zephyr_Test_Cycle_ID,
            // Zephyr_Test_Plan_ID: process.env.ZEPHYR_TEST_PLAN_ID || config.Zephyr_Test_Plan_ID,
            Zephyr_Test_Project_Key: process.env.ZEPHYR_TEST_PROJECT_KEY || config.Zephyr_Test_Project_Key,
            Zephyr_Enabled: process.env.ZEPHYR_ENABLED ? JSON.parse(process.env.ZEPHYR_ENABLED) : config.Zephyr_Enabled,

            Jira_Access_Token: config.Jira_Access_Token,
            Jira_Base_URL: config.Jira_Base_URL,
            Jira_Email: config.Jira_Email,
            Jira_project_Key: config.Jira_project_Key,
            Jira_Enabled: config.Jira_Enabled,

        }

        if (!this.config.Zephyr_Enabled) {
            console.log('Zephyr Scale reporting is disabled');
            return;
        }

        // Initialize the Zephyr Scale service if reporting is enabled
        this.zephyrService = new ZephyrServices({
            Zephyr_Base_URL: this.config.Zephyr_Base_URL,
            Zephyr_Access_Token: this.config.Zephyr_Access_Token,
            Zephyr_Test_Cycle_ID: this.config.Zephyr_Test_Cycle_ID,
            // Zephyr_Test_Plan_ID: this.config.Zephyr_Test_Plan_ID,
            Zephyr_Test_Project_Key: this.config.Zephyr_Test_Project_Key,
            Zephyr_Enabled: this.config.Zephyr_Enabled,
        });
    }



    /**
     * Called when a test ends. Collects test results and prepares them for reporting.
     * 
     * @param testCase - The test case
     * @param testResult - The test result
     */
    onTestEnd(testCase: TestCase, testResult: TestResult): void {

        if (!this.config.Zephyr_Enabled) return;

        const { testCaseKey, testCycleKey } = extractKeys(testCase.title);
        if (!testCaseKey) {
            console.log(`No Jira test case key found in test title: ${testCase.title}`);
            return;
        }

        // Use test cycle key from the title or fall back to the default
        const cycleKey = testCycleKey || this.config.Zephyr_Test_Cycle_ID;
        if (!cycleKey) {
            console.log(`No test cycle key found for test: ${testCase.title}`);
            return;
        }

        const status = mapTestStatus(testResult.status);
        let errorMessage = '';

        if (testResult.error) {
            errorMessage = testResult.error.stack || String(testResult.error); // Capture error details if present
        }

        // Extract test script details from the test result
        const testScript = this.extractTestScript(testResult);

        // Store the test result for later reporting
        this.testResults.set(testCaseKey, {
            status,
            error: errorMessage,
            testCycleKey: cycleKey,
            testScript,
            duration: testResult.duration,

        });



        if (this.config.Jira_Enabled && testResult.status === 'failed') {
            const jiraService = new JiraServices({
                Jira_Base_URL: this.config.Jira_Base_URL,
                Jira_Access_Token: this.config.Jira_Access_Token,
                Jira_Email: this.config.Jira_Email,
                Jira_project_Key: this.config.Jira_project_Key,
                Jira_Enabled: this.config.Jira_Enabled,
            });

            let stepNum = 1
            jiraService.createIssue({
                fields: {
                    project: {
                        key: this.config.Jira_project_Key,
                    },
                    summary: `${testCase.title}`,
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: `${testScript.map((step: any) => `Step ${stepNum++}: ${step.actualResult} - Status: ${step.statusName}`).join('\n')}`,
                                    },
                                ],
                            },
                        ],
                    },
                    issuetype: {
                        id: '10002',
                    },
                    reporter: {
                        id: '6113c0ba9798100070110305',
                    }
                },
            }).then((response) => {
                console.log(`✅Jira issue created: ${response.key}`);
            }).catch((error) => {
                console.error('❌Failed to create Jira issue:', error);
            });
        }
    }

    /**
     * Removes ANSI color codes from a string.
     * 
     * @param str - The string to clean
     * @returns The cleaned string
     */
    private stripAnsiCodes(str: string): string {
        return str.replace(/\x1B\[\d+m/g, ''); // Removes ANSI color codes
    }

    /**
     * Extracts test script details from the test result and enhances it with test execution status.
     * 
     * @param result - The test result
     * @returns The test script as an object (not a string)
     */
    private extractTestScript(result: TestResult): any {
        try {
            // Filter out steps categorized as 'hook' (e.g., setup/teardown steps)
            const filteredSteps = result.steps.filter(step => step.category !== 'hook');

            // Map each step to an object containing its execution status and result
            const stepScriptWithErrors = filteredSteps.map(step => ({
                actualResult: step.error
                    ? `Step "${step.title}" failed with error: ${this.stripAnsiCodes(step.error.stack || 'Unknown error')}`
                    : "Step executed successfully",
                statusName: step.error ? 'fail' : 'pass'
            }));

            return stepScriptWithErrors;
        } catch (error) {
            console.error('Failed to extract test script:', error);
            return undefined; // Return undefined if extraction fails
        }
    }

    /**
     * Called when all tests have finished. Reports the collected test results to Zephyr Scale.
     */
    async onEnd(): Promise<void> {
        if (!this.config.Zephyr_Enabled || !this.zephyrService || this.testResults.size === 0) return;

        console.log(`\nUpdating ${this.testResults.size} test results in Zephyr Scale...`);
        const updatePromises = Array.from(this.testResults.entries()).map(async ([testCaseKey, result]) => {
            try {
                if (this.zephyrService) {
                    await this.zephyrService.updateTestExecutionStatus({
                        projectKey: this.config.Zephyr_Test_Project_Key,
                        testCaseKey,
                        testCycleKey: result.testCycleKey,
                        statusName: result.status,
                        testScriptResults: result.testScript,
                        environmentName: 'TEST',
                        actualEndDate: new Date().toISOString(),
                        executedBy: 'Automated Test Runner',
                        assignedToId: '712020:40b4e2a2-b204-427e-867a-041cd0510010',
                        executionTime: result.duration,
                        comment: result.error ? `Test failed with error: ${result.error}` : undefined,

                    });
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(`Failed to update test case ${testCaseKey} in Zephyr Scale:`, error.message);
                } else {
                    console.log(`Failed to update test case ${testCaseKey} in Zephyr Scale:`, String(error));
                }
            }
        });

        await Promise.all(updatePromises);
        console.log('Zephyr Scale update completed');

    }
}

export default ZephyrJiraReporter;