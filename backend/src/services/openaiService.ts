// OpenAI service for generating structured scenario analysis
import OpenAI from 'openai';
import { ScenarioSeed, Scenario, EventFeature, VesselAffected } from '../types.js';

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate structured scenario objects using OpenAI
 */
export async function generateScenarios(
  event: EventFeature,
  vesselsAffected: VesselAffected[],
  seeds: ScenarioSeed[]
): Promise<Scenario[]> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const systemPrompt = `You are an expert in maritime logistics and supply chain risk management. 
Your task is to analyze decision scenarios and provide structured, explainable recommendations.
Always output valid JSON only, no additional text or markdown formatting.`;

  const userPrompt = `Analyze the following supply chain disruption scenario and generate structured scenario objects.

EVENT:
- ID: ${event.properties.id}
- Type: ${event.properties.feature_kind || 'Disruption Event'}
- Location: ${event.geometry.coordinates[1]}, ${event.geometry.coordinates[0]}

AFFECTED VESSELS:
${vesselsAffected.map(v => 
  `- ${v.vessel_name} (${v.vessel_id}): ${v.distance_nm}nm away, Risk: ${v.risk_level}, Cargo: ${v.cargo || 'Unknown'}, Value: €${v.value_eur?.toLocaleString() || 'Unknown'}`
).join('\n')}

SCENARIO SEEDS:
${seeds.map(s => 
  `- ${s.scenario_id}: ${s.name} (Delay: ${s.delay_hours}h, Cost: €${s.cost_impact_eur.toLocaleString()})`
).join('\n')}

Generate a JSON array with 5 scenario objects. Each scenario must include:
{
  "scenario_id": "string (from seed)",
  "name": "string (from seed)",
  "delay_hours": number (from seed),
  "cost_impact_eur": number (from seed),
  "description": "string (from seed)",
  "rationale": "string (detailed explanation of why this scenario is viable)",
  "legal_risk": "Low" | "Medium" | "High",
  "confidence_score": number (0-100),
  "co2_impact_kg": number (optional, estimated CO2 impact),
  "operational_efficiency": number (optional, 0-100),
  "assumptions": ["string"] (array of key assumptions)
}

Output ONLY the JSON array, no markdown, no code blocks, no explanations.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response - OpenAI may return JSON wrapped in markdown or as plain JSON
    let parsed: any;
    try {
      // Try direct JSON parse first
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[.*?\])\s*```/s) || 
                       content.match(/```(?:json)?\s*(\{.*?\})\s*```/s) ||
                       content.match(/(\[.*?\])/s) ||
                       content.match(/(\{.*\})/s);
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          throw new Error('Failed to parse extracted JSON from OpenAI response');
        }
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }

    // Handle both array and object with scenarios property
    let scenarios: any[];
    if (Array.isArray(parsed)) {
      scenarios = parsed;
    } else if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
      scenarios = parsed.scenarios;
    } else if (parsed.scenario && Array.isArray(parsed.scenario)) {
      scenarios = parsed.scenario;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // If single object, wrap in array
      scenarios = [parsed];
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }

    // Validate and merge with seeds
    return scenarios.slice(0, 5).map((scenario, index) => {
      const seed = seeds[index];
      return {
        scenario_id: scenario.scenario_id || seed.scenario_id,
        name: scenario.name || seed.name,
        delay_hours: scenario.delay_hours ?? seed.delay_hours,
        cost_impact_eur: scenario.cost_impact_eur ?? seed.cost_impact_eur,
        description: scenario.description || seed.description,
        rationale: scenario.rationale || 'Analysis pending',
        legal_risk: scenario.legal_risk || 'Medium',
        confidence_score: scenario.confidence_score ?? 75,
        co2_impact_kg: scenario.co2_impact_kg,
        operational_efficiency: scenario.operational_efficiency,
        assumptions: Array.isArray(scenario.assumptions) 
          ? scenario.assumptions 
          : ['Standard operational conditions apply'],
      } as Scenario;
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}
