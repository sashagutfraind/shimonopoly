#!/usr/bin/env python3
"""
Simple HTTP server for testing Shimonopoly game locally.
This avoids CORS issues when loading cities.jsonl.

Usage:
    python start_server.py

Then open: http://localhost:8000/shimonopoly.html
"""

import http.server
import socketserver
import os

PORT = 8000

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting server at http://localhost:{PORT}")
print(f"Open http://localhost:{PORT}/shimonopoly.html in your browser")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
