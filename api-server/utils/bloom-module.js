import { BloomFilterManager } from "./BloomFilterManager.js";


// We can now use the Bloom filter manager to add and check different tokens.

const ACCESS_TOKEN_NUM_ITEMS = 1000000;
const ACCESS_TOKEN_FP_RATE = 0.000001; // 1e-6 pour les access tokens
const ACCESS_TOKEN_ROTATE_TIME = 30 * 60 * 1000; // 30 minutes

const REFRESH_TOKEN_NUM_ITEMS = 100000;
const REFRESH_TOKEN_FP_RATE = 0.00001; // 1e-5 pour les refresh tokens
const REFRESH_TOKEN_ROTATE_TIME = 24 * 60 * 60 * 1000; // 24 heures

// Instantiation of managers
// let accessTokenBloomInstance = null;
// let refreshTokenBloomInstance = null;

/**
 * Returns the Singleton instance of AccessTokenBloom.
 */
// export const getAccessTokenBloom = () => {
//   if (!accessTokenBloomInstance) {
//     accessTokenBloomInstance = new BloomFilterManager({
//       numItems: 1000000,
//       fpRate: 0.000001, // 1e-6 for access tokens
//       rotateTime: 30 * 60 * 1000, // 30 minutes
//     });
//   }
//   return accessTokenBloomInstance;
// };

export const accessTokenBloom = new BloomFilterManager({
  numItems: 1000000,
  fpRate: 0.000001, // 1e-6 for access tokens
  rotateTime: 30 * 60 * 1000, // 30 minutes
});

/**
 * Returns the Singleton instance of RefreshTokenBloom.
 */
// export const getRefreshTokenBloom = () => {
//   if (!refreshTokenBloomInstance) {
//     refreshTokenBloomInstance = new BloomFilterManager({
//       numItems: 100000,
//       fpRate: 0.00001, // 1e-5 for refresh tokens
//       rotateTime: 24 * 60 * 60 * 1000, // 24 hours
//     });
//   }
//   return refreshTokenBloomInstance;
// };

export const refreshTokenBloom = new BloomFilterManager({
  numItems: 100000,
  fpRate: 0.00001, // 1e-5 for refresh tokens
  rotateTime: 24 * 60 * 60 * 1000, // 24 hours
});