import {filterHas} from './bloom-module.js';

const claimsToCheck = ['jti', 'sub', 'fam'];

export default (req, res, next) => {
  try {
    for (const claim of claimsToCheck) {
      if (!req.token[claim]) {
        throw new Error(`Missing claim: ${ claim }`);
      }
      if (filterHas(claim + "-" + req.token[claim])) {
        throw new Error(`Token ${ claim } is blacklisted`);
      }
    }

    next();
  } catch (error) {
    // res.status(401).json({message: `Invalid token ! ${ error }`});
    res.status(401).json({message: `Invalid token ! ${ error }`});
  }
};