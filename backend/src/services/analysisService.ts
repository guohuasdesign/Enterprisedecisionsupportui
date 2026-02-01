// Main analysis service
import { randomUUID } from 'crypto';
import { 
  loadIncidentData, 
  loadShippingData, 
  extractEvents, 
  extractVessels 
} from '../utils/dataLoader.js';
import { calculateDistance, classifyRisk } from '../utils/distance.js';
import { generateScenarioSeeds } from '../utils/scenarioSeeds.js';
import { generateScenarios } from './openaiService.js';
import { 
  AnalysisResult, 
  EventFeature, 
  VesselFeature, 
  VesselAffected 
} from '../types.js';

/**
 * Perform complete analysis
 */
export async function runAnalysis(dataDir?: string): Promise<AnalysisResult> {
  const traceId = randomUUID();
  const warnings: string[] = [];
  
  try {
    // 1. Load GeoJSON files
    const incidentData = loadIncidentData(dataDir);
    const shippingData = loadShippingData(dataDir);
    
    // 2. Extract event
    const events = extractEvents(incidentData);
    if (events.length === 0) {
      throw new Error('No event found in incident_data.geojson');
    }
    if (events.length > 1) {
      warnings.push(`Multiple events found (${events.length}), using first event`);
    }
    const event = events[0];
    
    // 3. Extract vessels
    const incidentVessels = extractVessels(incidentData);
    const shippingVessels = extractVessels(shippingData);
    const allVessels = [...incidentVessels, ...shippingVessels];
    
    if (allVessels.length === 0) {
      throw new Error('No vessels found in data files');
    }
    
    // 4. Calculate distances and classify risk
    const eventLocation = {
      lat: event.geometry.coordinates[1],
      lng: event.geometry.coordinates[0],
    };
    
    const vesselsAffected: VesselAffected[] = allVessels.map((vessel) => {
      const vesselLocation = {
        lat: vessel.geometry.coordinates[1],
        lng: vessel.geometry.coordinates[0],
      };
      
      const distance_nm = calculateDistance(eventLocation, vesselLocation);
      const risk_level = classifyRisk(distance_nm);
      
      return {
        vessel_id: vessel.properties.id || 
                   vessel.properties.vessel_name?.replace(/\s+/g, '-').toLowerCase() || 
                   `vessel-${Math.random().toString(36).substr(2, 9)}`,
        vessel_name: vessel.properties.vessel_name || 
                     vessel.properties.id || 
                     'Unknown Vessel',
        distance_nm,
        risk_level,
        cargo: vessel.properties.cargo,
        value_eur: vessel.properties.value_eur,
        origin: vessel.properties.origin,
        destination: vessel.properties.destination,
        status: vessel.properties.status,
      };
    });
    
    // 5. Generate scenario seeds
    const seeds = generateScenarioSeeds(event, vesselsAffected);
    
    // 6. Generate scenarios using OpenAI
    let scenarios;
    try {
      scenarios = await generateScenarios(event, vesselsAffected, seeds);
    } catch (openaiError) {
      warnings.push(`OpenAI generation failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}. Using seed data only.`);
      // Fallback to seeds if OpenAI fails
      scenarios = seeds.map(seed => ({
        ...seed,
        rationale: 'Analysis pending - OpenAI service unavailable',
        legal_risk: 'Medium' as const,
        confidence_score: 50,
        assumptions: ['Standard operational conditions apply'],
      }));
    }
    
    // Calculate metadata
    const riskCounts = vesselsAffected.reduce((acc, v) => {
      acc[v.risk_level]++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
    
    return {
      trace_id: traceId,
      event: {
        id: event.properties.id || 'unknown',
        type: event.properties.feature_kind || 'event',
        location: {
          lat: eventLocation.lat,
          lng: eventLocation.lng,
        },
        properties: event.properties,
      },
      vessels_affected: vesselsAffected,
      scenarios: scenarios,
      warnings: warnings,
      metadata: {
        analysis_timestamp: new Date().toISOString(),
        total_vessels_analyzed: vesselsAffected.length,
        high_risk_count: riskCounts.high,
        medium_risk_count: riskCounts.medium,
        low_risk_count: riskCounts.low,
      },
    };
  } catch (error) {
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
