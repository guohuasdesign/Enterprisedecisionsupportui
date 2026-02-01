"""
When a ship's route intersects an incident buffer, compute an alternative route
that avoids the buffer. Writes data/alternative_routes.geojson.

Run from project root: python geospatial_analysis/alternative_routes.py
Requires: routes.geojson, incident_buffers.geojson, route_calculator (same inputs).
"""
import json
import os

import networkx as nx
from shapely.geometry import LineString, shape

# Reuse route_calculator graph and path logic
from route_calculator import (
    add_off_network_point,
    build_lane_graph,
    connect_disconnected_components,
    expand_path_to_geometry,
    snap_to_network,
)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")


def load_buffers_as_polygons(incident_buffers_geojson):
    """Return list of shapely polygons from incident_buffers GeoJSON."""
    polys = []
    for f in incident_buffers_geojson.get("features") or []:
        geom = f.get("geometry")
        if not geom:
            continue
        try:
            shp = shape(geom)
            if shp.is_valid and not shp.is_empty:
                polys.append(shp)
        except Exception:
            continue
    return polys


def route_intersects_buffers(route_coords, buffer_polygons):
    """True if the route LineString intersects any incident buffer."""
    if not route_coords or len(route_coords) < 2 or not buffer_polygons:
        return False
    line = LineString(route_coords)
    if not line.is_valid:
        return False
    for poly in buffer_polygons:
        if line.intersects(poly):
            return True
    return False


def edge_intersects_buffers(edge_geom, buffer_polygons):
    """True if edge segment passes through a buffer (midpoint inside or line intersects).
    Removing only such edges keeps the graph connected so alternative paths can be found."""
    if not edge_geom or len(edge_geom) < 2 or not buffer_polygons:
        return False
    line = LineString(edge_geom)
    if not line.is_valid:
        return False
    mid = line.interpolate(0.5, normalized=True)
    for poly in buffer_polygons:
        if poly.contains(mid) or poly.intersects(line):
            return True
    return False


