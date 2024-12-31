import { BloomFilter } from "bloomfilter";
import process from "process";

const NUM_ITEMS = 1000000;
const FP_RATE = 0.000000001;
const ROTATE_TIME = 1000 * 60 * 5; // 5 minutes

const start = process.memoryUsage();
console.log('Memory usage before module execution:', {
  rss: (start.rss / 1024 / 1024).toFixed(2) + ' MB',
  heapTotal: (start.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
  heapUsed: (start.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
  external: (start.external / 1024 / 1024).toFixed(2) + ' MB',
  arrayBuffers: (start.arrayBuffers / 1024 / 1024).toFixed(2) + ' MB'
});

let previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);

const step1 = process.memoryUsage();
console.log('Memory usage after initialization:', {
  rss: (step1.rss / 1024 / 1024).toFixed(2) + ' MB',
  heapTotal: (step1.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
  heapUsed: (step1.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
  external: (step1.external / 1024 / 1024).toFixed(2) + ' MB',
  arrayBuffers: (step1.arrayBuffers / 1024 / 1024).toFixed(2) + ' MB'
});

console.log('******* diff *******');
console.log('rss diff:', ((step1.rss - start.rss) / 1024 / 1024).toFixed(2) + ' MB');
console.log('heapTotal diff:', ((step1.heapTotal - start.heapTotal) / 1024 / 1024).toFixed(2) + ' MB');
console.log('heapUsed diff:', ((step1.heapUsed - start.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
console.log('external diff:', ((step1.external - start.external) / 1024 / 1024).toFixed(2) + ' MB');
console.log('arrayBuffers diff:', ((step1.arrayBuffers - start.arrayBuffers) / 1024 / 1024).toFixed(2) + ' MB');

for (let i = 0; i < 1000000; i++) {
  previous.add('jti-' + i);
  current.add('jti-' + i);
  next.add('jti-' + i);
}
const end = process.memoryUsage();
console.log('Memory usage after adding 1,000,000 tokens:', {
  rss: (end.rss / 1024 / 1024).toFixed(2) + ' MB',
  heapTotal: (end.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
  heapUsed: (end.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
  external: (end.external / 1024 / 1024).toFixed(2) + ' MB',
  arrayBuffers: (end.arrayBuffers / 1024 / 1024).toFixed(2) + ' MB'
});

console.log('******* diff *******');
console.log('rss diff:', ((end.rss - step1.rss) / 1024 / 1024).toFixed(2) + ' MB');
console.log('heapTotal diff:', ((end.heapTotal - step1.heapTotal) / 1024 / 1024).toFixed(2) + ' MB');
console.log('heapUsed diff:', ((end.heapUsed - step1.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
console.log('external diff:', ((end.external - step1.external) / 1024 / 1024).toFixed(2) + ' MB');
console.log('arrayBuffers diff:', ((end.arrayBuffers - step1.arrayBuffers) / 1024 / 1024).toFixed(2) + ' MB');

/*
Adding items does not affect external memory and arrayBuffers,
which is consistent with the BloomFilter implementation.

### Analysis of Results

1. Before initialization:
  - rss: 48.70 MB
  - external: 1.68 MB
  - arrayBuffers: 0.02 MB

2. After initialization:
  - rss: 49.08 MB
  - external: 17.10 MB
  - arrayBuffers: 15.44 MB

3. Differences:
  - rss diff: +0.38 MB
  - external diff: +15.43 MB
  - arrayBuffers diff: +15.43 MB

### Memory Used by Bloom Filters

- Total Memory Increase:
  - external + arrayBuffers = 15.43 MB + 15.43 MB = 30.86 MB

- Memory per Bloom Filter:
  - We have 3 Bloom filters (previous, current, next).
  - Memory per filter ≈ 30.86 MB / 3 ≈ 10.29 MB per filter.

### Conclusion

The three Bloom filters together consume approximately 30.86 MB of memory,
which corresponds to about 10.29 MB per Bloom filter. This estimate
is based on the increase in external memory and arrayBuffers
after the initialization of the filters.

### Note

The individual size of a Bloom filter depends on the parameters NUM_ITEMS
and FP_RATE. With NUM_ITEMS = 1,000,000 and FP_RATE = 1e-9, the theoretically
estimated memory for each filter is about 5.14 MB. However,
this implementation shows a usage of ~10 MB per filter, which
may be due to overheads related to the implementation or internal optimizations.
*/
