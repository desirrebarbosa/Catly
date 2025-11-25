const { body } = require('express-validator');

const createCatValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Cat name is required'),
  
  body('gender')
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid birth date format'),
    
  body('isSpayed')
    .optional()
    .isBoolean()
];

const updateCatValidator = [
  body('name').optional().trim().notEmpty(),
  body('gender').optional().isIn(['Male', 'Female']),
  body('weight').optional().isFloat({ min: 0 })
];

module.exports = {
  createCatValidator,
  updateCatValidator
};