const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const categorySch = require('../../schema/adminCategorySchema');
const path = require('path');
const fs = require('fs');

const adminCategoryController = {};

adminCategoryController.getAllCategoryList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const pulledData = await otherHelper.getQuerySendResponse(categorySch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Category Data get successfully", page, size, pulledData.totalData);
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
      const update = await categorySch.findByIdAndUpdate(Category._id, { $set: Category }, { new: true });
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

    const deleted = await categorySch.findByIdAndUpdate(id, { $set: { is_deleted: true } });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Category delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminCategoryController;
