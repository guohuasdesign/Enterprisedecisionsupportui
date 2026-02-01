// Load and parse GeoJSON files
import { readFileSync } from 'fs';
import { join } from 'path';
import { GeoJSONCollection, EventFeature, VesselFeature } from '../types.js';

/**
 * Load GeoJSON file from disk
 */
export function loadGeoJSON(filePath: string): GeoJSONCollection {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as GeoJSONCollection;
    
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error(`Invalid GeoJSON format in ${filePath}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load GeoJSON file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load incident data GeoJSON
 */
export function loadIncidentData(dataDir: string = '../'): GeoJSONCollection {
  const filePath = join(process.cwd(), dataDir, 'incident_data.geojson');
  return loadGeoJSON(filePath);
}

/**
 * Load shipping data GeoJSON
 */
export function loadShippingData(dataDir: string = '../'): GeoJSONCollection {
  const filePath = join(process.cwd(), dataDir, 'shipping_data.geojson');
  return loadGeoJSON(filePath);
}

/**
 * Extract event features from GeoJSON collection
 */
export function extractEvents(collection: GeoJSONCollection): EventFeature[] {
  return collection.features.filter(
    (feature): feature is EventFeature =>
      feature.properties?.feature_kind === 'event'
  );
}

/**
 * Extract vessel features from GeoJSON collection
 */
export function extractVessels(collection: GeoJSONCollection): VesselFeature[] {
  return collection.features.filter(
    (feature): feature is VesselFeature =>
      feature.properties?.feature_kind === 'vessel' ||
      feature.properties?.vessel_name !== undefined
  );
}
