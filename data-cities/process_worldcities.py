#!/usr/bin/env python3
"""
Process kaggle_worldcities.csv to generate:
1. kaggle_worldcities.jsonl - all cities in JSONL format
2. kaggle_worldcities_top.jsonl - cities with population > 10M + biggest city per country if > 5M
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
    
    # Process for top cities
    top_cities = []
    country_biggest = defaultdict(lambda: {'name': '', 'population': 0})
    
    # Find cities with population > 10M and track biggest city per country
    for city in cities:
        pop_millions = city['population'] / 1000  # Convert thousands to millions
        
        # Add cities with population > 10M
        if pop_millions > 10:
            top_cities.append(city)
        
        # Track biggest city per country
        country = city['country']
        if city['population'] > country_biggest[country]['population']:
            country_biggest[country] = city
    
    # Add biggest city per country if population > 5M and not already in top_cities
    top_city_names = {city['name'] for city in top_cities}
    
    for country, city in country_biggest.items():
        pop_millions = city['population'] / 1000
        if pop_millions > 5 and city['name'] not in top_city_names:
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
    print(f"  - Cities with population > 10M: {sum(1 for c in top_cities if c['population'] / 1000 > 10)}")
    print(f"  - Biggest cities per country (5M-10M): {len(top_cities) - sum(1 for c in top_cities if c['population'] / 1000 > 10)}")


if __name__ == '__main__':
    process_worldcities()
