/**
 * Integration test for main application controller
 * Tests that all components are properly wired together
 * Run with: node test-integration.js
 */

import { GameController } from './core-logic.js';
import { readFileSync } from 'fs';

// Test data - load from actual cities.jsonl file
const citiesData = readFileSync('./cities.jsonl', 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
        const city = JSON.parse(line);
        return {
            name: city.name,
            population: city.population,
            lat: city.lat,
            lon: city.lon,
            damaged: false,
            restored: false
        };
    });

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

console.log('Integration Test: Main Application Controller\n');
console.log(`Loaded ${citiesData.length} cities from cities.jsonl\n`);

let passed = 0;
let failed = 0;

// Test 1: Complete game flow - setup to game to end
if (test('Complete game flow: setup → game → end', () => {
    const config = {
        playerName: "Integration Test Player",
        randomSeed: 12345,
        numCities: 20,
        damagedFraction: 0.8,
        timerDuration: 10,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 20)]);

    // Verify initial state
    assert(controller.getScore() === 0, 'Initial score should be 0');
    assert(controller.getTimeRemaining() === 10, 'Initial time should be 10');
    assert(!controller.isTimerStarted(), 'Timer should not be started');
    assert(!controller.isGameEnded(), 'Game should not be ended');

    const damagedCities = controller.cityManager.getDamagedCities();
    assert(damagedCities.length === 16, `Expected 16 damaged cities (80% of 20), got ${damagedCities.length}`);
    assert(controller.getTransformers() === 16, 'Initial transformers should equal damaged cities');

    // Restore first city
    const result1 = controller.restoreCity(damagedCities[0].name);
    assert(result1.success, 'First restoration should succeed');
    assert(result1.shouldClearInput, 'Should clear input on success');
    assert(controller.isTimerStarted(), 'Timer should start after first restoration');
    assert(controller.getScore() === 1, 'Score should be 1 after first restoration');

    // Restore second city
    const result2 = controller.restoreCity(damagedCities[1].name);
    assert(result2.success, 'Second restoration should succeed');
    assert(controller.getScore() === 2, 'Score should be 2 after second restoration');

    // Try invalid city
    const result3 = controller.restoreCity("NonexistentCity");
    assert(!result3.success, 'Invalid city should fail');
    assert(!result3.shouldClearInput, 'Should not clear input on failure');
    assert(controller.getScore() === 2, 'Score should remain 2 after invalid input');

    // Simulate timer reaching zero
    for (let i = 0; i < 10; i++) {
        controller.updateTimer();
    }

    assert(controller.getTimeRemaining() === 0, 'Time should be 0');
    assert(controller.isGameEnded(), 'Game should be ended');

    // Try to restore after game ends
    const result4 = controller.restoreCity(damagedCities[2].name);
    assert(!result4.success, 'Restoration should fail after game ends');
    assert(controller.getScore() === 2, 'Score should not change after game ends');

})) passed++; else failed++;

// Test 2: Advanced mode integration
if (test('Advanced mode: population-based scoring and distance-based costs', () => {
    const config = {
        playerName: "Advanced Test Player",
        randomSeed: 54321,
        numCities: 15,
        damagedFraction: 1.0,
        timerDuration: 60,
        advancedMode: true
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 15)]);

    const damagedCities = controller.cityManager.getDamagedCities();
    assert(damagedCities.length === 15, 'All cities should be damaged');

    const initialTransformers = controller.getTransformers();
    assert(initialTransformers === 15, 'Initial transformers should be 15');

    // Restore first city
    const city1 = damagedCities[0];
    const result1 = controller.restoreCity(city1.name);
    
    assert(result1.success, 'First restoration should succeed');
    
    const expectedScore1 = city1.population / 1000;
    assert(Math.abs(controller.getScore() - expectedScore1) < 0.01, 
        `Score should be ${expectedScore1}, got ${controller.getScore()}`);
    
    assert(Math.abs(controller.getTransformers() - (initialTransformers - 1)) < 0.01,
        'First restoration should cost 1 transformer (no nearby cities)');

    // Restore second city (may have reduced cost if near first city)
    const city2 = damagedCities[1];
    const transformersBeforeSecond = controller.getTransformers();
    const result2 = controller.restoreCity(city2.name);
    
    assert(result2.success, 'Second restoration should succeed');
    
    const transformerCost = transformersBeforeSecond - controller.getTransformers();
    assert(transformerCost > 0 && transformerCost <= 1, 
        `Transformer cost should be between 0 and 1, got ${transformerCost}`);

})) passed++; else failed++;

