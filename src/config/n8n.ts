// N8N API Configuration
export const N8N_API_KEY = (import.meta as unknown as { env: { VITE_N8N_API_KEY?: string } }).env?.VITE_N8N_API_KEY || '2025-N8N-DDA163F3';

// N8N Base URL - Update this to your n8n instance URL
export const N8N_BASE_URL = (import.meta as unknown as { env: { VITE_N8N_BASE_URL?: string } }).env?.VITE_N8N_BASE_URL || 'http://localhost:5678';

// Check if N8N is configured
export const isN8NConfigured = () => {
  return !!N8N_API_KEY && N8N_API_KEY.length > 0;
};

// N8N API client
export class N8NClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || N8N_API_KEY;
    this.baseURL = baseURL || N8N_BASE_URL;
  }

  /**
   * Trigger a workflow via webhook
   * @param webhookPath - The webhook path (e.g., 'webhook/my-workflow')
   * @param data - Data to send to the webhook
   */
  async triggerWebhook(webhookPath: string, data: any) {
    const url = `${this.baseURL}/webhook/${webhookPath}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `N8N request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute a workflow via API
   * @param workflowId - The workflow ID
   * @param inputData - Input data for the workflow
   */
  async executeWorkflow(workflowId: string, inputData: any) {
    const url = `${this.baseURL}/api/v1/workflows/${workflowId}/execute`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey,
      },
      body: JSON.stringify({ data: inputData }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `N8N workflow execution failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get workflow information
   * @param workflowId - The workflow ID
   */
  async getWorkflow(workflowId: string) {
    const url = `${this.baseURL}/api/v1/workflows/${workflowId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `Failed to get workflow: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * List all workflows
   */
  async listWorkflows() {
    const url = `${this.baseURL}/api/v1/workflows`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `Failed to list workflows: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Default client instance
export const n8nClient = new N8NClient();
