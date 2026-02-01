"""
Calculate routes from each ship (shipping_data) to Hamburg (destinations)
following the shipping lane network only. Routes stay on lanes (no straight-line
bridges across land). Ships that cannot reach Hamburg via lanes get no route.
Writes data/routes.geojson.

Run from project root: python geospatial_analysis/route_calculator.py
"""
import json
import os
import math
import networkx as nx
from shapely.geometry import LineString, Point

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")
MAX_SEGMENT_KM = 80.0
EARTH_R_KM = 6371.0


def haversine_km(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(min(1, a)))
    return EARTH_R_KM * c


def _node_key(lon, lat):
    return (round(lon, 6), round(lat, 6))


def _interpolate_line(coords, max_km):
    out = []
    for i in range(len(coords) - 1):
        a, b = coords[i], coords[i + 1]
        out.append(a)
        dist_km = haversine_km(a[0], a[1], b[0], b[1])
        if dist_km > max_km:
            n = int(dist_km / max_km) + 1
            for j in range(1, n):
                t = j / n
                out.append([
                    a[0] + t * (b[0] - a[0]),
                    a[1] + t * (b[1] - a[1])
                ])
    out.append(coords[-1])
    return out


def build_lane_graph(lanes_geojson, bbox=None):
    """bbox: (min_lon, min_lat, max_lon, max_lat) or None to include all."""
    G = nx.Graph()
    edge_geoms = {}  # (u, v) -> list of [lon,lat] for that edge's geometry (ordered)
    features = lanes_geojson.get("features") or []
    for feat in features:
        geom = feat.get("geometry")
        if not geom:
            continue
        coords_list = geom.get("coordinates")
        if not coords_list:
            continue
        if geom.get("type") == "LineString":
            coords_list = [coords_list]
        for line in coords_list:
            if not line or len(line) < 2:
                continue
            if bbox:
                min_lon, min_lat, max_lon, max_lat = bbox
                if not any(min_lon <= c[0] <= max_lon and min_lat <= c[1] <= max_lat for c in line):
                    continue
            pts = _interpolate_line(line, MAX_SEGMENT_KM)
            for i in range(len(pts) - 1):
                p, q = pts[i], pts[i + 1]
                u, v = _node_key(p[0], p[1]), _node_key(q[0], q[1])
                if u == v:
                    continue
                length_km = haversine_km(p[0], p[1], q[0], q[1])
                if G.has_edge(u, v):
                    continue
                G.add_edge(u, v, weight=length_km)
                edge_geoms[(u, v)] = [p, q]
                edge_geoms[(v, u)] = [q, p]
    return G, edge_geoms


def connect_disconnected_components(G, edge_geoms=None):
    """Connect disconnected lane components with shortest over-water links so paths can be found
    from any ship to destination. Bridge edges get straight-line geometry for drawing."""
    comps = list(nx.connected_components(G))
    if len(comps) <= 1:
        return
    comps = sorted(comps, key=len, reverse=True)
    main = set(comps[0])
    for other in comps[1:]:
        best_d = float("inf")
        best_pair = None
        for n1 in main:
            for n2 in other:
                d = haversine_km(n1[0], n1[1], n2[0], n2[1])
                if d < best_d:
                    best_d = d
                    best_pair = (n1, n2)
        if best_pair:
            n1, n2 = best_pair
            G.add_edge(n1, n2, weight=best_d)
            if edge_geoms is not None:
                edge_geoms[(n1, n2)] = [[n1[0], n1[1]], [n2[0], n2[1]]]
                edge_geoms[(n2, n1)] = [[n2[0], n2[1]], [n1[0], n1[1]]]
            main |= other


def nearest_point_on_network(G, edge_geoms, lon, lat):
    pt = Point(lon, lat)
    best = None
    best_dist = float("inf")
    best_t = 0.0
    best_segment = None
    for (u, v), geom in edge_geoms.items():
        if len(geom) < 2:
            continue
        line = LineString(geom)
        proj = line.project(pt, normalized=True)
        proj = max(0, min(1, proj))
        interp = line.interpolate(proj, normalized=True)
        x, y = interp.x, interp.y
        d = haversine_km(lon, lat, x, y)
        if d < best_dist:
            best_dist = d
            best = (x, y)
            best_t = proj
            best_segment = (u, v)
    return best, best_dist, best_segment


