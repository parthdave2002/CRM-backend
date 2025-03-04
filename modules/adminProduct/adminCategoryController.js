const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const categorySch = require('../../schema/adminCategorySchema');
const path = require('path');
const fs = require('fs');

const adminCategoryController = {};

adminCategoryController.getAllCategoryList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    if (req.query.id) {
      const user = await categorySch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Category Data found', null);
    }
    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await categorySch.find({
        $or: [{ name: { $regex: req.query.search, $options: 'i' } }],
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
    if (req.file) {
      Category.category_pic = req.file.filename; 
    }

    if (Category._id) {
      const update = await categorySch.findByIdAndUpdate(Category._id, { $set: Category, updated_at: new Date() }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Category Data updated successfully ", null);
    } else {

        const existingCompany = await categorySch.findOne({ name: Category.name });
        if(existingCompany){
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Category already exist ", null);
        }
      
      const newCategory = new categorySch(Category);
      await newCategory.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newCategory, null, "Category Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

adminCategoryController.DeleteCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category id required', null);
    }

    const category = await categorySch.findById(id);
    if(!category){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category not found', null);
    }

    if (category?.category_pic) {
      const filePath = path.resolve(__dirname, '../../public/category', category.category_pic);

      if (fs.existsSync(filePath)) { 
          try {
              fs.unlinkSync(filePath);
          } catch (err) {
              return res.status(400).json({
                  data: err,
                  message: "Category not deleted successfully",
                  success: false,
              });
          }
      } else {
          console.log('File does not exist:', filePath);
      }
    }

    const deleted = await categorySch.findByIdAndUpdate(id,  { is_deleted: true, is_active: false, updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Category delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminCategoryController;
