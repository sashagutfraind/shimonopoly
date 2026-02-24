#!/usr/bin/env python3
"""
Simple test runner that opens the test HTML file in a browser
and waits for user confirmation that tests passed.
"""

import webbrowser
import time

# Open the test file in the default browser
test_url = "http://localhost:8000/test-core-logic.html"
print(f"Opening tests in browser: {test_url}")
print("Please check the browser window for test results.")
print("\nThe tests should show:")
print("- SeededRandom tests (3 tests)")
print("- DistanceCalculator tests (3 tests)")
print("- DataLoader tests (4 tests)")
print("- CityManager tests (4 tests)")
print("- ScoringEngine tests (6 tests)")
print("\nTotal: 20 tests")
print("\nOpening browser...")

webbrowser.open(test_url)

print("\n" + "="*60)
print("Please review the test results in your browser.")
print("All tests should show '✓ PASS' in green.")
print("="*60)
