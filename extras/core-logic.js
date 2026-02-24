/**
 * Core logic classes for Shimonopoly game
 * Extracted for testing purposes
 */

/**
 * SeededRandom - Deterministic random number generator
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 */
export class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    /**
     * Generate next random number between 0 and 1
     * @returns {number} Random number in range [0, 1)
     */
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} The shuffled array (same reference)
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

/**
 * DistanceCalculator - Calculate distances between geographic coordinates
 */
export class DistanceCalculator {
    static EARTH_RADIUS_MILES = 3959;

    /**
     * Calculate distance between two points using Haversine formula
     * @param {number} lat1 - Latitude of first point in degrees
     * @param {number} lon1 - Longitude of first point in degrees
     * @param {number} lat2 - Latitude of second point in degrees
     * @param {number} lon2 - Longitude of second point in degrees
     * @returns {number} Distance in miles
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        // Convert degrees to radians
        const toRad = (deg) => deg * Math.PI / 180;
        
        const lat1Rad = toRad(lat1);
        const lat2Rad = toRad(lat2);
        const deltaLat = toRad(lat2 - lat1);
        const deltaLon = toRad(lon2 - lon1);

        // Haversine formula
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                 Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                 Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return DistanceCalculator.EARTH_RADIUS_MILES * c;
    }

    /**
     * Find all cities within a specified radius of a center city
     * @param {Object} centerCity - City object with lat and lon properties
     * @param {Array} allCities - Array of city objects to search
     * @param {number} radiusMiles - Radius in miles
     * @returns {Array} Array of cities within the radius
     */
    static findCitiesWithinRadius(centerCity, allCities, radiusMiles) {
        return allCities.filter(city => {
            if (city === centerCity) return false;
            const distance = DistanceCalculator.calculateDistance(
                centerCity.lat, centerCity.lon,
                city.lat, city.lon
            );
            return distance <= radiusMiles;
        });
    }
}

/**
 * DataLoader - Load and parse city data from JSONL file
 */
export class DataLoader {
    /**
     * Parse JSONL text into city objects
     * @param {string} text - JSONL text content
     * @returns {Array} Array of city objects
     */
    static parseCityData(text) {
        const cities = [];
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            try {
                const city = JSON.parse(line);
                
                // Validate required fields
                if (!DataLoader.isValidCity(city)) {
                    console.warn(`Skipping malformed city record at line ${i + 1}:`, line);
                    continue;
                }
                
                // Initialize city state
                cities.push({
                    name: city.name,
                    population: city.population,
                    lat: city.lat,
                    lon: city.lon,
                    damaged: false,
                    restored: false
                });
            } catch (parseError) {
                console.warn(`Skipping invalid JSON at line ${i + 1}:`, line);
                continue;
            }
        }
        
        return cities;
    }
    
    /**
     * Validate that a city object has all required fields
     * @param {Object} city - City object to validate
     * @returns {boolean} True if city has all required fields with valid types
     */
    static isValidCity(city) {
        if (!city || typeof city !== 'object') return false;
        
        // Check required fields exist
        if (!city.name || !city.hasOwnProperty('population') || 
            !city.hasOwnProperty('lat') || !city.hasOwnProperty('lon')) {
            return false;
        }
        
        // Check field types
        if (typeof city.name !== 'string') return false;
        if (typeof city.population !== 'number' || isNaN(city.population)) return false;
        if (typeof city.lat !== 'number' || isNaN(city.lat)) return false;
        if (typeof city.lon !== 'number' || isNaN(city.lon)) return false;
        
        // Check coordinate ranges
        if (city.lat < -90 || city.lat > 90) return false;
        if (city.lon < -180 || city.lon > 180) return false;
        
        return true;
    }
}

/**
 * CityManager - Manage city selection, damage assignment, and lookup
 */
export class CityManager {
    /**
     * Create a CityManager
     * @param {Array} cities - Array of city objects
     * @param {number} randomSeed - Seed for random number generation
     */
    constructor(cities, randomSeed) {
        this.allCities = cities;
        this.random = new SeededRandom(randomSeed);
        this.cities = [];
    }

