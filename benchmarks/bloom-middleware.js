import {filterHas} from './bloom-module.js';

const claimsToCheck = ['jti', 'fam', 'sub', 'admin'];
// jti: revoke a device user session
// fam: revoke all devices user sessions -> change family uuid claim when reconnecting
// sub: you are fired !!!
// admin: you are not an admin anymore

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