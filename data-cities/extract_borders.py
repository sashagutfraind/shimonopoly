#!/usr/bin/env python3
"""
Extract borders from countries_features.geojson and convert to borders.json format
"""

import json

def simplify_coordinates(coords, tolerance=0.5):
    """Simplify coordinate list by removing points that are too close together"""
    if len(coords) < 3:
        return coords
    
    simplified = [coords[0]]
    for i in range(1, len(coords) - 1):
        prev = simplified[-1]
        curr = coords[i]
        # Calculate distance
        dist = ((curr[0] - prev[0])**2 + (curr[1] - prev[1])**2)**0.5
        if dist > tolerance:
            simplified.append(curr)
    simplified.append(coords[-1])
    return simplified

def compute_bbox(points):
    """Compute a lat/lon bounding box for a list of [lat, lon] points"""
    lats = [p[0] for p in points]
    lons = [p[1] for p in points]
    return {
        "minLat": min(lats), "maxLat": max(lats),
        "minLon": min(lons), "maxLon": max(lons)
    }

def min_point_distance_deg(points_a, points_b, step_a=3, step_b=5):
    """
    Approximate minimum distance in degrees between two point sets, i.e. how
    close their nearest edges actually come to touching. Subsampled for speed
    since region boundaries can have thousands of points.
    """
    sample_a = points_a[::step_a] or points_a
    sample_b = points_b[::step_b] or points_b
    best = float("inf")
    for pa in sample_a:
        for pb in sample_b:
            d = ((pa[0] - pb[0]) ** 2 + (pa[1] - pb[1]) ** 2) ** 0.5
            if d < best:
                best = d
    return best

def filter_isolated_regions(regions, max_distance_deg=5):
    """
    Drop far-flung outlier regions (e.g. Alaska/Hawaii/overseas territories for
    the USA) that are geographically separated from the country's main landmass,
    so a country's map isn't dominated by empty ocean. Keeps the largest region
    (by boundary point count, a proxy for the main contiguous landmass) plus any
    region whose nearest point comes within max_distance_deg of it. Distance is
    measured edge-to-edge (not centroid-to-bbox) so that coastal fragments
    genuinely touching/hugging the mainland (barrier islands, bay islands) are
    kept, while territories separated by open ocean or another country are not.
    """
    if len(regions) <= 1:
        return regions

    main_region = max(regions, key=lambda r: len(r["points"]))

    kept = []
    for region in regions:
        if region is main_region:
            kept.append(region)
            continue
        dist = min_point_distance_deg(region["points"], main_region["points"])
        if dist <= max_distance_deg:
            kept.append(region)
        else:
            print(f"  Dropping isolated region '{region['name']}' "
                  f"({dist:.1f} deg from main landmass)")
    return kept

def bounds_from_regions(regions, padding=1.0):
    """Compute lat/lon bounds covering all given regions, with a small padding"""
    all_points = [p for r in regions for p in r["points"]]
    bbox = compute_bbox(all_points)
    return {
        "minLat": bbox["minLat"] - padding,
        "maxLat": bbox["maxLat"] + padding,
        "minLon": bbox["minLon"] - padding,
        "maxLon": bbox["maxLon"] + padding
    }

def extract_polygon_coords(geometry):
    """Extract coordinates from a polygon or multipolygon geometry"""
    all_coords = []
    
    if geometry['type'] == 'Polygon':
        # Polygon has one outer ring (and possibly holes)
        # We only take the outer ring (first element)
        coords = geometry['coordinates'][0]
        # Convert from [lon, lat] to [lat, lon]
        coords = [[lat, lon] for lon, lat in coords]
        all_coords.append(simplify_coordinates(coords, tolerance=0.1))
    
    elif geometry['type'] == 'MultiPolygon':
        # MultiPolygon has multiple polygons
        for polygon in geometry['coordinates']:
            # Each polygon's outer ring
            coords = polygon[0]
            # Convert from [lon, lat] to [lat, lon]
            coords = [[lat, lon] for lon, lat in coords]
            simplified = simplify_coordinates(coords, tolerance=0.1)
            # Only include if it has enough points
            if len(simplified) > 10:
                all_coords.append(simplified)
    
    return all_coords

def main():
    # Read the geojson file
    with open('../game/countries_features.geojson', 'r') as f:
        data = json.load(f)
    
    # Extract borders for different countries
    usa_regions = []
    iran_regions = []
    israel_regions = []
    world_regions = []
    
    for feature in data['features']:
        name = feature['properties']['name']
        geometry = feature['geometry']
        
        # Extract coordinates
        coords_list = extract_polygon_coords(geometry)
        
        if name == "United States of America":
            print(f"Found USA with {len(coords_list)} regions")
            for i, coords in enumerate(coords_list):
                usa_regions.append({
                    "name": f"USA Region {i+1}",
                    "points": coords
                })
        
        if name == "Iran":
            print(f"Found Iran with {len(coords_list)} regions")
            for i, coords in enumerate(coords_list):
                iran_regions.append({
                    "name": f"Iran Region {i+1}",
                    "points": coords
                })
        
        if name == "Israel":
            print(f"Found Israel with {len(coords_list)} regions")
            for i, coords in enumerate(coords_list):
                israel_regions.append({
                    "name": f"Israel Region {i+1}",
                    "points": coords
                })
        
        # Add all countries to world (islands and overseas territories are kept
        # here since the world map already spans the whole globe)
        for i, coords in enumerate(coords_list):
            region_name = name if len(coords_list) == 1 else f"{name} {i+1}"
            world_regions.append({
                "name": region_name,
                "points": coords
            })

    # Drop far-flung islands/territories (e.g. Alaska, Hawaii) so a country's
    # own map isn't dominated by empty ocean, then derive bounds from what's left
    print("Filtering isolated regions for USA:")
    usa_regions = filter_isolated_regions(usa_regions)
    print("Filtering isolated regions for Iran:")
    iran_regions = filter_isolated_regions(iran_regions)
    print("Filtering isolated regions for Israel:")
    israel_regions = filter_isolated_regions(israel_regions)

    # Create borders.json structure
    borders = {
        "usa": {
            "bounds": bounds_from_regions(usa_regions),
            "regions": usa_regions
        },
        "iran": {
            "bounds": bounds_from_regions(iran_regions),
            "regions": iran_regions
        },
        "israel": {
            "bounds": bounds_from_regions(israel_regions),
            "regions": israel_regions
        },
        "world": {
            "bounds": {
                "minLat": -60,
                "maxLat": 85,
                "minLon": -180,
                "maxLon": 180
            },
            "regions": world_regions
        }
    }
    
    # Write to borders.json
    with open('../game/borders.json', 'w') as f:
        json.dump(borders, f, separators=(',', ':'))
    
    print(f"Extracted {len(usa_regions)} USA regions")
    print(f"Extracted {len(iran_regions)} Iran regions")
    print(f"Extracted {len(israel_regions)} Israel regions")
    print(f"Extracted {len(world_regions)} world regions")
    print("Borders written to ../game/borders.json")

if __name__ == '__main__':
    main()
