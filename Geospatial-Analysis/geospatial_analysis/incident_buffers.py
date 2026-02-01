"""
Create 200 nautical mile (nm) buffers around every incident point.
Writes data/incident_buffers.geojson (polygons in WGS84).

Run from project root: python geospatial_analysis/incident_buffers.py
"""
import json
import os

from shapely.geometry import Point, shape, mapping
from shapely.ops import transform
import pyproj

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")
NM_TO_M = 1852.0
BUFFER_NM = 200.0
BUFFER_M = BUFFER_NM * NM_TO_M  # 370400 m


def get_utm_proj(lon, lat):
    """Return a pyproj transformer (lon,lat -> x,y) for the UTM zone containing (lon, lat)."""
    zone = int((lon + 180) / 6) + 1
    south = lat < 0
    utm = pyproj.CRS(proj="utm", zone=zone, ellps="WGS84", south=south)
    wgs84 = pyproj.CRS("EPSG:4326")
    return pyproj.Transformer.from_crs(wgs84, utm, always_xy=True)


def buffer_point_wgs84(lon, lat, radius_m):
    """Buffer a WGS84 point by radius_m meters; return polygon in WGS84."""
    point = Point(lon, lat)
    proj = get_utm_proj(lon, lat)
    to_utm = lambda x, y: proj.transform(x, y)
    from_utm = lambda x, y: proj.transform(x, y, direction=pyproj.enums.TransformDirection.INVERSE)
    point_utm = transform(to_utm, point)
    buffered = point_utm.buffer(radius_m)
    polygon_wgs84 = transform(from_utm, buffered)
    return polygon_wgs84


def main():
    incidents_path = os.path.join(DATA_DIR, "incident_data.geojson")
    out_path = os.path.join(DATA_DIR, "incident_buffers.geojson")

    with open(incidents_path, "r", encoding="utf-8") as f:
        incidents = json.load(f)

    features = []
    for feat in incidents.get("features") or []:
        geom = feat.get("geometry")
        if not geom or geom.get("type") != "Point" or not geom.get("coordinates"):
            continue
        coords = geom["coordinates"]
        lon, lat = float(coords[0]), float(coords[1])
        props = dict(feat.get("properties") or {})
        props["buffer_nm"] = BUFFER_NM
        props["incident_id"] = props.get("id")

        poly = buffer_point_wgs84(lon, lat, BUFFER_M)
        if poly.is_empty:
            continue
        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": mapping(poly),
        })

    fc = {"type": "FeatureCollection", "features": features}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2)
    print("Written:", out_path, "with", len(features), "buffer(s).")


if __name__ == "__main__":
    main()
