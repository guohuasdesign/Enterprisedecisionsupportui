// Utility functions for N8N integration
import { n8nClient, isN8NConfigured } from '../config/n8n';

/**
 * Trigger a decision support workflow in N8N
 */
export async function triggerDecisionWorkflow(context: {
  incidentId?: string;
  vesselId?: string;
  scenario?: string;
  data?: any;
}) {
  if (!isN8NConfigured()) {
    throw new Error('N8N API key is not configured. Please set VITE_N8N_API_KEY in your .env file.');
  }

  try {
    const result = await n8nClient.triggerWebhook('decision-support', {
      timestamp: new Date().toISOString(),
      ...context,
    });

    return result;
  } catch (error) {
    console.error('N8N Workflow Error:', error);
    throw error;
  }
}

/**
 * Execute scenario analysis workflow
 */
export async function executeScenarioAnalysis(scenarioData: {
  vessels: any[];
  events: any[];
  selectedScenario: string;
}) {
  if (!isN8NConfigured()) {
    throw new Error('N8N API key is not configured.');
  }

  try {
    const result = await n8nClient.triggerWebhook('scenario-analysis', {
      scenario: scenarioData.selectedScenario,
      vessels: scenarioData.vessels,
      events: scenarioData.events,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error('N8N Scenario Analysis Error:', error);
    throw error;
  }
}

/**
 * Send incident data to N8N for processing
 */
export async function sendIncidentToN8N(incidentData: {
  id: string;
  type: string;
  severity: string;
  location: { lat: number; lng: number };
  description: string;
  affectedVessels?: any[];
}) {
  if (!isN8NConfigured()) {
    throw new Error('N8N API key is not configured.');
  }

  try {
    const result = await n8nClient.triggerWebhook('incident-processing', {
      incident: incidentData,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error('N8N Incident Processing Error:', error);
    throw error;
  }
}

/**
 * Get workflow status
 */
export async function getWorkflowStatus(workflowId: string) {
  if (!isN8NConfigured()) {
    throw new Error('N8N API key is not configured.');
  }

  try {
    const workflow = await n8nClient.getWorkflow(workflowId);
    return workflow;
  } catch (error) {
    console.error('N8N Get Workflow Error:', error);
    throw error;
  }
}

/**
 * List available workflows
 */
export async function listN8NWorkflows() {
  if (!isN8NConfigured()) {
    throw new Error('N8N API key is not configured.');
  }

  try {
    const workflows = await n8nClient.listWorkflows();
    return workflows;
  } catch (error) {
    console.error('N8N List Workflows Error:', error);
    throw error;
  }
}
