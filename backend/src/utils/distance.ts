// Haversine formula for calculating distance between two geographic points
// Returns distance in nautical miles

export interface Coordinates {
  lat: number; // Latitude in degrees
  lng: number; // Longitude in degrees
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First point (lat, lng)
 * @param point2 Second point (lat, lng)
 * @returns Distance in nautical miles
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 3440.065; // Earth's radius in nautical miles

  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Classify risk level based on distance
 * @param distance_nm Distance in nautical miles
 * @returns Risk level: 'high', 'medium', or 'low'
 */
export function classifyRisk(distance_nm: number): 'high' | 'medium' | 'low' {
  if (distance_nm <= 120) {
    return 'high';
  } else if (distance_nm <= 250) {
    return 'medium';
  } else {
    return 'low';
  }
}
