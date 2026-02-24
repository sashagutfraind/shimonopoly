#!/usr/bin/env python3
"""
Process kaggle_worldcities.csv to generate:
1. kaggle_worldcities.jsonl - all cities in JSONL format
2. kaggle_worldcities_top.jsonl - cities with population >= 2 million
"""

import csv
import json
from collections import defaultdict


def process_worldcities():
    # Read all cities from CSV
    cities = []
    
    with open('kaggle_worldcities.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip cities without population data
            if not row['population'] or row['population'] == '':
                continue
            
            try:
                population = float(row['population'])
                lat = float(row['lat'])
                lng = float(row['lng'])
                
                city = {
                    'name': row['city_ascii'],
                    'population': population / 1000,  # Convert to thousands like usmetros.jsonl
                    'lat': lat,
                    'lon': lng,
                    'country': row['country'],
                    'country_code': row['iso2']
                }
                cities.append(city)
            except (ValueError, KeyError):
                continue
    
    # Write all cities to kaggle_worldcities.jsonl
    with open('kaggle_worldcities.jsonl', 'w', encoding='utf-8') as f:
        for city in cities:
            # Keep country_code in output
            output_city = {k: v for k, v in city.items() if k != 'country'}
            f.write(json.dumps(output_city) + '\n')
    
    print(f"Generated kaggle_worldcities.jsonl with {len(cities)} cities")
    
    # Process for cities with population >= 2 million
    top_cities = []
    
    for city in cities:
        pop_millions = city['population'] / 1000  # Convert thousands to millions
        
        # Add cities with population >= 2M
        if pop_millions >= 2.0:
            top_cities.append(city)
    
    # Sort by population descending
    top_cities.sort(key=lambda x: x['population'], reverse=True)
    
    # Write top cities to kaggle_worldcities_top.jsonl
    with open('kaggle_worldcities_top.jsonl', 'w', encoding='utf-8') as f:
        for city in top_cities:
            # Keep country_code in output
            output_city = {k: v for k, v in city.items() if k != 'country'}
            f.write(json.dumps(output_city) + '\n')
    
    print(f"Generated kaggle_worldcities_top.jsonl with {len(top_cities)} cities")
    print(f"  - All cities have population >= 2 million")


if __name__ == '__main__':
    process_worldcities()
