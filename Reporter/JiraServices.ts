import axios, { AxiosInstance, AxiosError } from 'axios';
import { Buffer } from 'buffer';

export interface JiraConfig {
    Jira_Base_URL: string;
    Jira_Access_Token: string;
    Jira_Email: string;
    Jira_project_Key: string;
    Jira_Enabled: boolean;

}

export interface JiraIssuePayload {
    fields: {
        summary: string;
        issuetype: { id: string };
        project: { key: string };
        description?: any;
        assignee?: { id: string };
        reporter?: { id: string };
    };
    update?: Record<string, any>;
}

export interface JiraIssueResponse {
    id: string;
    key: string;
    self: string;
}

export class JiraServices {
    private client: AxiosInstance;
    private jiraBaseUrl: string;
    jiraProjectKey: string;

    constructor(config: JiraConfig) {
        const requiredFields: { key: keyof JiraConfig; message: string }[] = [
            { key: 'Jira_Base_URL', message: 'Jira Base URL is required' },
            { key: 'Jira_Email', message: 'Jira email is required' },
            { key: 'Jira_Access_Token', message: 'Jira API token is required' },
            { key: 'Jira_project_Key', message: 'Jira Project Key is required' },
            { key: 'Jira_Email', message: 'Jira email is required' },
        ];

        console.log()
        for (const field of requiredFields) {
            if (!config[field.key]) {
                throw new Error(field.message);
            }
        }

        const authToken = Buffer.from(`${config.Jira_Email}:${config.Jira_Access_Token}`).toString('base64');
        this.jiraBaseUrl = config.Jira_Base_URL;
        this.jiraProjectKey = config.Jira_project_Key;

        this.client = axios.create({
            baseURL: `${this.jiraBaseUrl}/rest/api/3`,
            headers: {
                Authorization: `Basic ${authToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    async createIssue(payload: JiraIssuePayload): Promise<JiraIssueResponse> {

        try {
            const response = await this.client.post<JiraIssueResponse>('/issue', payload);
            // console.log(`✅ Issue created: ${response.data.key}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            // console.log(
            //     `❌ Failed to create Jira issue:`,
            //     axiosError.message,
            //     axiosError.response?.data
            // );
            throw error;
        }
    }

}




export default JiraServices;
