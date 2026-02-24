// Quick script to debug the distance calculation
import { DistanceCalculator } from './core-logic.js';

const city1 = { lat: 40, lon: -74 };
const city2 = { lat: 40 + (300 / 69), lon: -74 };

const distance = DistanceCalculator.calculateDistance(
    city1.lat, city1.lon,
    city2.lat, city2.lon
);

console.log(`City 1: lat=${city1.lat}, lon=${city1.lon}`);
console.log(`City 2: lat=${city2.lat}, lon=${city2.lon}`);
console.log(`Distance: ${distance} miles`);
console.log(`Expected: ~300 miles`);
console.log(`Difference: ${Math.abs(distance - 300)} miles`);
