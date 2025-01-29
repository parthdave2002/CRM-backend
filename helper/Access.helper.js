'use strict';
const httpStatus = require('http-status');
const otherHelper = require('./others.helper');
const module_user_accessSchema = require('../schema/module_user_accessschema');
const module_access = require('../schema/module_accessschema');

const AccessHelper = {};

AccessHelper.getAccessData = async (req, res, next) => {
  try {
    const submodule = req.query.sub_module_id;
    const id = req.user.roles[0]._id;
    const AccessData = await module_user_accessSchema.find({ role_id: id, sub_module_id: { $in: submodule } }).select('access_name  sub_module_id');
    if (AccessData.length <= 0) {
      return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, 'Permission Denied', null);
    }

    return AccessData;
  } catch (err) {
    return err;
  }
};

AccessHelper.getLayoutData = async (req, res, next) => {
  try {
    const submodule = req.query.sub_module_id;
    const id = req.user.roles[0]._id;
    const LayoutData = await module_access.find({ sub_module_id: { $in: submodule } }).select('restricted_menu');
    if (LayoutData.length <= 0) {
      return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, 'LayoutData is Not Defined', null);
    }

    return LayoutData;
  } catch (err) {
    return err;
  }
};

AccessHelper.sendResponse = (res, status, success, data, errors, msg, token) => {
  const response = {};
  if (success !== null) response.success = success;
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  if (msg !== null) response.msg = msg;
  if (token !== null) response.token = token;
  return res.status(status).json(response);
};

AccessHelper.paginationSendResponse = (res, status, success, data, msg, pageNo, pagesize, totalData) => {
  const response = {};
  if (data) response.data = data;
  if (success !== null) response.success = success;
  if (msg) response.msg = msg;
  if (pageNo) response.page = pageNo;
  if (pagesize) response.size = pagesize;
  if (typeof totalData === 'number') response.totalData = totalData;
  return res.status(status).json(response);
};

AccessHelper.regexp = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\/^$|#]/g, ''); // Remove all non-word chars
};
module.exports = AccessHelper;
