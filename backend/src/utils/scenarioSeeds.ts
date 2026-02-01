// Generate deterministic scenario seeds
import { ScenarioSeed, VesselAffected, EventFeature } from '../types.js';

/**
 * Generate 5 deterministic scenario seeds based on event and affected vessels
 */
export function generateScenarioSeeds(
  event: EventFeature,
  vesselsAffected: VesselAffected[]
): ScenarioSeed[] {
  const highRiskVessels = vesselsAffected.filter(v => v.risk_level === 'high');
  const totalValue = vesselsAffected.reduce((sum, v) => sum + (v.value_eur || 0), 0);
  const highRiskValue = highRiskVessels.reduce((sum, v) => sum + (v.value_eur || 0), 0);
  
  // Deterministic seed generation based on event and vessel characteristics
  const baseDelay = highRiskVessels.length > 0 ? 72 : 48;
  const baseCost = Math.round(totalValue * 0.05); // 5% of total value as base cost
  
  const seeds: ScenarioSeed[] = [
    {
      scenario_id: 'SCN-001',
      name: 'Strategic Reroute (Cape of Good Hope)',
      delay_hours: baseDelay + 96, // Additional 96 hours for Cape route
      cost_impact_eur: baseCost + Math.round(totalValue * 0.12),
      description: 'Reroute affected vessels via Cape of Good Hope, avoiding the disruption zone entirely. Longest route but safest option.',
    },
    {
      scenario_id: 'SCN-002',
      name: 'Alternative Port (Jebel Ali)',
      delay_hours: baseDelay + 24,
      cost_impact_eur: baseCost + Math.round(totalValue * 0.08),
      description: 'Divert to alternative port for transshipment. Moderate delay with additional port fees and handling costs.',
    },
    {
      scenario_id: 'SCN-003',
      name: 'Wait and Proceed',
      delay_hours: baseDelay,
      cost_impact_eur: baseCost,
      description: 'Maintain current course and wait for disruption to resolve. Lowest cost but uncertain timeline.',
    },
    {
      scenario_id: 'SCN-004',
      name: 'Partial Air Freight',
      delay_hours: baseDelay - 36,
      cost_impact_eur: baseCost + Math.round(totalValue * 0.35),
      description: 'Air freight critical cargo components while vessels proceed normally. Fastest but most expensive option.',
    },
    {
      scenario_id: 'SCN-005',
      name: 'Emergency Transshipment',
      delay_hours: baseDelay + 12,
      cost_impact_eur: baseCost + Math.round(totalValue * 0.15),
      description: 'Emergency transshipment at nearest safe port. Balanced approach with moderate cost and delay impact.',
    },
  ];
  
  return seeds;
}
