import numpy as np
import pandas as pd

class MonteCarloSimulator:
    def __init__(self, base_hourly_cost=500):
        self.base_hourly_cost = base_hourly_cost

    def run_delay_simulation(self, expected_delay_hours, n_simulations=1000, contract_penalty_per_hour=0, cargo_value=0, spoilage_rate=0.3):
        """
        Simulates delays using a Poisson distribution.
        
        Args:
            expected_delay_hours (float): The mean of the Poisson distribution.
            n_simulations (int): Number of Monte Carlo iterations.
            contract_penalty_per_hour (float): Additional cost per hour due to contract penalties.
            cargo_value (float): Total value of cargo potentially spoiling.
            spoilage_rate (float): Rate of value loss per 12 hours (half-day).
            
        Returns:
            pd.DataFrame: Simulation results with 'delay_hours' and 'total_cost'.
        """
        # Sample from Poisson distribution
        delays = np.random.poisson(expected_delay_hours, n_simulations)
        
        # Base Costs (Operational + Contract Penalty)
        operational_costs = delays * (self.base_hourly_cost + contract_penalty_per_hour)
        
        # Spoilage Calculation
        # Rate is per 12 hours.
        delay_half_days = delays / 12.0
        # Exponential decay: Remaining Value = Original * (1 - rate) ^ half_days
        # Lost Value = Original - Remaining
        # If delays are 0, lost value is 0.
        remaining_ratio = np.power(1 - spoilage_rate, delay_half_days)
        spoilage_costs = cargo_value * (1 - remaining_ratio)
        
        total_costs = operational_costs + spoilage_costs
        
        return pd.DataFrame({
            "delay_hours": delays,
            "operational_cost": operational_costs,
            "spoilage_cost": spoilage_costs,
            "total_cost": total_costs
        })

    def run_blockage_simulation(self, expected_half_days, n_simulations=1000, contract_penalty_per_hour=0, cargo_value=0, spoilage_rate=0.3):
        """
        Simulates blockage duration in half-days using a Poisson distribution.
        
        Args:
            expected_half_days (float): Mean number of half-days (12-hour block).
            n_simulations (int): Number of iterations.
            contract_penalty_per_hour (float): Penalty per hour.
            cargo_value (float): Total value of cargo.
            spoilage_rate (float): Rate of value loss per 12 hours.
        
        Returns:
            pd.DataFrame: Results with 'delay_days', 'total_cost'.
        """
        # Sample half-days
        half_days = np.random.poisson(expected_half_days, n_simulations)
        
        # Convert to hours for cost calculation
        hours_delayed = half_days * 12
        
        # Base Costs
        operational_costs = hours_delayed * (self.base_hourly_cost + contract_penalty_per_hour)
        
        # Spoilage
        remaining_ratio = np.power(1 - spoilage_rate, half_days)
        spoilage_costs = cargo_value * (1 - remaining_ratio)
        
        total_costs = operational_costs + spoilage_costs
        
        return pd.DataFrame({
            "delay_days": half_days / 2.0,
            "operational_cost": operational_costs,
            "spoilage_cost": spoilage_costs,
            "total_cost": total_costs
        })

    def get_quintiles(self, df, col_name):
        """Returns quintiles (0, 20, 40, 60, 80, 100) for a given column."""
        return df[col_name].quantile([0, 0.2, 0.4, 0.6, 0.8, 1.0]).to_dict()
