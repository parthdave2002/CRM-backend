const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const categorySch = require('../../schema/adminCategorySchema');
const path = require('path');
const fs = require('fs');
const productSchema = require('../../schema/productSchema');

const adminCategoryController = {};

adminCategoryController.getAllCategoryList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    searchQuery = { ...searchQuery, is_deleted: false };

    if (req.query.id) {
      const user = await categorySch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Category Data found', null);
    }
    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await categorySch.find({
        $or: [{ name_eng: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0)  return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search data found', page, size, searchResults.length);
    }
    const pulledData = await otherHelper.getQuerySendResponse(categorySch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Category data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

adminCategoryController.AddCategory = async (req, res, next) => {
  try {
    const Category = req.body;
    if (req.file) Category.category_pic = req.file.filename; 

    const existingCompany = await categorySch.findOne({ name_eng: Category.name_eng, is_deleted: false });
    if (existingCompany)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "English Category name already exist ", null);

    const guexistingCompany = await categorySch.findOne({ name_guj: Category.name_guj, is_deleted: false });
    if (guexistingCompany)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Gujarati Category name already exist ", null);

    const newCategory = new categorySch(Category);
    await newCategory.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, newCategory, null, "Category Created successfully", null);
  } catch (err) {
    next(err);
  }
};

adminCategoryController.changeStatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category ID is required', null);

    const category = await categorySch.findById(id);
    if (!category)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Category not found', null);

    const isAssociated = await productSchema.findOne({ categories: id });
    if (isAssociated) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot deactive category because its assign to product', null);

    let changeStatus = !category.is_active;
    const updatedcategory = await categorySch.findByIdAndUpdate(id, { is_active : changeStatus ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedcategory, null,category.is_active ?"Category deactivated successfully" : "Category activated successfully", null);
  } catch (err) {
    next(err);
  }
};


adminCategoryController.DeleteCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category id required', null); 

    const category = await categorySch.findById(id);
    if(!category) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category not found', null);
    
    const isAssociated = await productSchema.findOne({ categories: id });
    if (isAssociated) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot delete category because its assign to product', null);

    const deleted = await categorySch.findByIdAndUpdate(id,  { is_deleted: true, is_active:false, updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Category deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminCategoryController;
