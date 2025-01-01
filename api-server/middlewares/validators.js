import { param, validationResult } from 'express-validator';

// Validation middleware for the /revoke/:claim/:value route
export const validateRevoke = [
  param('claim')
    .isString().withMessage('Claim must be a string.')
    .isLength({ min: 3, max: 36 }).withMessage('Claim must be between 3 and 36 characters long.'),
  param('value')
    .isString().withMessage('Value must be a string.')
    .isLength({ min: 3, max: 50 }).withMessage('Value must be between 3 and 50 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for the /check/:claim/:value route
export const validateCheck = [
  param('claim')
    .isString().withMessage('Claim must be a string.')
    .isLength({ min: 3, max: 36 }).withMessage('Claim must be between 3 and 36 characters long.'),
  param('value')
    .isString().withMessage('Value must be a string.')
    .isLength({ min: 3, max: 50 }).withMessage('Value must be between 3 and 50 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for the /addClaim/:claim route
export const validateAddClaim = [
  param('claim')
    .isString().withMessage('Claim must be a string.')
    .isLength({ min: 3, max: 36 }).withMessage('Claim must be between 3 and 36 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];