import { body } from 'express-validator';

// Validators for user signup
export const signupValidators = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  // Username validation
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)'),
];

// Validators for user login
export const loginValidators = [
  // Username validation
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validator for user logout
export const logoutValidator = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
]; 