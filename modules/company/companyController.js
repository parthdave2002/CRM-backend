const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const comapnySch = require('./companySchema');
const { getAccessData } = require('../../helper/Access.helper');
const companyConfig = require('./companyConfig');
const companyController = {};

// Role API Code End
companyController.GetCompanylist = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);
    if (req.query.page && req.query.page == 0) {
      selectQuery = 'name description is_active is_deleted';
      const roles = await comapnySch.find(searchQuery).select(selectQuery);
      return otherHelper.sendResponse(res, httpStatus.OK, true, roles, null, 'all company get success!', null);
    }


    if (req.query.is_active) {
      searchQuery = { is_active: true, ...searchQuery };
    }
    let pulledData = await otherHelper.getQuerySendResponse(comapnySch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    let AccessData = await getAccessData(req);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, {pulledData:pulledData.data,  AccessData: AccessData}, companyConfig.roleGet, page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

companyController.AddCompany = async (req, res, next) => {
  try {
    const role = req.body;
    if (role.id) {
      const update = await comapnySch.findByIdAndUpdate(role.id, { $set: role }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, companyConfig.roleSave, null);
    } else {
      role.added_by = req.user.id;
      const newRole = new comapnySch(role);
      await newRole.save();

      return otherHelper.sendResponse(res, httpStatus.OK, true, newRole, null, companyConfig.roleSave, null);
    }
  } catch (err) {
    next(err);
  }
};

companyController.DeleteCompany = async (req, res, next) => {
  try {
    const id = req.query.id;
    const theme = await comapnySch.findByIdAndUpdate(id, {
      $set: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return otherHelper.sendResponse(res, httpStatus.OK, true, theme, null, 'theme delete', null);
  } catch (err) {
    next(err);
  }
};

module.exports = companyController;
