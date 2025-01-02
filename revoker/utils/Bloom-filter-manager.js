import { Mutex } from 'async-mutex';
import { BloomFilter } from 'bloomfilter';

// Default configuration (can be overridden during instantiation)
const DEFAULT_ROTATE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds for testing purposes

export class BloomFilterManager {
  /**
   * Constructor to initialize the Bloom filter manager.
   * @param {Object} options - Configuration options.
   * @param {number} options.numItems - Number of items to store.
   * @param {number} options.fpRate - Target false positive rate.
   * @param {number} options.rotateTime - Filter rotation interval in ms.
   */
  constructor({ numItems, fpRate, rotateTime = DEFAULT_ROTATE_TIME }) {
    this.numItems = numItems;
    this.fpRate = fpRate;
    this.rotateTime = rotateTime;

    this.mutex = new Mutex(); // Create a lock

    // Initialize the filters
    this.filterClear();

    // Start the rotation interval
    this.rotationInterval = setInterval(() => this.rotate(), this.rotateTime);
  }

  /**
   * Rotates the Bloom filters.
   */
  async rotate() {
    const release = await this.mutex.acquire(); // Acquire a lock for rotation
    try {
      this.previous = this.current; // The current filter becomes the previous one
      this.current = this.next; // The next filter becomes the active one
      this.next = BloomFilter.withTargetError(this.numItems, this.fpRate); // Initialize the new filter
      console.log('Bloom filters rotated.');
    } catch (error) {
      console.error('Error during Bloom filter rotation:', error);
    } finally {
      release(); // Release the lock
    }
  }

  /**
   * Resets all Bloom filters.
   */
  filterClear() {
    this.previous = BloomFilter.withTargetError(this.numItems, this.fpRate);
    this.current = BloomFilter.withTargetError(this.numItems, this.fpRate);
    this.next = BloomFilter.withTargetError(this.numItems, this.fpRate);
    console.log('Bloom filters cleared.');
  }

  /**
   * Adds a value to the current and next Bloom filters.
   * @param {string} value - The value to add.
   */
  filterAdd(value) {
    this.current.add(value);
    this.next.add(value);
  }

  /**
   * Checks for the presence of a value in the current and previous Bloom filters.
   * @param {string} value - The value to check.
   * @returns {boolean} - `true` if the value might be present, `false` if it is definitely absent.
   */
  filterHas(value) {
    return this.current.test(value) || this.previous.test(value);
  }

  /**
   * Stops the Bloom filter rotation interval.
   */
  stopRotation() {
    clearInterval(this.rotationInterval);
    console.log('Bloom filter rotation stopped.');
  }
}