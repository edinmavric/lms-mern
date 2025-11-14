const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

const validationRules = {
  objectId: (field = 'id') => [
    param(field)
      .isMongoId()
      .withMessage(`${field} must be a valid MongoDB ObjectId`),
  ],

  email: (field = 'email') => [
    body(field)
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
      .isLength({ max: 254 })
      .withMessage('Email must not exceed 254 characters'),
  ],

  password: (field = 'password') => [
    body(field)
      .isString()
      .withMessage('Password must be a string')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain at least one special character'),
  ],

  string: (field, options = {}) => {
    const { min = 1, max = 255, optional = false } = options;
    let validator = body(field);

    if (optional) {
      validator = validator.optional();
    }

    return [
      validator
        .isString()
        .withMessage(`${field} must be a string`)
        .trim()
        .isLength({ min, max })
        .withMessage(`${field} must be between ${min} and ${max} characters`),
    ];
  },

  number: (field, options = {}) => {
    const { min, max, optional = false } = options;
    let validator = body(field);

    if (optional) {
      validator = validator.optional();
    }

    validator = validator
      .isNumeric()
      .withMessage(`${field} must be a number`);

    if (min !== undefined) {
      validator = validator.custom(val => val >= min)
        .withMessage(`${field} must be at least ${min}`);
    }

    if (max !== undefined) {
      validator = validator.custom(val => val <= max)
        .withMessage(`${field} must not exceed ${max}`);
    }

    return [validator];
  },

  date: (field = 'date') => [
    body(field)
      .isISO8601()
      .withMessage(`${field} must be a valid date (ISO 8601 format)`),
  ],

  role: (field = 'role') => [
    body(field)
      .isIn(['admin', 'professor', 'student'])
      .withMessage('Role must be one of: admin, professor, student'),
  ],

  status: (field = 'status') => [
    body(field)
      .isIn(['active', 'pending', 'disabled'])
      .withMessage('Status must be one of: active, pending, disabled'),
  ],

  boolean: (field, optional = false) => {
    let validator = body(field);

    if (optional) {
      validator = validator.optional();
    }

    return [
      validator
        .isBoolean()
        .withMessage(`${field} must be a boolean`),
    ];
  },

  array: (field, options = {}) => {
    const { min, max, optional = false } = options;
    let validator = body(field);

    if (optional) {
      validator = validator.optional();
    }

    validator = validator
      .isArray()
      .withMessage(`${field} must be an array`);

    if (min !== undefined) {
      validator = validator.isLength({ min })
        .withMessage(`${field} must contain at least ${min} items`);
    }

    if (max !== undefined) {
      validator = validator.isLength({ max })
        .withMessage(`${field} must not contain more than ${max} items`);
    }

    return [validator];
  },

  time: (field) => [
    body(field)
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(`${field} must be in HH:mm format (e.g., 09:00)`),
  ],

  searchQuery: (field = 'query') => [
    query(field)
      .optional()
      .isString()
      .withMessage(`${field} must be a string`)
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(`${field} must be between 1 and 100 characters`),
  ],

  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],
};

const validateUserCreate = [
  ...validationRules.email(),
  ...validationRules.password(),
  ...validationRules.string('firstName', { min: 1, max: 100 }),
  ...validationRules.string('lastName', { min: 1, max: 100 }),
  ...validationRules.role(),
  handleValidationErrors,
];

const validateUserUpdate = [
  ...validationRules.objectId('id'),
  ...validationRules.email().map(v => v.optional()),
  ...validationRules.string('firstName', { min: 1, max: 100, optional: true }),
  ...validationRules.string('lastName', { min: 1, max: 100, optional: true }),
  body('role')
    .optional()
    .isIn(['admin', 'professor', 'student'])
    .withMessage('Role must be one of: admin, professor, student'),
  body('status')
    .optional()
    .isIn(['active', 'pending', 'disabled'])
    .withMessage('Status must be one of: active, pending, disabled'),
  handleValidationErrors,
];

const validateCourseCreate = [
  ...validationRules.string('name', { min: 1, max: 200 }),
  ...validationRules.string('description', { min: 0, max: 1000, optional: true }),
  body('professor')
    .isMongoId()
    .withMessage('Professor must be a valid MongoDB ObjectId'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Department must be a valid MongoDB ObjectId'),
  ...validationRules.number('credits', { min: 1, max: 20, optional: true }),
  ...validationRules.string('semester', { min: 1, max: 50, optional: true }),
  handleValidationErrors,
];

const validateLessonCreate = [
  body('course')
    .isMongoId()
    .withMessage('Course must be a valid MongoDB ObjectId'),
  ...validationRules.string('title', { min: 1, max: 200 }),
  ...validationRules.string('description', { min: 0, max: 1000, optional: true }),
  ...validationRules.date(),
  ...validationRules.time('startTime'),
  ...validationRules.time('endTime'),
  ...validationRules.string('location', { min: 0, max: 200, optional: true }),
  handleValidationErrors,
];

const validateGradeCreate = [
  body('student')
    .isMongoId()
    .withMessage('Student must be a valid MongoDB ObjectId'),
  body('course')
    .isMongoId()
    .withMessage('Course must be a valid MongoDB ObjectId'),
  ...validationRules.number('value', { min: 1, max: 5 }),
  ...validationRules.string('comment', { min: 0, max: 500, optional: true }),
  ...validationRules.number('attempt', { min: 1, max: 10, optional: true }),
  handleValidationErrors,
];

const validateLogin = [
  ...validationRules.email(),
  body('password')
    .isString()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password cannot be empty'),
  body('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  body('tenantName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tenant name must be between 1 and 100 characters'),
  handleValidationErrors,
];

const validateForgotPassword = [
  ...validationRules.email(),
  body('tenantId')
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

const validateResetPassword = [
  body('token')
    .isString()
    .notEmpty()
    .withMessage('Token is required')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid token format'),
  ...validationRules.password('newPassword'),
  body('tenantId')
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validationRules,
  validateUserCreate,
  validateUserUpdate,
  validateCourseCreate,
  validateLessonCreate,
  validateGradeCreate,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
