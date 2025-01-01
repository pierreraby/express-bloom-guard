// Description: Middleware to verify the token
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.token = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({message: `Invalid token Auth! ${ error }`});
  }
};

export const admin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.token = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!req.token.admin === 'yes') {
      throw new Error('You are not an admin');
    }
    next();
  } catch (error) {
    res.status(401).json({message: `Invalid token ! ${ error }`});
  }
};