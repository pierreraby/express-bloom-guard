import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { filterAdd, filterHas } from './bloom-module.js';
import {performance} from 'perf_hooks';
import { exit } from 'process';

function benchJWTVerify() {
  const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET_KEY , { expiresIn: '1h' });

  const iterations = 10000;
  let startTime, endTime;

  console.log('Starting jwt verify benchmark...');
  startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
  }
  endTime = performance.now();

  console.log(`Time taken to verify token ${iterations} times: ${endTime - startTime} milliseconds`);
  console.log(`Average time taken to verify token: ${(endTime - startTime) / iterations} milliseconds`);
}

function generateClaims(NUM_ITEMS,nanoidLength = 21) {
  console.log('Generating claims...');
  const claims = [];

  for (let i = 0; i < NUM_ITEMS; i++) {
    claims.push('jti-' + nanoid(nanoidLength));
  }
  console.log('Claims generated : ' + claims.length);
  // console.log('Claims generated Number 0: ' + claims[0]);
  // console.log('Claims generated Number 500 000: ' + claims[500000]);
  // console.log('Claims generated Number 999 999: ' + claims[999999]);
  return claims;
}

function benchFilterAdd(claims) {
  const iterations = claims.length;
  let startTime, endTime;

  console.log('Starting filter add benchmark...');
  startTime = performance.now();
  for (const claim of claims) {
    filterAdd(claim);
  }
  endTime = performance.now();

  console.log(`filterAdd adds to current and next filters !`);
  console.log(`Time taken to add to filter ${iterations} times: ${endTime - startTime} milliseconds`);
  console.log(`Average time taken to add to filter: ${(endTime - startTime) / iterations} milliseconds`);
}

function benchFilterHas(claims) {
  const iterations = claims.length;
  let startTime, endTime;

  console.log('Starting filter has benchmark...');
  startTime = performance.now();
  for (const claim of claims) {
    filterHas(claim);
  }
  endTime = performance.now();

  console.log(`filterHas check previous and current filters !`);
  console.log(`Time taken to check filter ${iterations} times: ${endTime - startTime} milliseconds`);
  console.log(`Average time taken to check filter: ${(endTime - startTime) / iterations} milliseconds`);
}

function benchFalsePositiveRate() {
  const NUM_ITEMS = 1000000;
  const iterations = 1000;
  const falsePositives = 0;

  for (let i = 0; i < iterations; i++) {
    const claims = generateClaims(NUM_ITEMS, 32);
    for (const claim of claims) {
      filterHas(claim) && falsePositives++;
    }
    console.log('iteration: ' + i);
    console.log(`False positive with ${NUM_ITEMS} tokens : ${falsePositives}`);
  }
  console.log(`False positive rate with 1 billion tokens : ${falsePositives / (NUM_ITEMS * iterations)}`);
  console.log(`False positives with 1 billion tokens : ${falsePositives}`);
}

function benchBloomFilter() {
  const NUM_ITEMS = 1000000;
  const claims = generateClaims(NUM_ITEMS);
  benchFilterAdd(claims);
  benchFilterHas(claims);
}



benchJWTVerify();
benchBloomFilter();
//benchFalsePositiveRate(); // This will run indefinitely

exit(0); // Exit the process because filter rotation is on a timer