import axios, { AxiosInstance, AxiosError } from 'axios';
import { Buffer } from 'buffer';

export interface GetJiraIssueResponse {
    expand: string;
    id: string;
    self: string;
    key: string;
    fields: Fields;
}

export interface Fields {
    statuscategorychangedate: string;
    issuetype: IssueType;
    description: Description;
    attachment: any[];
    summary: string;
    creator: User;
    created: string;
    reporter: User;
    environment: null | string;
    progress: Progress;
    issuelinks: any[];
    assignee: User;
    status: Status;
}

export interface IssueType {
    self: string;
    id: string;
    description: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
    avatarId: number;
    entityId: string;
    hierarchyLevel: number;
}

export interface Description {
    type: string;
    version: number;
    content: Array<{
        type: string;
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
}

export interface User {
    self: string;
    accountId: string;
    emailAddress: string;
    displayName: string;
    active: boolean;
    timeZone: string;
    accountType: string;
}
export interface Progress {
    progress: number;
    total: number;
}
export interface Status {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
}

export interface JiraConfig {
    Jira_Base_URL: string;
    Jira_Access_Token: string;
    Jira_Email: string;
    Jira_project_Key: string;
    Jira_Enabled: string;

}

export interface JiraIssuePayload {
    fields: {
        summary: string;
        issuetype: { id: string };
        project: { key: string };
        description?: any;
        assignee?: { id: string };
        reporter?: { id: string };
        customfield_10069?: string; // Custom field for Zephyr Scale Test Case ID
    };
    update?: Record<string, any>;
}
export enum IssueStatusTransition {
    to_do = '11',
    in_progress = '21',
    done = '31',
    ready_for_testing = '3',
    testing = '2'
}
export interface JiraIssueResponse {
    id: string;
    key: string;
    self: string;

}

export interface JiraIssueSearchResponse {
    sections: {
        id: string;
        issues: {
            id: number;
            img: string;
            key: string;
            keyHtml: string;
            summary: string;
            summaryText: string;
        }[];
        label: string;
        msg: string;
        sub: string;
    }[];
}

export class JiraServices {
    private client: AxiosInstance;


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

        this.client = axios.create({
            baseURL: `${config.Jira_Base_URL}/rest/api/3`,
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
            console.log(
                `❌ Failed to create Jira issue:`,
                axiosError.message,
                axiosError.response?.data
            );
            throw axiosError.response?.data;
        }
    }


    async getJiraIssue(issueId: string): Promise<GetJiraIssueResponse> {
        try {
            const response = await this.client.get<GetJiraIssueResponse>(`/issue/${issueId}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.log(
                `❌ Failed to get Jira issue:`,
                axiosError.message,
                axiosError.response?.data
            );
            throw error;
        }
    }

    async searchIssueWithTitleUsingJQL(TestCaseID: string): Promise<JiraIssueSearchResponse> {
        try {
            const response = await this.client.get<JiraIssueSearchResponse>(`/issue/picker?currentJQL=TestCaseID=${TestCaseID}`);
            return response.data;

        } catch (error) {
            const axiosError = error as AxiosError;
            console.log(
                `❌ Failed to search Jira issue:`,
                axiosError.message,
                axiosError.response?.data
            );
            throw error;
        }
    }


    async transitionIssue(issueId: string, transitionId: string): Promise<void> {
        try {
            await this.client.post(`/issue/${issueId}/transitions`, {
                transition: {
                    id: transitionId
                }
            });
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`❌ Failed to transition Jira issue:`, axiosError.message, axiosError.response?.data);
            throw error;
        }
    }
}




export default JiraServices;
