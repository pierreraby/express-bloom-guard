import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { filterAdd, filterHas, filterClear} from './bloom-module.js';
import {performance} from 'perf_hooks';
import { exit } from 'process';

// No server is needed for this benchmark

// Generate 10,000 tokens (avoid V8 optimizations with JIT)
const NUM_TOKENS = 10000;

console.log('Generating JWT tokens...');
const tokens = Array.from({ length: NUM_TOKENS }, () => 
  jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
);

function benchJWTVerify(iterations) {
  console.log('Starting jwt verify benchmark...');

  // Warm-up phase
  for (let i = 0; i < 1000; i++) {
    try {
      jwt.verify(tokens[i % NUM_TOKENS], process.env.JWT_SECRET_KEY);
    } catch (err) {
      console.error('Verification failed during warm-up:', err);
    }
  }

  let startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    try {
      jwt.verify(tokens[i % NUM_TOKENS], process.env.JWT_SECRET_KEY);
    } catch (err) {
      console.error('Verification failed:', err);
    }
  }
  
  let endTime = performance.now();

  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;

  console.log(`Time taken to verify token ${iterations} times: ${totalTime.toFixed(2)} milliseconds`);
  console.log(`Average time taken to verify token: ${averageTime.toFixed(6)} milliseconds`);
  console.log('***********************************');
}

function generateClaims(NUM_ITEMS,nanoidLength = 21) {
  console.log('Generating claims...');
  const claims = [];

  for (let i = 0; i < NUM_ITEMS; i++) {
    claims.push('jti-' + nanoid(nanoidLength));
  }
  console.log('Claims generated : ' + claims.length);
  console.log('***********************************');
  return claims;
}

function benchFilterAdd(claims) {
  const iterations = claims.length;
  let startTime, endTime;

  console.log('Starting filter add benchmark...');
  
  // Warm-up phase
  const warmupIterations = 1000;
  for (let i = 0; i < warmupIterations; i++) {
    try {
      filterAdd(claims[i % iterations]);
    } catch (err) {
      console.error('Addition failed during warm-up:', err);
    }
  }

  // Measure the addition time
  startTime = performance.now();

  for (const claim of claims) {
    try {
      filterAdd(claim);
    } catch (err) {
      console.error('Addition failed:', err);
    }
  }

  endTime = performance.now();

  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;

  console.log(`filterAdd adds to current and next filters!`);
  console.log(`Time taken to add to filter ${iterations} times: ${totalTime.toFixed(2)} milliseconds`);
  console.log(`Average time taken to add to filter: ${averageTime.toFixed(6)} milliseconds`);
  console.log('***********************************');
}

function benchFilterHas(claims) {
  const iterations = claims.length;
  let startTime, endTime;

  console.log('Starting filter has benchmark...');

  // Warm-up phase to allow V8 optimizations
  const warmupIterations = 1000;
  for (let i = 0; i < warmupIterations; i++) {
    try {
      filterHas(claims[i % iterations]);
    } catch (err) {
      console.error('Check failed during warm-up:', err);
    }
  }

  // Measure the time taken for filterHas operations
  startTime = performance.now();
  for (const claim of claims) {
    try {
      filterHas(claim);
    } catch (err) {
      console.error('Check failed:', err);
    }
  }
  endTime = performance.now();

  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;

  console.log(`filterHas checks previous and current filters!`);
  console.log(`Time taken to check filter ${iterations} times: ${totalTime.toFixed(2)} milliseconds`);
  console.log(`Average time taken to check filter: ${averageTime.toFixed(6)} milliseconds`);
  console.log('***********************************');
}

function benchFalsePositiveRate() {
  const NUM_ITEMS = 1000000;
  const ITERATIONS = 1000;
  let falsePositives = 0;

  // Reset the filters before the benchmark
  filterClear();

  // Generate and insert claims into the filter
  const insertedClaims = generateClaims(NUM_ITEMS, 32);
  console.log('Adding claims to the Bloom filter...');
  for (const claim of insertedClaims) {
    filterAdd(claim);
  }
  console.log('Claims added to the Bloom filter.');
  console.log('***********************************');

  // Generate non-inserted claims to test false positives
  const testClaims = generateClaims(NUM_ITEMS, 32);

  // Measure the false positive rate
  console.log('Starting false positive rate benchmark...');
  const startTime = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    for (const claim of testClaims) {
      if (filterHas(claim)) {
        falsePositives++;
      }
    }
    console.log('Iteration: ' + (i + 1));
  }

  const endTime = performance.now();

  const totalChecks = NUM_ITEMS * ITERATIONS;
  const falsePositiveRate = falsePositives / totalChecks;

  console.log('***********************************');
  console.log(`Time taken for FPR benchmark: ${(endTime - startTime).toFixed(2)} milliseconds`);
  console.log(`False positives: ${falsePositives}`);
  console.log(`False positive rate: ${falsePositiveRate}`);
}

function benchBloomFilter() {
  const NUM_ITEMS = 1000000;
  const claims = generateClaims(NUM_ITEMS);
  benchFilterAdd(claims);
  benchFilterHas(claims);
}

benchJWTVerify(NUM_TOKENS);
benchBloomFilter();
//benchFalsePositiveRate();

exit(0); // Exit the process because filter rotation is on a timer

// benchFalsePositiveRate() is commented out because it takes a long time to complete
// and is not necessary for the benchmark. It is included for reference purposes.
// The benchmark results on my personnal computer are as follows:

// ................
// ................
// Iteration: 997
// Iteration: 998
// Iteration: 999
// Iteration: 1000
// ***********************************
// Time taken for FPR benchmark: 1223032.74 milliseconds
// False positives: 0
// False positive rate: 0

// The false positive rate is 0, which is expected because the test claims are not in the filter.
// This is a good indication that the Bloom filter is working as expected.
// The benchmark took approximately 20 minutes to complete.