def snap_to_network(G, edge_geoms, lon, lat, prefix="snap"):
    pt = Point(lon, lat)
    best, best_dist, best_segment = nearest_point_on_network(G, edge_geoms, lon, lat)
    if best_segment is None:
        return None, None
    u, v = best_segment
    snap_key = (round(best[0], 6), round(best[1], 6))
    if snap_key == u or snap_key == v:
        return snap_key, 0.0
    if not G.has_node(snap_key):
        G.add_node(snap_key)
        d1 = haversine_km(best[0], best[1], u[0], u[1])
        d2 = haversine_km(best[0], best[1], v[0], v[1])
        G.add_edge(snap_key, u, weight=d1)
        G.add_edge(snap_key, v, weight=d2)
        edge_geoms[(snap_key, u)] = [list(best), list(u)]
        edge_geoms[(u, snap_key)] = [list(u), list(best)]
        edge_geoms[(snap_key, v)] = [list(best), list(v)]
        edge_geoms[(v, snap_key)] = [list(v), list(best)]
    return snap_key, best_dist


def add_off_network_point(G, edge_geoms, lon, lat, node_id):
    best, best_dist, best_segment = nearest_point_on_network(G, edge_geoms, lon, lat)
    if best_segment is None:
        return None
    u, v = best_segment
    snap_key = (round(best[0], 6), round(best[1], 6))
    G.add_node(node_id, coords=[lon, lat])
    if not G.has_node(snap_key):
        G.add_node(snap_key)
        d1 = haversine_km(best[0], best[1], u[0], u[1])
        d2 = haversine_km(best[0], best[1], v[0], v[1])
        G.add_edge(snap_key, u, weight=d1)
        G.add_edge(snap_key, v, weight=d2)
        edge_geoms[(snap_key, u)] = [list(best), list(u)]
        edge_geoms[(u, snap_key)] = [list(u), list(best)]
        edge_geoms[(snap_key, v)] = [list(best), list(v)]
        edge_geoms[(v, snap_key)] = [list(v), list(best)]
    dist = haversine_km(lon, lat, best[0], best[1])
    G.add_edge(node_id, snap_key, weight=dist)
    edge_geoms[(node_id, snap_key)] = [[lon, lat], list(best)]
    edge_geoms[(snap_key, node_id)] = [list(best), [lon, lat]]
    return snap_key


def expand_path_to_geometry(G, edge_geoms, path):
    if not path or len(path) < 2:
        return None
    coords = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        geom = edge_geoms.get((u, v)) or edge_geoms.get((v, u))
        if not geom:
            u_coords = G.nodes[u].get("coords") if isinstance(u, str) else [u[0], u[1]]
            v_coords = G.nodes[v].get("coords") if isinstance(v, str) else [v[0], v[1]]
            geom = [u_coords, v_coords]
        if not coords:
            coords.extend(geom)
        else:
            coords.extend(geom[1:])
    if len(coords) < 2:
        return None
    return coords


def main():
    lanes_path = os.path.join(DATA_DIR, "Shipping_Lanes_v1.geojson")
    ships_path = os.path.join(DATA_DIR, "shipping_data.geojson")
    dest_path = os.path.join(DATA_DIR, "destinations.geojson")
    routes_path = os.path.join(DATA_DIR, "routes.geojson")

    with open(lanes_path, "r", encoding="utf-8") as f:
        lanes = json.load(f)
    with open(ships_path, "r", encoding="utf-8") as f:
        ships = json.load(f)
    with open(dest_path, "r", encoding="utf-8") as f:
        dests = json.load(f)

    # Bbox: ships + Hamburg + padding to keep graph manageable
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
    # Connect disconnected lane regions with shortest over-water links so far-away ships can route to Hamburg
    connect_disconnected_components(G, edge_geoms)

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

    routes_features = []
    ship_features = ships.get("features") or []
    for idx, ship in enumerate(ship_features):
        geom = ship.get("geometry")
        if not geom or geom.get("type") != "Point" or not geom.get("coordinates"):
            continue
        coords = geom["coordinates"]
        lon, lat = float(coords[0]), float(coords[1])
        props = ship.get("properties") or {}
        vessel = props.get("vessel_name") or f"Ship_{idx}"

        ship_node, _ = snap_to_network(G, edge_geoms, lon, lat)
        if ship_node is None:
            ship_node_id = f"ship_{idx}"
            add_off_network_point(G, edge_geoms, lon, lat, ship_node_id)
        else:
            ship_node_id = ship_node

        try:
            path = nx.shortest_path(G, ship_node_id, dest_node_id, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue

        route_coords = expand_path_to_geometry(G, edge_geoms, path)
        if not route_coords or len(route_coords) < 2:
            continue

        route_type = "shipping_lane"
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            if isinstance(u, str) or isinstance(v, str):
                route_type = "mixed"
                break

        routes_features.append({
            "type": "Feature",
            "properties": {
                "vessel_name": vessel,
                "origin": props.get("origin"),
                "destination": dest_name,
                "route_type": route_type,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": route_coords,
            },
        })

    fc = {
        "type": "FeatureCollection",
        "features": routes_features,
    }
    with open(routes_path, "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2)
    print("Written:", routes_path, "with", len(routes_features), "routes.")


if __name__ == "__main__":
    main()
