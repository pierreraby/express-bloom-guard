import {has} from './bloom-module.js';

export default (req, res, next) => {
  try {
    if (has(req.token.jti)) {
      throw new Error('Token is blacklisted');
    }
    next();
  } catch (error) {
    // res.status(401).json({message: `Invalid token ! ${ error }`});
    res.status(401).json({message: `Invalid token ! ${ error }`});
  }
};