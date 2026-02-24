/**
 * Manual test to verify core game functionality
 */

import { GameController } from './core-logic.js';
import { readFileSync } from 'fs';

// Load city data
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

console.log(`Loaded ${citiesData.length} cities\n`);

// Test 1: Basic mode game
console.log('=== Test 1: Basic Mode ===');
const config1 = {
    playerName: "Test Player",
    randomSeed: 42,
    numCities: 10,
    damagedFraction: 1.0,
    timerDuration: 300,
    advancedMode: false
};

const controller1 = new GameController(config1);
controller1.initializeWithCities([...citiesData.slice(0, 10)]);

console.log(`Initial state:`);
console.log(`  Cities: ${controller1.getCities().length}`);
console.log(`  Damaged: ${controller1.cityManager.getDamagedCities().length}`);
console.log(`  Transformers: ${controller1.getTransformers()}`);
console.log(`  Score: ${controller1.getScore()}`);

const damagedCities1 = controller1.cityManager.getDamagedCities();
console.log(`\nRestoring ${damagedCities1[0].name}...`);
const result1 = controller1.restoreCity(damagedCities1[0].name);
console.log(`  Success: ${result1.success}`);
console.log(`  Score: ${controller1.getScore()}`);
console.log(`  Transformers: ${controller1.getTransformers()}`);
console.log(`  Timer started: ${controller1.isTimerStarted()}`);

// Test 2: Advanced mode game
console.log('\n=== Test 2: Advanced Mode ===');
const config2 = {
    playerName: "Test Player",
    randomSeed: 42,
    numCities: 10,
    damagedFraction: 1.0,
    timerDuration: 300,
    advancedMode: true
};

const controller2 = new GameController(config2);
controller2.initializeWithCities([...citiesData.slice(0, 10)]);

console.log(`Initial state:`);
console.log(`  Cities: ${controller2.getCities().length}`);
console.log(`  Damaged: ${controller2.cityManager.getDamagedCities().length}`);
console.log(`  Transformers: ${controller2.getTransformers()}`);

const damagedCities2 = controller2.cityManager.getDamagedCities();
const city = damagedCities2[0];
console.log(`\nRestoring ${city.name} (pop: ${city.population})...`);
const result2 = controller2.restoreCity(city.name);
console.log(`  Success: ${result2.success}`);
console.log(`  Points earned: ${result2.pointsEarned}`);
console.log(`  Score: ${controller2.getScore()}`);
console.log(`  Transformers used: ${result2.transformersUsed}`);
console.log(`  Transformers remaining: ${controller2.getTransformers()}`);

// Test 3: Partial damage
console.log('\n=== Test 3: Partial Damage (50%) ===');
const config3 = {
    playerName: "Test Player",
    randomSeed: 123,
    numCities: 20,
    damagedFraction: 0.5,
    timerDuration: 300,
    advancedMode: false
};

const controller3 = new GameController(config3);
controller3.initializeWithCities([...citiesData.slice(0, 20)]);

console.log(`Initial state:`);
console.log(`  Cities: ${controller3.getCities().length}`);
console.log(`  Damaged: ${controller3.cityManager.getDamagedCities().length}`);
console.log(`  Expected damaged: ${Math.round(20 * 0.5)}`);
console.log(`  Transformers: ${controller3.getTransformers()}`);

// Test 4: Timer functionality
console.log('\n=== Test 4: Timer Functionality ===');
const config4 = {
    playerName: "Test Player",
    randomSeed: 42,
    numCities: 5,
    damagedFraction: 1.0,
    timerDuration: 3,
    advancedMode: false
};

const controller4 = new GameController(config4);
controller4.initializeWithCities([...citiesData.slice(0, 5)]);

const damagedCities4 = controller4.cityManager.getDamagedCities();
controller4.restoreCity(damagedCities4[0].name);

console.log(`Timer started: ${controller4.isTimerStarted()}`);
console.log(`Time remaining: ${controller4.getTimeRemaining()}`);

controller4.updateTimer();
console.log(`After 1 tick: ${controller4.getTimeRemaining()}`);

controller4.updateTimer();
console.log(`After 2 ticks: ${controller4.getTimeRemaining()}`);

controller4.updateTimer();
console.log(`After 3 ticks: ${controller4.getTimeRemaining()}`);
console.log(`Game ended: ${controller4.isGameEnded()}`);

console.log('\n=== All Manual Tests Complete ===');
