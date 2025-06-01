const httpStatus = require('http-status');
const isEmpty = require('./isEmpty');
const config = require('./config');
const otherHelper = require('../helper/others.helper');
const sanitizeHelper = require('../helper/sanitize.helper');
const validateHelper = require('../helper/validate.helper');
const validations = {};

// Define validation rules
const ValidationRules = {
  name_eng: [
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsLength', msg: config.validate.nameLength, option: { min: 2, max: 50 } }
  ],
  name_guj: [
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsLength', msg: config.validate.nameLength, option: { min: 2, max: 50 } }
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
  ],
  description:[
    { condition: 'IsEmpty', msg: config.validate.empty },
    { condition: 'IsLength', msg: config.validate.nameLength, option: { min: 2, max: 100 } }
  ]
};

const sanitizeFields = (fields) => { 
  return async (req, res, next) => {
  try {
      const sanitizeArray = fields.map(data => ({ field:data,  sanitize: { trim: true } }));
      await sanitizeHelper.sanitize(req, sanitizeArray);
      next();
  } catch (error) {
    console.error("Sanitization error:", error);
    next(error);
  }
}
};

const validateFields = (validationRules) => (req, res, next) => {

  if (!Array.isArray(validationRules) || validationRules.length === 0) {
    console.error("Validation rules are missing or invalid.");
    return next();
  }

  const errors = validateHelper.validation(req.body, validationRules);

  // If errors exist, send a response
  if (!isEmpty(errors)) {
    return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, errors, null);
  }
 
  next();  
};


const getValidationRules = async (fields) => {
  return await Promise.resolve(
    fields.filter((field) => ValidationRules[field]) // Only return existing fields
    .map((field) => ({
      field,
      validate: ValidationRules[field]
    }))
  )
};

validations.sanitizeAndValidate =  (fields) => {
  if (!fields || !Array.isArray(fields)) {
    console.error("sanitizeAndValidate: Expected an array, but got:", fields);
    return { sanitize: (req, res, next) => next(), validate: (req, res, next) => next() };
  }
  
  const sanitize =  sanitizeFields(fields);

  return {
    sanitize,
    validate: async (req, res, next) => {
      try {
        const validationRules = await getValidationRules(fields); // Await the Promise to get rules
        const validate = validateFields(validationRules);
        return validate(req, res, next);
      } catch (error) {
        console.error("Validation error:", error);
        next(error);
      }
    }
  };
  // const validationRules  = getValidationRules(fields);                                                          
  // const validate = validateFields(validationRules);
  // return { sanitize, validate };
};

module.exports = validations;
