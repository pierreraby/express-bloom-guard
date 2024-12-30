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

function generateClaims(NUM_ITEMS) {
  console.log('Generating claims...');
  const claims = [];

  for (let i = 0; i < NUM_ITEMS; i++) {
    claims.push('jti-' + nanoid());
  }
  console.log('Claims generated : ' + claims.length);
  console.log('Claims generated : ' + claims[500000]);
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

  console.log(`Time taken to check filter ${iterations} times: ${endTime - startTime} milliseconds`);
  console.log(`Average time taken to check filter: ${(endTime - startTime) / iterations} milliseconds`);
}

function benchBloomFilter() {
  const NUM_ITEMS = 1000000;
  const claims = generateClaims(NUM_ITEMS);
  benchFilterAdd(claims);
  benchFilterHas(claims);
}

benchJWTVerify();
benchBloomFilter();

exit(0); // Exit the process because filter rotation is on a timer