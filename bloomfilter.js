import {has} from './bloommodule.js';

export default (req, res, next) => {
  try {
    console.log(req.token.jti);
    if (has(req.token.jti)) {
      throw new Error('Token is blacklisted');
    }
    next();
  } catch (error) {
    // res.status(401).json({message: `Invalid token ! ${ error }`});
    res.status(401).json({message: `Invalid token ! ${ error }`});
  }
};