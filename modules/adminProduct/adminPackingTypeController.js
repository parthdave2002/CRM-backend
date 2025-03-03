const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const packingtypeSch = require('../../schema/adminPackingTypeSchema');

const adminPackingTypeController = {};

adminPackingTypeController.getAllPackingTypeList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      searchQuery = { $or: [{ type: searchRegex }] };
    }

    const pulledData = await otherHelper.getQuerySendResponse(packingtypeSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Packingtype Data get successfully", page, size, pulledData.totalData);
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
      const enexistingPackingType = await packingtypeSch.findOne({ type_eng: PackingType.type_eng });
      if(enexistingPackingType) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "English Packingtype already exist ", null);

      const guexistingPackingType = await packingtypeSch.findOne({ type_guj: PackingType.type_guj });
      if(guexistingPackingType) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Gujarati Packingtype already exist ", null);
      
      const newPackingType = new packingtypeSch(PackingType);
      await newPackingType.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newPackingType, null, "Packingtype Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

adminPackingTypeController.DeletePackingType = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packingtype id required', null);
    }

    const category = await packingtypeSch.findById(id);
    if(!category){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packingtype not found', null);
    }

    const deleted = await packingtypeSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Packingtype delete successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminPackingTypeController;
