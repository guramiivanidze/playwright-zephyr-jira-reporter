
import axios, { AxiosError, AxiosInstance } from 'axios';
export enum TestExecutionStatus {
    passed = 'Pass',
    failed = 'Fail',
    skipped = 'Blocked',
    timedOut = 'Fail',
    interrupted = 'Fail',
    in_progress = 'In Progress',
    UNKNOWN = 'Blocked',
    // BLOCKED = 'Blocked',
    // UNEXECUTED = 'Unexecuted',
    // NOT_APPLICABLE = 'Not Applicable',

}

interface CustomFields {
    "Build Number"?: number; // Build number of the test execution (e.g., "1234")
    "Release Date"?: string; // Release date of the test execution (e.g., "2020-01-01")
    "Pre-Condition(s)"?: string; // Pre-condition(s) for the test execution (e.g., "User should have logged in. <br> User should have navigated to the administration panel.")
    "Implemented"?: boolean; // Indicates if the test case is implemented
    "Category"?: string[]; // Category of the test execution (e.g., "Smoke", "Regression")
    "Tester"?: string; // Name of the tester executing the test case (e.g., "fa2e582e-5e15-521e-92e3-47e6ca2e7256")
}

export interface UpdateTestExecutionParams {
    projectKey: string;
    testCaseKey: string;
    testCycleKey: string;
    statusName: TestExecutionStatus;
    testScriptResults?: any; // Changed to any type to handle object directly
    environmentName: string; // Environment name for the test execution exmple: "Chrome Latest Version"
    actualEndDate?: string; // ISO format date string
    executedBy?: string;
    executionTime: number; // Execution time in milliseconds
    assignedToId?: string; // User ID of the assignee in Zephyr Scale
    comment?: string;
    customFields?: CustomFields; // Custom fields to be updated in the test execution
}

export interface TestExecutionResponse {
    id: number;
    key: string;
    projectKey: string;
    testCaseKey: string;
    testCycleKey: string;
    statusName: string;
    comment: string;
    executedBy: string;
    executionDate: string;
    createdOn: string;
    updatedOn: string;
}

export interface TestCaseIssueLink {
    issueId: string;
}


export class ZephyrServices {
    private client: AxiosInstance;
    private zephyrBaseUrl: string;
    private zephyrAccessToken: string;
    private zephyrTestCycleId: string;
    private zephyrEnabled: boolean;
    private ZephyrTestProjectKey: string;


    constructor(config: {
        Zephyr_Base_URL: string,
        Zephyr_Access_Token: string,
        Zephyr_Test_Cycle_ID: string,
        Zephyr_Enabled: boolean,
        Zephyr_Test_Project_Key: string,

    }) {

        const requiredFields: { key: keyof typeof config; message: string }[] = [
            { key: 'Zephyr_Base_URL', message: 'Zephyr Base URL is required' },
            { key: 'Zephyr_Access_Token', message: 'Zephyr Access Token is required' },
            { key: 'Zephyr_Test_Cycle_ID', message: 'Zephyr Test Cycle ID is required' },
            { key: 'Zephyr_Test_Project_Key', message: 'Zephyr Test Project Key is required' }
        ];

        for (const field of requiredFields) {
            if (!config[field.key]) {
                throw new Error(field.message);
            }
        }


        this.zephyrBaseUrl = config.Zephyr_Base_URL;
        this.zephyrAccessToken = config.Zephyr_Access_Token;
        this.zephyrTestCycleId = config.Zephyr_Test_Cycle_ID;
        this.zephyrEnabled = config.Zephyr_Enabled;
        this.ZephyrTestProjectKey = config.Zephyr_Test_Project_Key;
        this.client = axios.create({
            baseURL: this.zephyrBaseUrl,
            headers: {
                Authorization: `Bearer ${this.zephyrAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

    }

    async updateTestExecutionStatus(params: UpdateTestExecutionParams): Promise<TestExecutionResponse> {
        try {
            const {
                projectKey,
                testCaseKey,
                testCycleKey,
                statusName,
                testScriptResults,
                environmentName,
                actualEndDate,
                executedBy,
                assignedToId,
                comment,
                customFields
            } = params;

            const payload: any = {
                projectKey,
                testCaseKey,
                testCycleKey,
                statusName,
                environmentName,
                comment: comment || `Test execution ${testCaseKey} updated to status: ${statusName}`,
                executedBy,
                assignedToId,
                executionDate: actualEndDate || new Date().toISOString(),
                customFields,
            };

            // Add test script to payload if provided (passing object directly)
            if (testScriptResults) {
                payload.testScriptResults = testScriptResults;
            }

            const response = await this.client.post<TestExecutionResponse>('/testexecutions', payload);

            console.log(`✅ Test execution ${testCaseKey} updated to status: ${statusName}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(
                `❌ Failed to update test execution ${params.testCaseKey}:`,
                axiosError.message,
                axiosError.response?.data
            );
            throw error;
        }
    }
    
    async linkIssueToTestCase(testCaseKey: string, link: TestCaseIssueLink): Promise<void> {
        try {
            const response = await this.client.post(`/testcases/${testCaseKey}/links/issues`, link);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(
                `❌ Failed to link issue ${link.issueId} to test case ${testCaseKey}:`,
                axiosError.message,
                axiosError.response?.data
            );
            throw error;
        }
    }
}
export default ZephyrServices;