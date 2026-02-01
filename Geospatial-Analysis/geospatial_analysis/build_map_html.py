"""
Build a self-contained map HTML with data embedded. No fetch = no CORS.
Run from project root: python geospatial_analysis/build_map_html.py
Writes map/shipping_map.html. Open that file directly (file://) or via http.
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")
MAP_DIR = os.path.join(BASE, "map")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    ships = load_json(os.path.join(DATA_DIR, "shipping_data.geojson"))
    incidents = load_json(os.path.join(DATA_DIR, "incident_data.geojson"))
    lanes = load_json(os.path.join(DATA_DIR, "Shipping_Lanes_v1.geojson"))
    routes_path = os.path.join(DATA_DIR, "routes.geojson")
    routes = load_json(routes_path) if os.path.isfile(routes_path) else {"type": "FeatureCollection", "features": []}
    ports_path = os.path.join(DATA_DIR, "hamburg_ports.geojson")
    ports = load_json(ports_path) if os.path.isfile(ports_path) else {"type": "FeatureCollection", "features": []}
    buffers_path = os.path.join(DATA_DIR, "incident_buffers.geojson")
    buffers = load_json(buffers_path) if os.path.isfile(buffers_path) else {"type": "FeatureCollection", "features": []}
    alt_routes_path = os.path.join(DATA_DIR, "alternative_routes.geojson")
    alt_routes = load_json(alt_routes_path) if os.path.isfile(alt_routes_path) else {"type": "FeatureCollection", "features": []}

    with open(os.path.join(MAP_DIR, "style.css"), "r", encoding="utf-8") as f:
        css = f.read()

    ships_js = json.dumps(ships)
    incidents_js = json.dumps(incidents)
    lanes_js = json.dumps(lanes)
    routes_js = json.dumps(routes)
    ports_js = json.dumps(ports)
    buffers_js = json.dumps(buffers)
    alt_routes_js = json.dumps(alt_routes)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ships and Incidents Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <style>
""" + css + """
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-title">Ships and Incidents Map</div>
  <div class="legend">
    <div class="legend-title">Legend</div>
    <div><span class="legend-icon legend-ship"></span> Ships</div>
    <div><span class="legend-dot legend-incident"></span> Incidents</div>
    <div><span class="legend-swatch legend-buffer"></span> Incident buffer</div>
    <div><span class="legend-line legend-lane"></span> Shipping lanes</div>
    <div><span class="legend-line legend-route"></span> Ship routes</div>
    <div><span class="legend-line legend-alt-route"></span> Alternative ship routes</div>
    <div><span class="legend-dot legend-port"></span> Hamburg ports</div>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
(function () {
  'use strict';
  var map, shipsLayer, incidentsLayer, lanesLayer, routesLayer, portsLayer, altRoutesLayer;
  var buffersLayer;
  var SHIPS_DATA = """ + ships_js + """;
  var INCIDENTS_DATA = """ + incidents_js + """;
  var LANES_DATA = """ + lanes_js + """;
  var ROUTES_DATA = """ + routes_js + """;
  var PORTS_DATA = """ + ports_js + """;
  var INCIDENT_BUFFERS_DATA = """ + buffers_js + """;
  var ALT_ROUTES_DATA = """ + alt_routes_js + """;

  function toLatLng(c) {
    return c && c.length >= 2 ? [Number(c[1]), Number(c[0])] : null;
  }

  function initMap() {
    var hamburg = [53.551085, 9.993682];
    map = L.map('map', { center: hamburg, zoom: 3, zoomControl: false });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: true }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
    lanesLayer = L.layerGroup().addTo(map);
    routesLayer = L.layerGroup().addTo(map);
    altRoutesLayer = L.layerGroup().addTo(map);
    buffersLayer = L.layerGroup().addTo(map);
    incidentsLayer = L.layerGroup().addTo(map);
    shipsLayer = L.layerGroup().addTo(map);
    portsLayer = L.layerGroup().addTo(map);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  var shipIcon = L.divIcon({
    className: 'ship-marker',
    html: "<div style=\\"width:28px;height:28px;background:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%231e40af%27%3E%3Cpath d=%27M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78-.12-.24-.32-.42-.57-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-1.99.9-1.99 2v4.62l-10.31 2.42c-.25.06-.45.26-.57.5-.12.24-.14.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z%27/%3E%3C/svg%3E') center/contain no-repeat;\\"></div>",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  function addShips(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || g.type !== 'Point' || !g.coordinates) return;
      var latlng = toLatLng(g.coordinates);
      if (!latlng) return;
      var p = f.properties || {};
      var name = p.vessel_name || 'Ship';
      var popup = '<b>' + escapeHtml(name) + '</b><br>' + escapeHtml(p.origin || '') + ' → ' + escapeHtml(p.destination || '');
      if (p.status) popup += '<br><span style="color:#666;">' + escapeHtml(p.status) + '</span>';
      L.marker(latlng, { icon: shipIcon }).bindPopup(popup).addTo(shipsLayer);
    });
  }

  var incidentIcon = L.divIcon({
    className: 'incident-marker-wrap',
    html: '<div class="incident-marker"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  var bufferStyle = { color: '#b91c1c', weight: 2, opacity: 0.8, fillColor: '#ef4444', fillOpacity: 0.2 };

  function addIncidentBuffers(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || !g.coordinates) return;
      var p = f.properties || {};
      var label = '200 nm buffer – ' + (p.incident_id || p.id || 'Incident');
      if (g.type === 'Polygon' && g.coordinates && g.coordinates.length) {
        var ring = g.coordinates[0];
        var latlngs = ring.map(toLatLng).filter(Boolean);
        if (latlngs.length >= 3) L.polygon(latlngs, bufferStyle).bindPopup('<b>' + escapeHtml(label) + '</b>').addTo(buffersLayer);
      } else if (g.type === 'MultiPolygon') {
        g.coordinates.forEach(function (ring) {
          if (!ring || !ring[0]) return;
          var latlngs = ring[0].map(toLatLng).filter(Boolean);
          if (latlngs.length >= 3) L.polygon(latlngs, bufferStyle).bindPopup('<b>' + escapeHtml(label) + '</b>').addTo(buffersLayer);
        });
      }
    });
  }

  function addIncidents(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || g.type !== 'Point' || !g.coordinates) return;
      var latlng = toLatLng(g.coordinates);
      if (!latlng) return;
      var p = f.properties || {};
      var label = p.title || p.id || 'Incident';
      var kind = p.feature_kind === 'vessel' ? 'Vessel' : 'Event';
      var popup = '<b>' + escapeHtml(label) + '</b><br><span style="color:#666;">' + escapeHtml(kind) + '</span>';
      L.marker(latlng, { icon: incidentIcon }).bindPopup(popup).addTo(incidentsLayer);
    });
  }

  var laneStyle = { color: '#38bdf8', weight: 3, opacity: 0.9, dashArray: '5, 10' };
  var routeStyle = { color: '#059669', weight: 4, opacity: 0.9 };
  var altRouteStyle = { color: '#ea580c', weight: 4, opacity: 0.9, dashArray: '8, 8' };

  function addRoutes(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || g.type !== 'LineString' || !g.coordinates || g.coordinates.length < 2) return;
      var latlngs = g.coordinates.map(toLatLng).filter(Boolean);
      if (latlngs.length < 2) return;
      var p = f.properties || {};
      var label = (p.vessel_name || 'Ship') + ': ' + (p.origin || '') + ' → ' + (p.destination || '');
      L.polyline(latlngs, routeStyle).bindPopup('<b>' + escapeHtml(label) + '</b>').addTo(routesLayer);
    });
  }

  function addAltRoutes(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || g.type !== 'LineString' || !g.coordinates || g.coordinates.length < 2) return;
      var latlngs = g.coordinates.map(toLatLng).filter(Boolean);
      if (latlngs.length < 2) return;
      var p = f.properties || {};
      var label = (p.vessel_name || 'Ship') + ' (alternative): ' + (p.origin || '') + ' → ' + (p.destination || '');
      if (p.reason) label += '<br><span style="color:#666;">' + escapeHtml(p.reason) + '</span>';
      L.polyline(latlngs, altRouteStyle).bindPopup('<b>' + escapeHtml(label) + '</b>').addTo(altRoutesLayer);
    });
  }

  function addLanes(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || !g.coordinates) return;
      var lines = g.type === 'LineString' ? [g.coordinates] : (g.type === 'MultiLineString' ? g.coordinates : []);
      lines.forEach(function (line) {
        if (!Array.isArray(line) || line.length < 2) return;
        var latlngs = line.map(toLatLng).filter(Boolean);
        if (latlngs.length >= 2) L.polyline(latlngs, laneStyle).addTo(lanesLayer);
      });
    });
  }

  var portIcon = L.divIcon({
    className: 'port-marker',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#7dd3fc;border:2px solid #38bdf8;box-sizing:border-box;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  function addPorts(geojson) {
    if (!geojson || !geojson.features) return;
    geojson.features.forEach(function (f) {
      var g = f.geometry;
      if (!g || g.type !== 'Point' || !g.coordinates) return;
      var latlng = toLatLng(g.coordinates);
      if (!latlng) return;
      var p = f.properties || {};
      var name = p.name || 'Port';
      var popup = '<b>' + escapeHtml(name) + '</b>';
      L.marker(latlng, { icon: portIcon }).bindPopup(popup).addTo(portsLayer);
    });
  }

  function fitMapToShips() {
    var bounds = L.latLngBounds();
    (SHIPS_DATA.features || []).forEach(function (f) {
      var c = f.geometry && f.geometry.coordinates;
      if (c && c.length >= 2) bounds.extend([c[1], c[0]]);
    });
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }

  if (typeof L === 'undefined') { console.error('Leaflet not loaded'); return; }
  initMap();
  addLanes(LANES_DATA);
  addRoutes(ROUTES_DATA);
  addAltRoutes(ALT_ROUTES_DATA);
  addIncidentBuffers(INCIDENT_BUFFERS_DATA);
  addIncidents(INCIDENTS_DATA);
  addShips(SHIPS_DATA);
  addPorts(PORTS_DATA);
  fitMapToShips();
})();
  </script>
</body>
</html>
"""
    out = os.path.join(MAP_DIR, "shipping_map.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("Written:", out)
    print("Open shipping_map.html directly (double-click) — no server, no CORS.")


if __name__ == "__main__":
    main()
