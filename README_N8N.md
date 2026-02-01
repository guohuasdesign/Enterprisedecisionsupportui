# N8N Integration Configuration

## Setup Steps

1. **Create or update `.env` file**
   Add the following to your `.env` file in the project root:
   ```
   VITE_N8N_API_KEY=
   VITE_N8N_BASE_URL=http://localhost:5678
   ```
   
   **Note**: Update `VITE_N8N_BASE_URL` to your actual n8n instance URL if it's not running locally.

2. **Restart Development Server**
   After creating or modifying the `.env` file, restart the Vite development server.

## Usage

### Basic Usage

```typescript
import { n8nClient, isN8NConfigured } from './config/n8n';

// Check if N8N is configured
if (isN8NConfigured()) {
  // Trigger a webhook
  const result = await n8nClient.triggerWebhook('my-workflow', {
    data: 'your data here'
  });
}
```

### Using Utility Functions

```typescript
import { 
  triggerDecisionWorkflow, 
  executeScenarioAnalysis,
  sendIncidentToN8N 
} from './utils/n8n';

// Trigger decision support workflow
const result = await triggerDecisionWorkflow({
  incidentId: 'EVT-001',
  vesselId: 'VSL-001',
  scenario: 'Strategic Reroute',
});

// Execute scenario analysis
const analysis = await executeScenarioAnalysis({
  vessels: [...],
  events: [...],
  selectedScenario: 'Cape Reroute',
});

// Send incident data
const processed = await sendIncidentToN8N({
  id: 'EVT-001',
  type: 'Port Strike',
  severity: 'High',
  location: { lat: 30.5, lng: 32.2 },
  description: 'Major disruption...',
});
```

## N8N Workflow Setup

### Webhook Endpoints

The integration expects the following webhook endpoints in your n8n instance:

1. **`/webhook/decision-support`** - For decision support workflows
2. **`/webhook/scenario-analysis`** - For scenario analysis
3. **`/webhook/incident-processing`** - For incident processing

### Example N8N Workflow

1. Create a new workflow in n8n
2. Add a **Webhook** node
3. Set the webhook path (e.g., `decision-support`)
4. Configure the workflow to process the incoming data
5. Activate the workflow

## API Methods

### N8N Client Methods

- `triggerWebhook(webhookPath, data)` - Trigger a workflow via webhook
- `executeWorkflow(workflowId, inputData)` - Execute a workflow via API
- `getWorkflow(workflowId)` - Get workflow information
- `listWorkflows()` - List all available workflows

## Configuration

### Environment Variables

- `VITE_N8N_API_KEY` - Your n8n API key (default: `2025-N8N-DDA163F3`)
- `VITE_N8N_BASE_URL` - Your n8n instance URL (default: `http://localhost:5678`)

### Security Notes

⚠️ **Important**: The `.env` file has been added to `.gitignore` and will not be committed to the Git repository.

- Do not commit API keys to version control systems
- For production, use environment-specific configuration
- Consider using a backend service as a proxy for n8n calls in production

## Testing

You can test the N8N connection using the API Test page in the application, or use the browser console:

```javascript
// Test N8N connection
import { n8nClient } from './config/n8n';

try {
  const workflows = await n8nClient.listWorkflows();
  console.log('✅ N8N connected!', workflows);
} catch (error) {
  console.error('❌ N8N connection failed:', error);
}
```
