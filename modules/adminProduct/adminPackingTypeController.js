const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const packingtypeSch = require('../../schema/adminPackingTypeSchema');

const adminPackingTypeController = {};

adminPackingTypeController.getAllPackingTypeList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const pulledData = await otherHelper.getQuerySendResponse(packingtypeSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Category Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

adminPackingTypeController.AddPackingType = async (req, res, next) => {
  try {
    const PackingType = req.body;

    if (PackingType._id) {
      const update = await packingtypeSch.findByIdAndUpdate(PackingType._id, { $set: PackingType }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Packing type Data updated successfully ", null);
    } else {

        const existingCompany = await packingtypeSch.findOne({ type: PackingType.type });
        if(existingCompany){
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Packing type already exist ", null);
        }
      
      const newPackingType = new packingtypeSch(PackingType);
      await newPackingType.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newPackingType, null, "Packing type Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

adminPackingTypeController.DeletePackingType = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category id required', null);
    }

    const category = await packingtypeSch.findById(id);
    if(!category){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Category not found', null);
    }

    const deleted = await packingtypeSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Category delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminPackingTypeController;
