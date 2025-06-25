const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const companySch = require('../../schema/companySchema');
const productSchema = require('../../schema/productSchema');
const companyController = {};

companyController.GetCompanylist = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);
   
    searchQuery = { ...searchQuery, is_deleted: false };
    if (req.query.page && req.query.page == 0) {
      selectQuery = 'name description is_active is_deleted';
      const company = await companySch.find(searchQuery).select(selectQuery);
      return otherHelper.sendResponse(res, httpStatus.OK, true, company, null, 'all company get success!', null);
    }

    if (req.query.id) {
      const user = await companySch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Company data get successfully', null);
    }

    if (req.query.all) {
        const company = await companySch.find(searchQuery);
        return otherHelper.sendResponse(res, httpStatus.OK, true, company, null, 'Company data get successfully', null);
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await companySch.find({
        $or: [{ name_eng: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0)  return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search Data found', page, size, searchResults.length);
    }

    if (req.query.is_active) {
      searchQuery = { is_active: true, ...searchQuery };
    }
    let pulledData = await otherHelper.getQuerySendResponse(companySch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Company  data get successfully!", page, size, pulledData.totalData);
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
      const enexistingCompany = await companySch.findOne({ name_eng: Company.name_eng, is_deleted: false });
      if(enexistingCompany) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "English company name already exist ", null);
      
      const guexistingCompany = await companySch.findOne({ name_guj: Company.name_guj, is_deleted: false });
      if(guexistingCompany) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Gujarati company name already exist ", null);
    
      const newcompany = new companySch(Company);
      await newcompany.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newcompany, null, "Company Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

companyController.changeStatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Company ID is required', null);

    const company = await companySch.findById(id);
    if (!company)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Company not found', null);

    const isAssociated = await  productSchema.findOne({ company: id }); 
    if (isAssociated)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot deactive company because its assign to product', null);

    let changeStatus = !company.is_active;
    const updatedcompany = await companySch.findByIdAndUpdate(id, { is_active : changeStatus ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedcompany, null,company.is_active ?"Company deactivated successfully" : "Company activated successfully", null);
  } catch (err) {
    next(err);
  }
};

companyController.DeleteCompany = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Company id required', null);

    const category = await companySch.findById(id);
    if (!category) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Company not found', null);
    
    const isAssociated = await  productSchema.findOne({ company: id }); 
    if (isAssociated)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot delete company because its assign to product', null);

    const deleted = await companySch.findByIdAndUpdate(id, { is_deleted : true, is_active : false , updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Company delete successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = companyController;
