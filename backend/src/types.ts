// Type definitions for IDSS Backend

export interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  name?: string;
  crs?: any;
  features: GeoJSONFeature[];
}

export interface EventFeature extends GeoJSONFeature {
  properties: {
    id: string;
    feature_kind: 'event';
  };
}

export interface VesselFeature extends GeoJSONFeature {
  properties: {
    vessel_name?: string;
    origin?: string;
    destination?: string;
    cargo?: string;
    value_eur?: number;
    dist_hamburg_nm?: number;
    status?: string;
    [key: string]: any;
  };
}

export interface VesselAffected {
  vessel_id: string;
  vessel_name: string;
  distance_nm: number;
  risk_level: 'high' | 'medium' | 'low';
  cargo?: string;
  value_eur?: number;
  origin?: string;
  destination?: string;
  status?: string;
}

export interface ScenarioSeed {
  scenario_id: string;
  name: string;
  delay_hours: number;
  cost_impact_eur: number;
  description: string;
}

export interface Scenario extends ScenarioSeed {
  rationale: string;
  legal_risk: 'Low' | 'Medium' | 'High';
  confidence_score: number;
  co2_impact_kg?: number;
  operational_efficiency?: number;
  assumptions: string[];
}

export interface AnalysisResult {
  trace_id: string;
  event: {
    id: string;
    type: string;
    location: {
      lat: number;
      lng: number;
    };
    properties: Record<string, any>;
  };
  vessels_affected: VesselAffected[];
  scenarios: Scenario[];
  warnings: string[];
  metadata: {
    analysis_timestamp: string;
    total_vessels_analyzed: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
}
