#!/usr/bin/env python3
"""Convert US metro CSV data to JSONL format for Shimonopoly game.

This script reads the usmetros.csv file and converts it to JSONL format
with fields: name, population (in thousands), lat, lon.
"""

import csv
import json
from pathlib import Path
from typing import Dict, Any


def convert_csv_to_jsonl(
    input_file: Path, output_file: Path, min_population: int = 0
) -> int:
    """Convert CSV city data to JSONL format.

    Args:
        input_file: Path to input CSV file
        output_file: Path to output JSONL file
        min_population: Minimum population threshold (default: 0)

    Returns:
        Number of cities written to output file
    """
    cities_written = 0

    with open(input_file, "r", encoding="utf-8") as csv_file, open(
        output_file, "w", encoding="utf-8"
    ) as jsonl_file:
        reader = csv.DictReader(csv_file)

        for row in reader:
            try:
                # Extract and convert fields
                population_total = int(row["population"])

                # Skip cities below minimum population
                if population_total < min_population:
                    continue

                # Convert population to thousands
                population_thousands = population_total / 1000

                city_data: Dict[str, Any] = {
                    "name": row["metro"],
                    "population": round(population_thousands, 1),
                    "lat": float(row["lat"]),
                    "lon": float(row["lng"]),
                }

                # Write as JSON line
                jsonl_file.write(json.dumps(city_data) + "\n")
                cities_written += 1

            except (ValueError, KeyError) as e:
                print(f"Warning: Skipping malformed record: {e}")
                continue

    return cities_written


def main() -> None:
    """Main entry point for the conversion script."""
    # Set up paths
    script_dir = Path(__file__).parent
    input_file = script_dir / "data-cities" / "usmetros.csv"
    output_file = script_dir / "cities.jsonl"

    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return

    # Convert the data
    print(f"Converting {input_file} to {output_file}...")
    count = convert_csv_to_jsonl(input_file, output_file)
    print(f"Successfully converted {count} cities to JSONL format")
    print(f"Output file: {output_file}")


if __name__ == "__main__":
    main()
