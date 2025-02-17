const httpStatus = require('http-status');
const isEmpty = require('../../validation/isEmpty');
const config = require('./companyConfig');
const otherHelper = require('../../helper/others.helper');
const sanitizeHelper = require('../../helper/sanitize.helper');
const validateHelper = require('../../helper/validate.helper');
const roleConfig = require('./companyConfig');
const companySch = require('./companySchema');
const validations = {};

validations.validateRole = async (req, res, next) => {
  const data = req.body;
  const validationArray = [
    {
      field: 'name',
      validate: [
        {
          condition: 'IsEmpty',
          msg: config.validate.empty,
        },
        {
          condition: 'IsLength',
          msg: config.validate.rolesLength,
          option: { min: 2, max: 20 },
        },
      ],
    },
    {
      field: 'description',
      validate: [
        {
          condition: 'IsEmpty',
          msg: config.validate.empty,
        },
        {
          condition: 'IsLength',
          msg: config.validate.descriptionLength,
          option: { min: 5, max: 200 },
        },
      ],
    },
  ];
  let errors = validateHelper.validation(data, validationArray);

  let company_filter = { is_deleted: false, name: data.name };
  if (data._id) {
    company_filter = { ...company_filter, _id: { $ne: data._id } };
  }
  const already_role = await companySch.findOne(company_filter);
  if (already_role && already_role._id) {
    errors = { ...errors, name: 'company already exist' };
  }

  if (!isEmpty(errors)) {
    return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, errors, roleConfig.errorIn.inputErrors, null);
  } else {
    next();
  }
};

validations.sanitizeRole = (req, res, next) => {
  const sanitizeArray = [
    {
      field: 'name',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'description',
      sanitize: {
        trim: true,
      },
    },
  ];
  sanitizeHelper.sanitize(req, sanitizeArray);
  next();
};


module.exports = validations;
