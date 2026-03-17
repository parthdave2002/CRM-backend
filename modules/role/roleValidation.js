const httpStatus = require('http-status');
const isEmpty = require('../../validation/isEmpty');
const config = require('./roleConfig');
const otherHelper = require('../../helper/others.helper');
const sanitizeHelper = require('../../helper/sanitize.helper');
const validateHelper = require('../../helper/validate.helper');
const roleConfig = require('./roleConfig');
const roleSch = require('../../schema/roleSchema');
const validations = {};

validations.validateRole = async (req, res, next) => {
  const data = req.body;
  const validationArray = [
    {
      field: 'role_title',
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

  let role_filter = { is_deleted: false, role_title: data.role_title };
  if (data._id) {
    role_filter = { ...role_filter, _id: { $ne: data._id } };
  }
  const already_role = await roleSch.findOne(role_filter);
  if (already_role && already_role._id) {
    errors = { ...errors, role_title: 'role already exist' };
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
      field: 'role_title',
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
