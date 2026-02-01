# Geospatial Analysis

Shipping map with routes, incidents, Hamburg ports, incident buffers, and alternative ship routes.

## Setup

```bash
pip install -r requirements.txt
```

## Generate data & map

1. **Routes** (ships → Hamburg via shipping lanes):
   ```bash
   python geospatial_analysis/route_calculator.py
   ```

2. **Incident buffers** (200 nm around each incident):
   ```bash
   python geospatial_analysis/incident_buffers.py
   ```

3. **Alternative ship routes** (when a route intersects an incident buffer):
   ```bash
   python geospatial_analysis/alternative_routes.py
   ```

4. **Build map** (embeds all data into HTML):
   ```bash
   python geospatial_analysis/build_map_html.py
   ```

5. Open `map/shipping_map.html` in a browser.

## Contents

- **data/** – GeoJSON: ships, incidents, lanes, routes, alternative_routes, Hamburg ports, incident buffers
- **geospatial_analysis/** – Python scripts (route calculator, incident buffers, alternative routes, map builder)
- **map/** – Leaflet map (shipping_map.html, style.css)
