const httpStatus = require('http-status');
const isEmpty = require('./isEmpty');
const config = require('./config');
const otherHelper = require('../helper/others.helper');
const sanitizeHelper = require('../helper/sanitize.helper');
const validateHelper = require('../helper/validate.helper');
const validations = {};

// Define validation rules
const userValidationRules = {
  name: [
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsLength', msg: config.validate.nameLength, option: { min: 2, max: 100 } }
  ],
  email: [
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsEmail', msg: config.validate.isEmail }
  ],
  password: [
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsLength', msg: config.validate.pwLength, option: { min: 6, max: 100 } }
  ],
  roles: [
    { condition: 'IsEmpty', msg: config.validate.empty }
  ],
  role_title: [
    { condition: 'IsEmpty', msg: config.validate.empty }
  ]
};

const sanitizeFields = (fields) => (req, res, next) => {
  console.log("sanitizeFields -------", fields);

  if (!fields || !Array.isArray(fields)) {
    console.error("sanitizeFields: fields should be an array, but got:", fields);
    return next(); // Prevent crashing
  }


  const sanitizeArray = fields.map(field => ({
    field:fields,
    sanitize: { trim: true },
  }));
  console.log("sanitizeFields -------", fields);
  sanitizeHelper.sanitize(req, sanitizeArray);
  next();
};

// const validateFields = (validationRules) => (req, res, next) => {
//   console.log("Errorrrrr", validationRules);
//   if (!validationRules || !Array.isArray(validationRules)) {
//     console.error("validateFields: validationRules should be an array, but got:", validationRules);
//     return next(); // Prevent crashing
//   }
//   const data = req.body;
//   const errors = validateHelper.validation(data, validationRules);
//   console.log("Errorrrrr", errors);
  
//   if (!isEmpty(errors)) {
//     return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, errors, config.validate.invalidInput, null);
//   }
//   next();
// };

const validateFields = (validationRules) => (req, res, next) => {
  console.log("Validating fields:", validationRules); 
  next();  // Proceed to next middleware
};


const getValidationRules = (fields) => {
  console.log("fields", fields);
  
  return fields
    .filter((field) => userValidationRules[field]) // Only return existing fields
    .map((field) => ({
      field,
      validate: userValidationRules[field]
    }));
};

validations.sanitizeAndValidate = (fields) => {
  if (!fields || !Array.isArray(fields)) {
    console.error("sanitizeAndValidate: Expected an array, but got:", fields);
    return { sanitize: (req, res, next) => next(), validate: (req, res, next) => next() };
  }
  
  const sanitize = sanitizeFields(fields);
  const validate = validateFields(getValidationRules(fields));
  return { sanitize, validate };
};

module.exports = validations;
