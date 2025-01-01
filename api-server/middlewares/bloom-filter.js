/**
 * Middleware factory to check claims with the Bloom filter.
 * @param {Array<string>} claimsToCheck - List of claims to check.
 * @param {BloomFilterManager} bloomFilterManager - Instance of the Bloom filter manager.
 * @returns {Function} Express middleware.
 */
// bloom-filter.js
export const createBloomMiddleware = (claimsToCheck, bloomFilterManager) => {
  console.log('Type of filterHas:', typeof bloomFilterManager.filterHas);
  
  return (req, res, next) => {
    try {
      for (const claim of claimsToCheck) {
        if (!req.token || !req.token[claim]) {
          throw new Error(`Missing claim: ${claim}`);
        }
        console.log(`${claim}-${req.token[claim]}`);
        if (bloomFilterManager.filterHas(`${claim}-${req.token[claim]}`)) {
          throw new Error(`Token ${claim} is blacklisted`);
        }
      }
      next();
    } catch (error) {
      res.status(401).json({ message: `Invalid token! ${error.message}` });
    }
  };
};
