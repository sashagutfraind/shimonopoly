/**
 * Test game screen event handlers
 * Run with: node test-game-handlers.js
 */

import { GameController, CityManager, ScoringEngine } from './core-logic.js';

// Test data
const testCities = [
    { name: "New York", population: 8336, lat: 40.7128, lon: -74.0060, damaged: false, restored: false },
    { name: "Los Angeles", population: 3979, lat: 34.0522, lon: -118.2437, damaged: false, restored: false },
    { name: "Chicago", population: 2716, lat: 41.8781, lon: -87.6298, damaged: false, restored: false },
    { name: "Houston", population: 2328, lat: 29.7604, lon: -95.3698, damaged: false, restored: false },
    { name: "Phoenix", population: 1690, lat: 33.4484, lon: -112.0740, damaged: false, restored: false }
];

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        return true;
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        return false;
    }
}

console.log('Testing Game Screen Event Handlers\n');

let passed = 0;
let failed = 0;

// Test 1: City restoration clears input
if (test('City restoration returns shouldClearInput=true on success', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const damagedCities = controller.cityManager.getDamagedCities();
    const result = controller.restoreCity(damagedCities[0].name);

    assert(result.success === true, 'Expected success=true');
    assert(result.shouldClearInput === true, 'Expected shouldClearInput=true');
})) passed++; else failed++;

// Test 2: Invalid input doesn't clear input
if (test('Invalid city name returns shouldClearInput=false', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const result = controller.restoreCity("InvalidCity");

    assert(result.success === false, 'Expected success=false');
    assert(result.shouldClearInput === false, 'Expected shouldClearInput=false');
})) passed++; else failed++;

// Test 3: Score updates correctly
if (test('Score increases by 1 in basic mode', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const initialScore = controller.getScore();
    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);
    const newScore = controller.getScore();

    assert(newScore === initialScore + 1, `Expected score to increase by 1, got ${newScore - initialScore}`);
})) passed++; else failed++;

// Test 4: Transformers decrease correctly
if (test('Transformers decrease by 1 in basic mode', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const initialTransformers = controller.getTransformers();
    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);
    const newTransformers = controller.getTransformers();

    assert(newTransformers === initialTransformers - 1, `Expected transformers to decrease by 1, got ${initialTransformers - newTransformers}`);
})) passed++; else failed++;

// Test 5: Timer starts on first valid input
if (test('Timer starts on first valid city restoration', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    assert(controller.isTimerStarted() === false, 'Timer should not be started initially');

    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);

    assert(controller.isTimerStarted() === true, 'Timer should be started after first restoration');
})) passed++; else failed++;

// Test 6: Timer doesn't start on invalid input
if (test('Timer does not start on invalid city name', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    controller.restoreCity("InvalidCity");

    assert(controller.isTimerStarted() === false, 'Timer should not start on invalid input');
})) passed++; else failed++;

// Test 7: Invalid input maintains state
if (test('Invalid input maintains game state unchanged', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const initialScore = controller.getScore();
    const initialTransformers = controller.getTransformers();
    const initialTime = controller.getTimeRemaining();

    controller.restoreCity("InvalidCity");

    assert(controller.getScore() === initialScore, 'Score should not change');
    assert(controller.getTransformers() === initialTransformers, 'Transformers should not change');
    assert(controller.getTimeRemaining() === initialTime, 'Time should not change');
})) passed++; else failed++;

// Test 8: Already restored city doesn't change state
if (test('Already restored city maintains game state', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...testCities]);

    const damagedCities = controller.cityManager.getDamagedCities();
    const cityName = damagedCities[0].name;

    // Restore once
    controller.restoreCity(cityName);
    
    const scoreAfterFirst = controller.getScore();
    const transformersAfterFirst = controller.getTransformers();

    // Try to restore again
    const result = controller.restoreCity(cityName);

    assert(result.success === false, 'Second restoration should fail');
    assert(result.shouldClearInput === false, 'Should not clear input on duplicate');
    assert(controller.getScore() === scoreAfterFirst, 'Score should not change on duplicate');
    assert(controller.getTransformers() === transformersAfterFirst, 'Transformers should not change on duplicate');
})) passed++; else failed++;

// Test 9: Advanced mode scoring
if (test('Advanced mode uses population-based scoring', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 300,
        advancedMode: true
    };

    const controller = new GameController(config);
    const freshCities = testCities.map(c => ({...c, damaged: false, restored: false}));
    controller.initializeWithCities(freshCities);

    const initialScore = controller.getScore();
    const damagedCities = controller.cityManager.getDamagedCities();
    
    assert(damagedCities.length > 0, 'Should have damaged cities');
    
    const city = damagedCities[0];
    
    controller.restoreCity(city.name);
    
    const newScore = controller.getScore();
    const expectedIncrease = city.population / 1000;

    assert(Math.abs(newScore - initialScore - expectedIncrease) < 0.01, 
        `Expected score increase of ${expectedIncrease}, got ${newScore - initialScore}`);
})) passed++; else failed++;

// Test 10: Game ends when timer reaches zero
if (test('Game ends when timer reaches zero', () => {
    const config = {
        playerName: "Test Player",
        randomSeed: 42,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 1,
        advancedMode: false
    };

    const controller = new GameController(config);
    const freshCities = testCities.map(c => ({...c, damaged: false, restored: false}));
    controller.initializeWithCities(freshCities);

    // Start timer
    const damagedCities = controller.cityManager.getDamagedCities();
    
    assert(damagedCities.length > 0, 'Should have damaged cities');
    
    controller.restoreCity(damagedCities[0].name);

    assert(controller.isGameEnded() === false, 'Game should not be ended initially');

    // Manually update timer to simulate time passing
    controller.updateTimer();

    assert(controller.getTimeRemaining() === 0, 'Time should be 0');
    assert(controller.isGameEnded() === true, 'Game should be ended');
})) passed++; else failed++;

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
