import { BloomFilter } from "bloomfilter";
import process from "process";

// const NUM_ITEMS = 1000000000; // 1 billion items
// const FP_RATE = 0.000000001; // 1e-9

const NUM_ITEMS = 1000000;  // 1 million items
const FP_RATE = 0.000001; // 1e-6

function logMemoryUsage(memoryUsage) {
  console.log('Utilisation de la mémoire :', {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
    arrayBuffers: `${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
  });
  console.log('************************************************');
  }

  function logMemoryDiff(memorystart, memoryend) {
    console.log('Différence d\'utilisation de la mémoire :', {
    rss: `${((memoryend.rss - memorystart.rss) / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${((memoryend.heapTotal - memorystart.heapTotal) / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${((memoryend.heapUsed - memorystart.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
    external: `${((memoryend.external - memorystart.external) / 1024 / 1024).toFixed(2)} MB`,
    arrayBuffers: `${((memoryend.arrayBuffers - memorystart.arrayBuffers) / 1024 / 1024).toFixed(2)} MB`
    });
    console.log('************************************************');
  }

const start = process.memoryUsage();
console.log('Memory usage before initialization:');
logMemoryUsage(start);

let previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);

const step1 = process.memoryUsage();
console.log('Memory usage after initialization:');
logMemoryUsage(step1);
logMemoryDiff(start, step1);

console.log('Estimation de la mémoire utilisée par les filtres de Bloom :', {
  total: `${((step1.external + step1.arrayBuffers) / 1024 / 1024).toFixed(2)} MB`,
  perFilter: `${((step1.external + step1.arrayBuffers) / 3 / 1024 / 1024).toFixed(2)} MB`
});

/*
Due to this implementation, adding items in the Bloom filter
does not affect the memory by the process.

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

- Memory Increase:
  arrayBuffers is included in external memory too.
  external memory increased by 15.43 MB after the initialization of the filters.


- Memory per Bloom Filter:
  - We have 3 Bloom filters (previous, current, next).
  - Memory per filter ≈ 15.44 MB / 3 ≈ 5.15 MB per filter.

### Conclusion

The three Bloom filters together consume approximately 15.44 MB of memory,
which corresponds to about 5.14 MB per Bloom filter. This estimate
is based on the increase in external memory and arrayBuffers
after the initialization of the filters.

### Note

The individual size of a Bloom filter depends on the parameters NUM_ITEMS
and FP_RATE. With NUM_ITEMS = 1,000,000 and FP_RATE = 1e-9, the theoretically
estimated memory for each filter is about 5.14 MB. However,
this implementation shows a usage of 5.14 MB per filter, which is close to the
theoretical estimate.
*/
