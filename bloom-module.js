import { BloomFilter } from "bloomfilter";
import { Mutex } from "async-mutex";

const NUM_ITEMS = 1000000;
const FP_RATE = 0.000000001;
const ROTATE_TIME = 1000 * 60 * 5; // 5 minutes

let previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
let next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);

const mutex = new Mutex(); // Crée un verrou

setInterval(rotate, ROTATE_TIME); // Rotation toutes les 5 minutes

export function clear() {
  previous = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
  current = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
  next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE);
}

async function rotate() {
  const release = await mutex.acquire(); // Acquiert un verrou pour la rotation
  try {
    previous = current;      // Le filtre actuel devient le précédent
    current = next;             // Le prochain devient le filtre actif
    next = BloomFilter.withTargetError(NUM_ITEMS, FP_RATE); // Initialise le nouveau filtre
  } finally {
    release(); // Libère le verrou
  }
}

export function add(value) {
  current.add(value) && next.add(value); // Pas besoin de verrou
}

export function has(value) {
  // Lecture en "lock-free" des filtres
  return current.test(value) || previous.test(value);
}