    /**
     * Select a random subset of cities
     * @param {number} count - Number of cities to select
     * @returns {Array} Array of selected cities
     */
    selectCities(count) {
        // If count is greater than available cities, use all cities
        const actualCount = Math.min(count, this.allCities.length);
        
        // Create a copy of the cities array and shuffle it
        const shuffled = [...this.allCities];
        this.random.shuffle(shuffled);
        
        // Take the first 'count' cities
        this.cities = shuffled.slice(0, actualCount);
        
        return this.cities;
    }

    /**
     * Mark a fraction of cities as damaged
     * @param {number} fraction - Fraction of cities to damage (0.5 to 1.0)
     */
    damageCities(fraction) {
        // Validate fraction
        if (fraction < 0.5 || fraction > 1.0) {
            throw new Error('Damage fraction must be between 0.5 and 1.0');
        }
        
        // Calculate number of cities to damage
        const numToDamage = Math.round(this.cities.length * fraction);
        
        // Create a copy of cities array and shuffle it
        const shuffled = [...this.cities];
        this.random.shuffle(shuffled);
        
        // Mark the first numToDamage cities as damaged
        for (let i = 0; i < numToDamage; i++) {
            shuffled[i].damaged = true;
        }
    }

    /**
     * Find a city by name (case-insensitive)
     * @param {string} name - City name to search for
     * @returns {Object|null} City object if found, null otherwise
     */
    findCityByName(name) {
        if (!name || typeof name !== 'string') {
            return null;
        }
        
        const searchName = name.trim().toLowerCase();
        
        return this.cities.find(city => 
            city.name.toLowerCase() === searchName
        ) || null;
    }

    /**
     * Get all damaged cities
     * @returns {Array} Array of damaged cities
     */
    getDamagedCities() {
        return this.cities.filter(city => city.damaged && !city.restored);
    }

    /**
     * Get all restored cities
     * @returns {Array} Array of restored cities
     */
    getRestoredCities() {
        return this.cities.filter(city => city.restored);
    }

    /**
     * Get all cities
     * @returns {Array} Array of all cities
     */
    getCities() {
        return this.cities;
    }
}

/**
 * ScoringEngine - Calculate points and restoration costs
 */
export class ScoringEngine {
    /**
     * Create a ScoringEngine
     * @param {boolean} advancedMode - Whether advanced mode is enabled
     */
    constructor(advancedMode) {
        this.advancedMode = advancedMode;
    }

    /**
     * Calculate points earned for restoring a city
     * @param {Object} city - City object with population property
     * @returns {number} Points earned
     */
    calculatePoints(city) {
        if (this.advancedMode) {
            // Advanced mode: population / 1000
            return city.population / 1000;
        } else {
            // Basic mode: 1 point per city
            return 1;
        }
    }

    /**
     * Calculate restoration cost for a city
     * @param {Object} city - City being restored
     * @param {Array} restoredCities - Array of already restored cities
     * @returns {number} Transformer cost
     */
    calculateRestorationCost(city, restoredCities) {
        if (this.advancedMode) {
            // Advanced mode: 1 / (1 + count of restored cities within 300 miles)
            const citiesWithin300Miles = DistanceCalculator.findCitiesWithinRadius(
                city,
                restoredCities,
                300
            );
            const count = citiesWithin300Miles.length;
            return 1 / (1 + count);
        } else {
            // Basic mode: 1 transformer per city
            return 1;
        }
    }
}

/**
 * GameController - Manages game state and coordinates game logic
 */
export class GameController {
    /**
     * Create a GameController
     * @param {Object} config - Game configuration object
     */
    constructor(config) {
        this.config = config;
        this.cityManager = null;
        this.scoringEngine = null;
        this.state = {
            transformers: 0,
            score: 0,
            timeRemaining: config.timerDuration,
            timerStarted: false,
            gameEnded: false
        };
        this.timerInterval = null;
    }

    /**
     * Initialize game with city data (synchronous version for testing)
     * @param {Array} cities - Array of city objects
     */
    initializeWithCities(cities) {
        // Initialize city manager
        this.cityManager = new CityManager(cities, this.config.randomSeed);
        
        // Select cities
        this.cityManager.selectCities(this.config.numCities);
        
        // Damage cities
        this.cityManager.damageCities(this.config.damagedFraction);
        
        // Initialize scoring engine
        this.scoringEngine = new ScoringEngine(this.config.advancedMode);
        
        // Initialize game state
        const damagedCities = this.cityManager.getDamagedCities();
        this.state.transformers = damagedCities.length;
        this.state.score = 0;
        this.state.timeRemaining = this.config.timerDuration;
        this.state.timerStarted = false;
        this.state.gameEnded = false;
    }

