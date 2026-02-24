# Shimonopoly - Power Restoration Game

A browser-based educational game where players restore power to US cities affected by a fictional solar storm.

## Quick Start

### Option 1: Using Python Web Server (Recommended)

```bash
python start_server.py
```

Then open http://localhost:8000/shimonopoly.html in your browser.

### Option 2: Using Python's Built-in Server

```bash
python -m http.server 8000
```

Then open http://localhost:8000/shimonopoly.html in your browser.

### Option 3: Using Node.js

```bash
npx http-server -p 8000
```

Then open http://localhost:8000/shimonopoly.html in your browser.

## Why Do I Need a Web Server?

The game loads city data from `cities.jsonl` using the Fetch API, which requires a web server due to browser security restrictions (CORS). Opening the HTML file directly (file://) will result in a "Failed to fetch" error.

## How to Play

1. **Setup Screen:**
   - Enter your player name
   - Configure game parameters:
     - Random seed (for reproducible games)
     - Number of cities (10-100 recommended)
     - Fraction of cities damaged (0.5-1.0)
     - Timer duration in seconds
   - Toggle Advanced Mode for population-based scoring
   - Optionally add AWS credentials for score saving
   - Click "Start Game"

2. **Game Screen:**
   - Enter city names to restore power
   - Watch the timer count down
   - See your score and remaining transformers
   - View the map showing:
     - Blue circles = undamaged cities
     - Red circles = damaged cities
     - Green circles = restored cities
     - Green radius = 300-mile restoration radius

3. **End Screen:**
   - View your final score
   - Save score to DynamoDB (if credentials provided)
   - View leaderboard
   - Play again

## Game Modes

### Basic Mode
- Score: 1 point per city restored
- Cost: 1 transformer per city

### Advanced Mode
- Score: Population (in thousands) per city
- Cost: 1 / (1 + nearby restored cities) transformers
  - First city costs 1 transformer
  - Cities near already-restored cities cost less
  - Encourages strategic clustering

## Files

- `shimonopoly.html` - Complete game (single HTML file)
- `cities.jsonl` - City data (387 US cities)
- `start_server.py` - Simple Python web server
- `core-logic.js` - Extracted core logic for testing
- `test-*.js` - Test files
- `E2E_TEST_REPORT.md` - End-to-end testing report

## Testing

### Run Automated Tests

```bash
node manual_test.js
node test-integration.js
node test-game-handlers.js
node verify_html.js
```

### Browser Testing

See `E2E_TEST_REPORT.md` for comprehensive testing checklist.

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local web server)
- Internet connection (for AWS SDK CDN, optional)

## Technical Details

- **Single File:** All HTML, CSS, and JavaScript in one file
- **No Build Step:** No compilation or bundling required
- **External Data:** Only cities.jsonl is external
- **Optional Cloud:** DynamoDB integration for score persistence

## Architecture

- **SeededRandom:** Deterministic random number generation
- **DistanceCalculator:** Haversine formula for geographic distances
- **DataLoader:** JSONL parsing with error handling
- **CityManager:** City selection and damage assignment
- **ScoringEngine:** Points and cost calculations
- **GameController:** Game state management
- **MapRenderer:** Canvas-based map visualization
- **DynamoDBClient:** AWS DynamoDB integration

## Troubleshooting

### "Failed to fetch" Error
- **Cause:** Opening HTML file directly (file:// protocol)
- **Solution:** Use a web server (see Quick Start above)

### Cities Not Loading
- **Cause:** cities.jsonl not in same directory
- **Solution:** Ensure cities.jsonl is in the same folder as shimonopoly.html

### AWS Credentials Error
- **Cause:** Invalid JSON format or missing fields
- **Solution:** Use format: `{"accessKeyId": "...", "secretAccessKey": "...", "region": "us-east-1"}`

### Map Not Displaying
- **Cause:** Canvas rendering issue
- **Solution:** Try a different browser or check console for errors

## License

Educational project - free to use and modify.
