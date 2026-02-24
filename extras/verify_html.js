/**
 * Verify that shimonopoly.html can be loaded and contains all required components
 */

import { readFileSync } from 'fs';

const html = readFileSync('./shimonopoly.html', 'utf-8');

console.log('Verifying shimonopoly.html...\n');

const checks = [
    { name: 'HTML structure', test: () => html.includes('<!DOCTYPE html>') && html.includes('</html>') },
    { name: 'Setup screen', test: () => html.includes('id="setupScreen"') },
    { name: 'Game screen', test: () => html.includes('id="gameScreen"') },
    { name: 'End screen', test: () => html.includes('id="endScreen"') },
    { name: 'Player name input', test: () => html.includes('id="playerName"') },
    { name: 'Random seed input', test: () => html.includes('id="randomSeed"') },
    { name: 'Number of cities input', test: () => html.includes('id="numCities"') },
    { name: 'Damaged fraction input', test: () => html.includes('id="damagedFraction"') },
    { name: 'Timer duration input', test: () => html.includes('id="timerDuration"') },
    { name: 'Advanced mode checkbox', test: () => html.includes('id="advancedMode"') },
    { name: 'AWS credentials textarea', test: () => html.includes('id="awsCredentials"') },
    { name: 'Start button', test: () => html.includes('id="startButton"') },
    { name: 'Game canvas', test: () => html.includes('id="gameCanvas"') },
    { name: 'Timer display', test: () => html.includes('id="timerDisplay"') },
    { name: 'Score display', test: () => html.includes('id="scoreDisplay"') },
    { name: 'Transformers display', test: () => html.includes('id="transformersDisplay"') },
    { name: 'City input', test: () => html.includes('id="cityInput"') },
    { name: 'Submit city button', test: () => html.includes('id="submitCity"') },
    { name: 'Final score display', test: () => html.includes('id="finalScore"') },
    { name: 'Cities restored display', test: () => html.includes('id="citiesRestored"') },
    { name: 'Save score button', test: () => html.includes('id="saveScoreButton"') },
    { name: 'Play again button', test: () => html.includes('id="playAgainButton"') },
    { name: 'Leaderboard', test: () => html.includes('id="leaderboard"') },
    { name: 'SeededRandom class', test: () => html.includes('class SeededRandom') },
    { name: 'DistanceCalculator class', test: () => html.includes('class DistanceCalculator') },
    { name: 'DataLoader class', test: () => html.includes('class DataLoader') },
    { name: 'CityManager class', test: () => html.includes('class CityManager') },
    { name: 'ScoringEngine class', test: () => html.includes('class ScoringEngine') },
    { name: 'GameController class', test: () => html.includes('class GameController') },
    { name: 'MapRenderer class', test: () => html.includes('class MapRenderer') },
    { name: 'DynamoDBClient class', test: () => html.includes('class DynamoDBClient') },
    { name: 'Haversine formula', test: () => html.includes('Haversine') },
    { name: 'AWS SDK script', test: () => html.includes('aws-sdk') },
    { name: 'Event listeners', test: () => html.includes('addEventListener') },
    { name: 'Validation functions', test: () => html.includes('validateDamageFraction') },
    { name: 'Screen transitions', test: () => html.includes('transitionToGameScreen') },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
    try {
        if (check.test()) {
            console.log(`✓ ${check.name}`);
            passed++;
        } else {
            console.log(`✗ ${check.name}`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ ${check.name} (error: ${error.message})`);
        failed++;
    }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`HTML Verification: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

// Check file size
const sizeKB = (html.length / 1024).toFixed(2);
console.log(`\nFile size: ${sizeKB} KB`);

// Check if it references external files
const externalRefs = [];
if (html.includes('cities.jsonl')) externalRefs.push('cities.jsonl');
if (html.includes('aws-sdk')) externalRefs.push('AWS SDK (CDN)');

console.log(`External dependencies: ${externalRefs.join(', ')}`);

process.exit(failed > 0 ? 1 : 0);
