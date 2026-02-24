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

def extract_polygon_coords(geometry):
    """Extract coordinates from a polygon or multipolygon geometry"""
    all_coords = []
    
    if geometry['type'] == 'Polygon':
        # Polygon has one outer ring (and possibly holes)
        # We only take the outer ring (first element)
        coords = geometry['coordinates'][0]
        # Convert from [lon, lat] to [lat, lon]
        coords = [[lat, lon] for lon, lat in coords]
        all_coords.append(simplify_coordinates(coords, tolerance=1.0))
    
    elif geometry['type'] == 'MultiPolygon':
        # MultiPolygon has multiple polygons
        for polygon in geometry['coordinates']:
            # Each polygon's outer ring
            coords = polygon[0]
            # Convert from [lon, lat] to [lat, lon]
            coords = [[lat, lon] for lon, lat in coords]
            simplified = simplify_coordinates(coords, tolerance=1.0)
            # Only include if it has enough points
            if len(simplified) > 10:
                all_coords.append(simplified)
    
    return all_coords

def main():
    # Read the geojson file
    with open('../game/countries_features.geojson', 'r') as f:
        data = json.load(f)
    
    # Extract USA borders
    usa_regions = []
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
        
        # Add all countries to world
        for i, coords in enumerate(coords_list):
            region_name = name if len(coords_list) == 1 else f"{name} {i+1}"
            world_regions.append({
                "name": region_name,
                "points": coords
            })
    
    # Create borders.json structure
    borders = {
        "usa": {
            "bounds": {
                "minLat": 24,
                "maxLat": 72,
                "minLon": -180,
                "maxLon": -65
            },
            "regions": usa_regions
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
        json.dump(borders, f, indent=2)
    
    print(f"Extracted {len(usa_regions)} USA regions")
    print(f"Extracted {len(world_regions)} world regions")
    print("Borders written to ../game/borders.json")

if __name__ == '__main__':
    main()