    /**
     * Attempt to restore a city
     * @param {string} cityName - Name of city to restore
     * @returns {Object} Result object with success status and details
     */
    restoreCity(cityName) {
        // Check if game has ended
        if (this.state.gameEnded) {
            return {
                success: false,
                message: 'Game has ended',
                shouldClearInput: false
            };
        }
        
        // Find the city
        const city = this.cityManager.findCityByName(cityName);
        
        // Invalid city name - maintain state unchanged
        if (!city) {
            return {
                success: false,
                message: 'City not found',
                shouldClearInput: false
            };
        }
        
        // City is not damaged - maintain state unchanged
        if (!city.damaged) {
            return {
                success: false,
                message: 'City is not damaged',
                shouldClearInput: false
            };
        }
        
        // City is already restored - maintain state unchanged
        if (city.restored) {
            return {
                success: false,
                message: 'City already restored',
                shouldClearInput: false
            };
        }
        
        // Calculate restoration cost
        const restoredCities = this.cityManager.getRestoredCities();
        const cost = this.scoringEngine.calculateRestorationCost(city, restoredCities);
        
        // Check if we have enough transformers
        if (this.state.transformers < cost) {
            return {
                success: false,
                message: 'Not enough transformers',
                shouldClearInput: false
            };
        }
        
        // Start timer on first valid restoration
        if (!this.state.timerStarted) {
            this.startTimer();
        }
        
        // Restore the city
        city.restored = true;
        
        // Update transformers
        this.state.transformers -= cost;
        
        // Calculate and add points
        const points = this.scoringEngine.calculatePoints(city);
        this.state.score += points;
        
        return {
            success: true,
            message: `${city.name} restored!`,
            pointsEarned: points,
            transformersUsed: cost,
            shouldClearInput: true
        };
    }

    /**
     * Start the game timer
     */
    startTimer() {
        if (this.state.timerStarted) {
            return;
        }
        
        this.state.timerStarted = true;
    }

    /**
     * Update the timer (called manually in tests, automatically in game)
     */
    updateTimer() {
        if (this.state.gameEnded) {
            return;
        }
        
        this.state.timeRemaining--;
        
        // Check if time has run out
        if (this.state.timeRemaining <= 0) {
            this.state.timeRemaining = 0;
            this.endGame();
        }
    }

    /**
     * End the game
     */
    endGame() {
        if (this.state.gameEnded) {
            return;
        }
        
        this.state.gameEnded = true;
        
        // Stop the timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getState() {
        return {
            ...this.state,
            cities: this.cityManager ? this.cityManager.getCities() : [],
            damagedCities: this.cityManager ? this.cityManager.getDamagedCities() : [],
            restoredCities: this.cityManager ? this.cityManager.getRestoredCities() : []
        };
    }

    /**
     * Get cities for map rendering
     * @returns {Array} Array of all cities
     */
    getCities() {
        return this.cityManager ? this.cityManager.getCities() : [];
    }

    /**
     * Get restored cities for map rendering
     * @returns {Array} Array of restored cities
     */
    getRestoredCities() {
        return this.cityManager ? this.cityManager.getRestoredCities() : [];
    }

    /**
     * Check if timer has started
     * @returns {boolean} True if timer has started
     */
    isTimerStarted() {
        return this.state.timerStarted;
    }

    /**
     * Check if game has ended
     * @returns {boolean} True if game has ended
     */
    isGameEnded() {
        return this.state.gameEnded;
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getScore() {
        return this.state.score;
    }

    /**
     * Get remaining transformers
     * @returns {number} Remaining transformers
     */
    getTransformers() {
        return this.state.transformers;
    }

    /**
     * Get time remaining
     * @returns {number} Time remaining in seconds
     */
    getTimeRemaining() {
        return this.state.timeRemaining;
    }
}
