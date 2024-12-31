import { BloomFilter } from "bloomfilter";
import { Mutex } from "async-mutex";

const NUM_ITEMS = 1000000;
const FP_RATE = 0.000000001;
const ROTATE_TIME = 1000 * 60 * 5; // 5 minutes

let previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);

const mutex = new Mutex(); // Create a lock

setInterval(rotate, ROTATE_TIME); // Rotate every 5 minutes for testing although ajust to token life time

async function rotate() {
  const release = await mutex.acquire(); // Acquire a lock for rotation
  try {
    previous = current;      // The current filter becomes the previous one
    current = next;             // The next one becomes the active filter
    next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE); // Initialize the new filter
  } finally {
    release(); // Release the lock
  }
}

export function filterClear() {
  previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
  current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
  next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
}

export function filterAdd(value) {
  current.add(value) && next.add(value); // No need for a lock
}

export function filterHas(value) {
  // Lock-free reading of the filters
  return current.test(value) || previous.test(value);
}