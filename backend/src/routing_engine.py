class RoutingEngine:
    def __init__(self):
        # Base costs per km or per unit (mock values)
        self.costs = {
            "sea": 0.10, # $ per km per unit
            "land_truck": 0.50,
            "land_train": 0.30,
            "air": 2.50 # If we ever needed it
        }
        self.speeds = {
            "sea": 30, # km/h (approx 16 knots)
            "land_truck": 60, # km/h
            "land_train": 50  # km/h
        }

    def estimate_alternative_routes(self, distance_km, current_delay_hours=0, cargo_value=0, spoilage_rate=0.3):
        """
        Returns a list of alternative route options with time and cost estimates,
        including uncertainty ranges and spoilage costs.
        """
        options = []
        
        # Helper for non-negative
        def clamp(val):
            return max(0.0, float(val))
            
        # Helper for Spoilage
        # We assume baseline time is the normal sea time without delay.
        # Any time ABOVE baseline incurs spoilage.
        normal_sea_time = distance_km / self.speeds["sea"]
        
        def calc_spoilage(total_time_hours):
            # Excess time
            excess_hours = max(0, total_time_hours - normal_sea_time)
            excess_half_days = excess_hours / 12.0
            if excess_half_days <= 0:
                return 0.0
            
            # Loss = Value * (1 - (1-rate)^half_days)
            remaining_ratio = pow(1 - spoilage_rate, excess_half_days)
            return cargo_value * (1 - remaining_ratio)

        # --- Option 1: Wait & Sea ---
        sea_time = distance_km / self.speeds["sea"]
        sea_cost = distance_km * self.costs["sea"]
        
        # Uncertainty
        time_exp = clamp(sea_time + current_delay_hours)
        time_opt = clamp((sea_time * 0.95) + current_delay_hours)
        time_pess = clamp((sea_time * 1.15) + current_delay_hours)
        
        options.append({
            "route_type": "Wait & Sea",
            "time_hours": {
                "expected": time_exp,
                "optimistic": time_opt,
                "pessimistic": time_pess
            },
            "cost_usd": {
                "expected": clamp(sea_cost + calc_spoilage(time_exp)),
                "optimistic": clamp((sea_cost * 0.95) + calc_spoilage(time_opt)),
                "pessimistic": clamp((sea_cost * 1.15) + calc_spoilage(time_pess))
            },
            "description": "Wait out the disruption and continue by sea."
        })
        
        # --- Option 2: Land (Truck) ---
        truck_time = distance_km / self.speeds["land_truck"]
        truck_cost = distance_km * self.costs["land_truck"]
        
        # Uncertainty
        time_exp = clamp(truck_time)
        time_opt = clamp(truck_time * 0.90)
        time_pess = clamp(truck_time * 1.25)
        
        options.append({
            "route_type": "Land (Truck)",
            "time_hours": {
                "expected": time_exp,
                "optimistic": time_opt,
                "pessimistic": time_pess
            },
            "cost_usd": {
                "expected": clamp(truck_cost + calc_spoilage(time_exp)),
                "optimistic": clamp((truck_cost * 0.90) + calc_spoilage(time_opt)),
                "pessimistic": clamp((truck_cost * 1.25) + calc_spoilage(time_pess))
            },
            "description": "Offload and transport by truck."
        })
        
        # --- Option 3: Land (Train) ---
        train_time = distance_km / self.speeds["land_train"]
        train_cost = distance_km * self.costs["land_train"]
        
        # Uncertainty
        time_exp = clamp(train_time)
        time_opt = clamp(train_time * 0.95)
        time_pess = clamp(train_time * 1.10)
        
        options.append({
            "route_type": "Land (Train)",
            "time_hours": {
                "expected": time_exp,
                "optimistic": time_opt,
                "pessimistic": time_pess
            },
            "cost_usd": {
                "expected": clamp(train_cost + calc_spoilage(time_exp)),
                "optimistic": clamp((train_cost * 0.95) + calc_spoilage(time_opt)),
                "pessimistic": clamp((train_cost * 1.10) + calc_spoilage(time_pess))
            },
            "description": "Offload and transport by rail."
        })
         
        return options

    def estimate_new_order_cost(self, product_value):
        """
        Estimates cost of initiating a new order from a different provider.
        """
        # Heuristic: New order usually costs premium + rush shipping.
        # Say 1.2x product value + flat fee.
        premium_factor = 1.2
        setup_fee = 5000
        
        return {
            "estimated_cost": (product_value * premium_factor) + setup_fee,
            "description": "Sourcing from backup supplier (20% premium + setup fee)."
        }
