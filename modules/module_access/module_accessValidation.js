const httpStatus = require('http-status');
const isEmpty = require('../../validation/isEmpty');
const menuConfig = require('./module_accessConfig');
const otherHelper = require('../../helper/others.helper');
const sanitizeHelper = require('../../helper/sanitize.helper');
const validateHelper = require('../../helper/validate.helper');
const  menuSch  = require('../../schema/module_accessschema')
const validation = {};

validation.sanitize = (req, res, next) => {
  const sanitizeArray = [
    {
      field: 'module_id',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'sub_module_id',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'restricted_menu',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'access_name',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'client_route',
      sanitize: {
        trim: true,
      },
    },
    {
      field: 'is_active',
      sanitize: {
        trim: true,
      },
    },
  ];
  sanitizeHelper.sanitize(req, sanitizeArray);
  next();
};

validation.validate = async (req, res, next) => {
  const data = req.body;
  const validateArray = [
    {
      field: 'module_id',
      validate: [
        {
          condition: 'IsEmpty',
          msg: menuConfig.validate.empty,
        },
      ],
    },
    // {
    //   field: 'sub_module_id',
    //   validate: [
    //     {
    //       condition: 'IsEmpty',
    //       msg: menuConfig.validate.empty,
    //     },
    //   ],
    // },
    {
      field: 'access_name',
      validate: [
        {
          condition: 'IsEmpty',
          msg: menuConfig.validate.empty,
        },
       
      ],
    },
    {
      field: 'client_route',
      validate: [
        {
          condition: 'IsEmpty',
          msg: menuConfig.validate.empty,
        },
      ],
    },
    {
      field: 'is_active',
      validate: [
        {
          condition: 'IsEmpty',
          msg: menuConfig.validate.empty,
        },
       
      ],
    }
  ];
  let errors = validateHelper.validation(data, validateArray);

  let key_filter = { is_deleted: false, key: data.key }
  if (data._id) {
    key_filter = { ...key_filter, _id: { $ne: data._id } }
  }
  const already_key = await menuSch.findOne(key_filter);
  if (already_key && already_key._id) {
    errors = { ...errors, key: 'key already exist' }
  }

  if (!isEmpty(errors)) {
    return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, errors, menuConfig.errorIn.invalidInputs, null);
  } else {
    next();
  }
};

module.exports = validation;
