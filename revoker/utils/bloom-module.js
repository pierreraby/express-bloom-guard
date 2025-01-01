import { BloomFilterManager } from "./BloomFilterManager.js";

// We can now use the Bloom filter manager to add and check different tokens.

const ACCESS_TOKEN_NUM_ITEMS = 1000000;
const ACCESS_TOKEN_FP_RATE = 0.000001; // 1e-6 for access tokens
const ACCESS_TOKEN_ROTATE_TIME = 30 * 60 * 1000; // 30 minutes

const REFRESH_TOKEN_NUM_ITEMS = 100000;
const REFRESH_TOKEN_FP_RATE = 0.00001; // 1e-5 for refresh tokens
const REFRESH_TOKEN_ROTATE_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Managers instantiation
export const accessTokenBloom = new BloomFilterManager({
  numItems: ACCESS_TOKEN_NUM_ITEMS,
  fpRate: ACCESS_TOKEN_FP_RATE,
  rotateTime: ACCESS_TOKEN_ROTATE_TIME
});

export const refreshTokenBloom = new BloomFilterManager({
  numItems: REFRESH_TOKEN_NUM_ITEMS,
  fpRate: REFRESH_TOKEN_FP_RATE,
  rotateTime: REFRESH_TOKEN_ROTATE_TIME
});