def main():
    lanes_path = os.path.join(DATA_DIR, "Shipping_Lanes_v1.geojson")
    ships_path = os.path.join(DATA_DIR, "shipping_data.geojson")
    dest_path = os.path.join(DATA_DIR, "destinations.geojson")
    routes_path = os.path.join(DATA_DIR, "routes.geojson")
    buffers_path = os.path.join(DATA_DIR, "incident_buffers.geojson")
    out_path = os.path.join(DATA_DIR, "alternative_routes.geojson")

    if not os.path.isfile(routes_path):
        print("Run route_calculator.py first to generate routes.geojson")
        return
    if not os.path.isfile(buffers_path):
        print("Run incident_buffers.py first to generate incident_buffers.geojson")
        return

    with open(lanes_path, "r", encoding="utf-8") as f:
        lanes = json.load(f)
    with open(ships_path, "r", encoding="utf-8") as f:
        ships = json.load(f)
    with open(dest_path, "r", encoding="utf-8") as f:
        dests = json.load(f)
    with open(routes_path, "r", encoding="utf-8") as f:
        routes = json.load(f)
    with open(buffers_path, "r", encoding="utf-8") as f:
        incident_buffers = json.load(f)

    buffer_polygons = load_buffers_as_polygons(incident_buffers)
    if not buffer_polygons:
        print("No incident buffers; nothing to avoid. Written empty alternative_routes.geojson")
        fc = {"type": "FeatureCollection", "features": []}
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(fc, f, indent=2)
        return

    # Bbox and build full graph (same as route_calculator)
    all_lons = [c[0] for f in ships.get("features") or [] for c in [f.get("geometry", {}).get("coordinates") or []] if len(c) >= 2]
    all_lats = [c[1] for f in ships.get("features") or [] for c in [f.get("geometry", {}).get("coordinates") or []] if len(c) >= 2]
    for f in dests.get("features") or []:
        c = (f.get("geometry") or {}).get("coordinates")
        if c and len(c) >= 2:
            all_lons.append(c[0])
            all_lats.append(c[1])
    pad = 15.0
    bbox = (min(all_lons) - pad, min(all_lats) - pad, max(all_lons) + pad, max(all_lats) + pad) if all_lons else None

    G, edge_geoms = build_lane_graph(lanes, bbox=bbox)
    connect_disconnected_components(G, edge_geoms)

    # Destination on full graph
    dest_features = dests.get("features") or []
    dest_point = None
    if dest_features:
        g = dest_features[0].get("geometry")
        if g and g.get("type") == "Point" and g.get("coordinates"):
            c = g["coordinates"]
            dest_point = (float(c[0]), float(c[1]))
    if not dest_point:
        print("No destination point found")
        return
    dest_name = (dest_features[0].get("properties") or {}).get("name") or "Hamburg"
    dest_node, _ = snap_to_network(G, edge_geoms, dest_point[0], dest_point[1])
    if dest_node is None:
        dest_node_id = "dest"
        add_off_network_point(G, edge_geoms, dest_point[0], dest_point[1], dest_node_id)
    else:
        dest_node_id = dest_node

    # Penalty-based: keep graph connected but make buffer-intersecting edges very expensive
    # so shortest path will avoid buffers when possible (alternative route)
    BUFFER_PENALTY = 100.0  # multiply weight so path prefers going around
    G_penalty = G.copy()
    edge_geoms_penalty = dict(edge_geoms)
    for (u, v) in G_penalty.edges():
        geom = edge_geoms_penalty.get((u, v)) or edge_geoms_penalty.get((v, u))
        if geom and edge_intersects_buffers(geom, buffer_polygons):
            w = G_penalty[u][v].get("weight", 1)
            G_penalty[u][v]["weight"] = w * BUFFER_PENALTY

    route_features = routes.get("features") or []
    ship_features = ships.get("features") or []
    vessel_to_ship = {(f.get("properties") or {}).get("vessel_name"): f for f in ship_features if (f.get("properties") or {}).get("vessel_name")}

    alt_features = []
    for route_f in route_features:
        geom = route_f.get("geometry")
        if not geom or geom.get("type") != "LineString" or not geom.get("coordinates"):
            continue
        coords = geom["coordinates"]
        if not route_intersects_buffers(coords, buffer_polygons):
            continue
        props = route_f.get("properties") or {}
        vessel = props.get("vessel_name") or "Ship"
        ship_feat = vessel_to_ship.get(vessel)
        if not ship_feat or not ship_feat.get("geometry") or ship_feat["geometry"].get("type") != "Point":
            continue
        ship_coords = ship_feat["geometry"]["coordinates"]
        lon, lat = float(ship_coords[0]), float(ship_coords[1])

        G_work = G_penalty.copy()
        edge_geoms_work = dict(edge_geoms_penalty)
        ship_node_id = "ship_alt_" + vessel.replace(" ", "_")
        if add_off_network_point(G_work, edge_geoms_work, lon, lat, ship_node_id) is None:
            continue
        try:
            path = nx.shortest_path(G_work, ship_node_id, dest_node_id, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue
        route_coords_out = expand_path_to_geometry(G_work, edge_geoms_work, path)
        if not route_coords_out or len(route_coords_out) < 2:
            continue
        alt_features.append({
            "type": "Feature",
            "properties": {
                "vessel_name": vessel,
                "origin": props.get("origin"),
                "destination": dest_name,
                "route_type": "alternative",
                "reason": "incident_avoidance",
            },
            "geometry": {"type": "LineString", "coordinates": route_coords_out},
        })

    fc = {"type": "FeatureCollection", "features": alt_features}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2)
    print("Written:", out_path, "with", len(alt_features), "alternative route(s).")


if __name__ == "__main__":
    main()