// Test 3: Data loading integration
if (test('DataLoader integration: handles real city data', () => {
    const config = {
        playerName: "Data Test Player",
        randomSeed: 99999,
        numCities: 50,
        damagedFraction: 0.5,
        timerDuration: 120,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 100)]);

    const cities = controller.getCities();
    assert(cities.length === 50, `Expected 50 cities, got ${cities.length}`);

    const damagedCities = controller.cityManager.getDamagedCities();
    assert(damagedCities.length === 25, `Expected 25 damaged cities (50%), got ${damagedCities.length}`);

    // Verify cities have required properties
    cities.forEach(city => {
        assert(typeof city.name === 'string', 'City should have name');
        assert(typeof city.population === 'number', 'City should have population');
        assert(typeof city.lat === 'number', 'City should have latitude');
        assert(typeof city.lon === 'number', 'City should have longitude');
        assert(typeof city.damaged === 'boolean', 'City should have damaged flag');
        assert(typeof city.restored === 'boolean', 'City should have restored flag');
    });

})) passed++; else failed++;

// Test 4: UI update integration (simulated)
if (test('UI update callbacks work correctly', () => {
    const config = {
        playerName: "UI Test Player",
        randomSeed: 11111,
        numCities: 10,
        damagedFraction: 1.0,
        timerDuration: 30,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 10)]);

    // Track UI updates
    let uiUpdateCount = 0;
    global.updateGameUI = () => {
        uiUpdateCount++;
    };

    // Start timer (should trigger UI updates)
    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);

    // Simulate a few timer ticks
    controller.updateTimer();
    controller.updateTimer();
    controller.updateTimer();

    assert(uiUpdateCount >= 3, `Expected at least 3 UI updates, got ${uiUpdateCount}`);

    // Clean up
    delete global.updateGameUI;

})) passed++; else failed++;

// Test 5: Screen transition integration (simulated)
if (test('Screen transition callbacks work correctly', () => {
    const config = {
        playerName: "Transition Test Player",
        randomSeed: 22222,
        numCities: 5,
        damagedFraction: 1.0,
        timerDuration: 1,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 5)]);

    // Track screen transitions
    let transitionCalled = false;
    global.transitionToEndScreen = () => {
        transitionCalled = true;
    };

    // Start game and let timer expire
    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);

    // Simulate timer expiring
    controller.updateTimer();

    assert(controller.isGameEnded(), 'Game should be ended');
    assert(transitionCalled, 'transitionToEndScreen should have been called');

    // Clean up
    delete global.transitionToEndScreen;

})) passed++; else failed++;

// Test 6: Error handling integration
if (test('Error handling: graceful degradation', () => {
    const config = {
        playerName: "Error Test Player",
        randomSeed: 33333,
        numCities: 10,
        damagedFraction: 0.7,
        timerDuration: 60,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 10)]);

    // Test various error conditions
    const result1 = controller.restoreCity("");
    assert(!result1.success, 'Empty string should fail gracefully');

    const result2 = controller.restoreCity(null);
    assert(!result2.success, 'Null should fail gracefully');

    const result3 = controller.restoreCity("   ");
    assert(!result3.success, 'Whitespace should fail gracefully');

    // Game state should remain consistent
    assert(controller.getScore() === 0, 'Score should still be 0');
    assert(!controller.isTimerStarted(), 'Timer should not have started');

})) passed++; else failed++;

// Test 7: Map rendering integration
if (test('Map rendering: cities and restored cities available', () => {
    const config = {
        playerName: "Map Test Player",
        randomSeed: 44444,
        numCities: 15,
        damagedFraction: 1.0,
        timerDuration: 60,
        advancedMode: false
    };

    const controller = new GameController(config);
    controller.initializeWithCities([...citiesData.slice(0, 15)]);

    // Get cities for map rendering
    const allCities = controller.getCities();
    assert(allCities.length === 15, 'Should have 15 cities for rendering');

    const restoredCities = controller.getRestoredCities();
    assert(restoredCities.length === 0, 'Should have 0 restored cities initially');

    // Restore some cities
    const damagedCities = controller.cityManager.getDamagedCities();
    controller.restoreCity(damagedCities[0].name);
    controller.restoreCity(damagedCities[1].name);
    controller.restoreCity(damagedCities[2].name);

    const restoredAfter = controller.getRestoredCities();
    assert(restoredAfter.length === 3, 'Should have 3 restored cities after restorations');

    // Verify restored cities have correct state
    restoredAfter.forEach(city => {
        assert(city.restored === true, 'Restored city should have restored=true');
        assert(city.damaged === true, 'Restored city should still have damaged=true');
    });

})) passed++; else failed++;

console.log(`\n${'='.repeat(50)}`);
console.log(`Integration Test Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
