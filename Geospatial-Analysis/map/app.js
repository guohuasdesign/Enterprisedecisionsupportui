(function () {
  'use strict';

  var DATA_BASE = '../data/';
  var map;
  var shipsLayer, incidentsLayer, lanesLayer;

  function toLatLng(c) {
    return c && c.length >= 2 ? [Number(c[1]), Number(c[0])] : null;
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  function initMap() {
    map = L.map('map', { center: [25, 20], zoom: 3 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    lanesLayer = L.layerGroup().addTo(map);
    incidentsLayer = L.layerGroup().addTo(map);
    shipsLayer = L.layerGroup().addTo(map);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  var shipIcon = L.divIcon({
    className: 'ship-marker',
    html: "<div style=\"width:28px;height:28px;background:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%231e40af%27%3E%3Cpath d=%27M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78-.12-.24-.32-.42-.57-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-1.99.9-1.99 2v4.62l-10.31 2.42c-.25.06-.45.26-.57.5-.12.24-.14.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z%27/%3E%3C/svg%3E') center/contain no-repeat;\"></div>",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  function addShips(geojson) {
    if (!geojson || !geojson.features) return;
    var bounds = L.latLngBounds();
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
      bounds.extend(latlng);
    });
    incidentsLayer.eachLayer(function (l) {
      if (l.getBounds) bounds.extend(l.getBounds()); else if (l.getLatLng) bounds.extend(l.getLatLng());
    });
    lanesLayer.eachLayer(function (l) {
      if (l.getBounds) bounds.extend(l.getBounds());
    });
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.15));
  }

  var incidentIcon = L.divIcon({
    className: 'incident-marker-wrap',
    html: '<div class="incident-marker"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

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

  var laneStyle = { color: '#0c4a6e', weight: 3, opacity: 0.95, dashArray: '5, 10' };

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

  function run() {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }
    initMap();

    Promise.all([
      fetchJson(DATA_BASE + 'shipping_data.geojson'),
      fetchJson(DATA_BASE + 'incident_data.geojson'),
      fetchJson(DATA_BASE + 'Shipping_Lanes_v1.geojson')
    ]).then(function (res) {
      addLanes(res[2]);
      addIncidents(res[1]);
      addShips(res[0]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
