import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSubmission = [
  body('*').custom((value, { req }) => {
    const fieldCount = Object.keys(req.body).length;
    const maxFields = parseInt(process.env.MAX_FIELDS_PER_FORM || '50');
    if (fieldCount > maxFields) {
      throw new Error(`Too many fields. Maximum allowed: ${maxFields}`);
    }
    return true;
  }),
];

export const validateFormCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Form name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Form name must be between 3 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('redirect_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid redirect URL'),
  body('success_message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Success message must be less than 500 characters'),
];

export const validateFormUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Form name must be between 3 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('redirect_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid redirect URL'),
  body('success_message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Success message must be less than 500 characters'),
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};