const { body, param, query, validationResult } = require('express-validator');
const ErrorHandler = require('./error');

//  Validation Error Handler 
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages,
    });
  }
  next();
};

//  Authentication Validation 
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  handleValidationErrors,
];

//  Comment Validation 
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage('Comment must be between 2 and 1000 characters')
    .escape()
    .withMessage('Invalid characters in comment'),
  handleValidationErrors,
];

const validateCommentId = [
  param('commentId')
    .isMongoId()
    .withMessage('Invalid comment ID'),
  handleValidationErrors,
];

const validatePostId = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  handleValidationErrors,
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

//  Password Validation 
const validatePasswordReset = [
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .trim()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateComment,
  validateCommentId,
  validatePostId,
  validatePagination,
  validatePasswordReset,
  handleValidationErrors,
};