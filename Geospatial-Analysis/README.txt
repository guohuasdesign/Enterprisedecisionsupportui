Geospatial analysis scripts. Data is read from and written to the project data/ folder.

Scripts
-------
  build_map_html.py
    Reads data/shipping_data.geojson, incident_data.geojson, Shipping_Lanes_v1.geojson.
    Writes map/shipping_map.html with data embedded (no fetch, no CORS).
    Run from project root:  python geospatial_analysis/build_map_html.py

  extract_origins_destinations.py
    Reads data/shipping_data.geojson; writes data/origins.geojson and
    data/destinations.geojson from origin/destination columns.

Run from project root (with venv active):
  python geospatial_analysis/build_map_html.py
