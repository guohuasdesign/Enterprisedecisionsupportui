// Frontend service to call n8n webhook or backend analysis API
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/trigger-scan';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const USE_N8N = import.meta.env.VITE_USE_N8N !== 'false'; // Default to true if not set

export interface AnalysisRequest {
  dataDir?: string;
}

export interface AnalysisResponse {
  success: boolean;
  trace_id: string;
  event: {
    id: string;
    type: string;
    location: { lat: number; lng: number };
    properties: Record<string, any>;
  };
  vessels_affected: Array<{
    vessel_id: string;
    vessel_name: string;
    distance_nm: number;
    risk_level: 'high' | 'medium' | 'low';
    cargo?: string;
    value_eur?: number;
    origin?: string;
    destination?: string;
    status?: string;
  }>;
  scenarios: Array<{
    scenario_id: string;
    name: string;
    delay_hours: number;
    cost_impact_eur: number;
    description: string;
    rationale: string;
    legal_risk: 'Low' | 'Medium' | 'High';
    confidence_score: number;
    co2_impact_kg?: number;
    operational_efficiency?: number;
    assumptions: string[];
  }>;
  warnings: string[];
  metadata: {
    analysis_timestamp: string;
    total_vessels_analyzed: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
  performance?: {
    duration_ms: number;
  };
  error?: string;
  // n8n-specific fields
  vessel_cargo_summary?: string;
  strategies?: any[];
}

/**
 * Trigger analysis via n8n webhook or backend
 */
export async function runAnalysis(request?: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    if (USE_N8N) {
      // Call n8n webhook
      console.log('Calling n8n webhook:', N8N_WEBHOOK_URL);
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vessel: "Elbe Feeder",
          request_time: new Date().toISOString(),
          ...request,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const n8nData = await response.json();
      
      // Transform n8n response to match AnalysisResponse format
      // n8n returns: { vessel_cargo_summary, strategies, ... }
      // We need to adapt it to our expected format
      return transformN8NResponse(n8nData);
    } else {
      // Call backend API
      const response = await fetch(`${BACKEND_URL}/run-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request || {}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Analysis service error:', error);
    throw error;
  }
}

/**
 * Transform n8n workflow response to AnalysisResponse format
 */
function transformN8NResponse(n8nData: any): AnalysisResponse {
  // n8n workflow returns data in its own format
  // We need to map it to our expected AnalysisResponse structure
  
  // Extract scenarios from n8n response
  const strategies = n8nData.strategies || n8nData.mitigation_strategies || [];
  const scenarios = strategies.map((strategy: any, index: number) => ({
    scenario_id: `SCN-${String(index + 1).padStart(3, '0')}`,
    name: strategy.method || strategy.name || `Mitigation Strategy ${index + 1}`,
    delay_hours: strategy.estimated_delay_hours || 0,
    cost_impact_eur: parseFloat(strategy.estimated_loss_reduction?.replace(/[^\d.-]/g, '')) || 0,
    description: strategy.tactical_steps || strategy.description || '',
    rationale: strategy.why_it_works || strategy.rationale || '',
    legal_risk: 'Medium' as const,
    confidence_score: parseInt(strategy.ai_confidence_score?.replace('%', '') || '75'),
    assumptions: strategy.assumptions || [],
  }));

  return {
    success: true,
    trace_id: n8nData.trace_id || `n8n-${Date.now()}`,
    event: n8nData.event || {
      id: 'EVT-WX-0001',
      type: 'event',
      location: { lat: 53.868, lng: 8.7 },
      properties: {},
    },
    vessels_affected: n8nData.vessels_affected || [],
    scenarios: scenarios,
    warnings: n8nData.warnings || [],
    metadata: {
      analysis_timestamp: new Date().toISOString(),
      total_vessels_analyzed: n8nData.vessels_affected?.length || 0,
      high_risk_count: n8nData.vessels_affected?.filter((v: any) => v.risk_level === 'high').length || 0,
      medium_risk_count: n8nData.vessels_affected?.filter((v: any) => v.risk_level === 'medium').length || 0,
      low_risk_count: n8nData.vessels_affected?.filter((v: any) => v.risk_level === 'low').length || 0,
    },
    // Include n8n-specific data
    vessel_cargo_summary: n8nData.vessel_cargo_summary,
    strategies: strategies,
  };
}

/**
 * Check if backend/n8n is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    if (USE_N8N) {
      // For n8n, we can't easily check health, so we'll try a simple request
      // or just return true if we're using n8n (assume it's running)
      return true;
    } else {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    }
  } catch (error) {
    return false;
  }
}
