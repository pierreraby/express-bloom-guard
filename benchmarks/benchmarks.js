import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { filterAdd, filterHas, setFpRate} from './bloom-module.js';
import {performance} from 'perf_hooks';
import { exit } from 'process';

// No server is needed for this benchmark

function benchJWTVerify(iterations) {
  console.log('Generating JWT tokens...');
  const tokens = Array.from({ length: NUM_TOKENS }, () => 
    jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
  );

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

function benchFalsePositiveRate(fp_rate) {
  const NUM_ITEMS = 1000000;
  const ITERATIONS = 10;
  let falsePositives = 0;

  setFpRate(fp_rate);
  console.log('False positive rate benchmark with lower FP rate: ' + fp_rate);

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
  console.log(`Starting false positive rate benchmark with ${ITERATIONS} iterations...`);
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
  console.log(`False positives: ${falsePositives} for ${totalChecks} checks`);
  console.log(`False positive rate: ${falsePositiveRate}`);
  console.log(`Expected false positive rate: ${fp_rate}`);
}

function benchBloomFilter() {
  const NUM_ITEMS = 1000000;
  const claims = generateClaims(NUM_ITEMS);
  benchFilterAdd(claims);
  benchFilterHas(claims);
}

// Generate 10,000 tokens (avoid V8 optimizations with JIT)
const NUM_TOKENS = 10000;
const FP_RATE = 0.00001; // 1e-5

benchJWTVerify(NUM_TOKENS);
benchBloomFilter();
benchFalsePositiveRate(FP_RATE);

exit(0); // Exit the process because filter rotation is on a timer