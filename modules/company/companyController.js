const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const companySch = require('../../schema/companySchema');
const { getAccessData } = require('../../helper/Access.helper');
const companyController = {};

companyController.GetCompanylist = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);
    if (req.query.page && req.query.page == 0) {
      selectQuery = 'name description is_active is_deleted';
      const company = await companySch.find(searchQuery).select(selectQuery);
      return otherHelper.sendResponse(res, httpStatus.OK, true, company, null, 'all company get success!', null);
    }


    if (req.query.is_active) {
      searchQuery = { is_active: true, ...searchQuery };
    }
    let pulledData = await otherHelper.getQuerySendResponse(companySch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    let AccessData = await getAccessData(req);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, {pulledData:pulledData.data,  AccessData: AccessData}, "company get successful!", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

companyController.AddCompany = async (req, res, next) => {
  try {
    const Company = req.body;
    if (Company._id) {
      const update = await companySch.findByIdAndUpdate(Company._id, { $set: Company }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Company Data updated successfully ", null);
    } else {

      const existingCompany = await companySch.findOne({ name: Company.name });
      if(existingCompany){
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Company already exist ", null);
      }
      
      const newcompany = new companySch(Company);
      await newcompany.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newcompany, null, "Company Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

companyController.DeleteCompany = async (req, res, next) => {
  try {
    const id = req.query.id;
    const theme = await companySch.findByIdAndUpdate(id, {
      $set: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return otherHelper.sendResponse(res, httpStatus.OK, true, theme, null, 'company delete successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = companyController;
