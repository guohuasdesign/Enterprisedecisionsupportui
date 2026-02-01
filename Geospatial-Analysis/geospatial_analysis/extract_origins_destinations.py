"""
Read origin and destination columns from shipping data; save to separate GeoJSON files.
Reads: data/shipping_data.geojson only.
Writes: data/origins.geojson, data/destinations.geojson (derived from shipping data).
Uses embedded port coordinates for known ports; unknown ports get placeholder [0, 0].
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")

# Known port coordinates [lon, lat] for ports that appear in shipping data (and common ports).
# Add more as needed; unknown ports will get [0, 0].
PORT_COORDS = {
    "Hamburg": [9.993682, 53.551085],
    "Shanghai": [121.4737, 31.2304],
    "Singapore": [103.8198, 1.2644],
    "Ningbo": [121.544, 29.8683],
    "Busan": [129.0756, 35.1028],
    "Colombo": [79.8482, 6.9271],
    "Rotterdam": [4.4777, 51.9225],
    "Antwerp": [4.4025, 51.2213],
    "Felixstowe": [1.3515, 51.9617],
    "Bremerhaven": [8.5767, 53.5396],
    "Jebel Ali": [55.0279, 24.9922],
    "Mundra": [69.7167, 22.8167],
}


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_geojson(path, fc):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2)


def main():
    ships_path = os.path.join(DATA_DIR, "shipping_data.geojson")
    ships_data = load_json(ships_path)

    origin_names = set()
    destination_names = set()
    for f in ships_data.get("features", []):
        p = f.get("properties") or {}
        if p.get("origin"):
            origin_names.add(p["origin"])
        if p.get("destination"):
            destination_names.add(p["destination"])

    crs = {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}

    def make_features(names):
        features = []
        for name in sorted(names):
            coords = PORT_COORDS.get(name, [0.0, 0.0])
            features.append({
                "type": "Feature",
                "properties": {"name": name, "type": "port"},
                "geometry": {"type": "Point", "coordinates": coords},
            })
        return features

    origins_path = os.path.join(DATA_DIR, "origins.geojson")
    save_geojson(origins_path, {
        "type": "FeatureCollection",
        "name": "origins",
        "crs": crs,
        "features": make_features(origin_names),
    })
    print("Written: %s (%d origins from shipping_data.origin)" % (origins_path, len(origin_names)))

    destinations_path = os.path.join(DATA_DIR, "destinations.geojson")
    save_geojson(destinations_path, {
        "type": "FeatureCollection",
        "name": "destinations",
        "crs": crs,
        "features": make_features(destination_names),
    })
    print("Written: %s (%d destinations from shipping_data.destination)" % (destinations_path, len(destination_names)))


if __name__ == "__main__":
    main()
