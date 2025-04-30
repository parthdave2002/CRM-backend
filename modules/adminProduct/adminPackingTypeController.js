const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const packingtypeSch = require('../../schema/adminPackingTypeSchema');
const productSchema = require('../../schema/productSchema');

const adminPackingTypeController = {};

adminPackingTypeController.getAllPackingTypeList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    searchQuery = { ...searchQuery, is_deleted: false };
    
    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await packingtypeSch.find({
        $or: [{ type_eng: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0)  return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Packing Data found', page, size, searchResults.length);
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
      const enexistingPackingType = await packingtypeSch.findOne({ type_eng: PackingType.type_eng, is_deleted: false });
      if(enexistingPackingType) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "English Packingtype already exist ", null);

      const guexistingPackingType = await packingtypeSch.findOne({ type_guj: PackingType.type_guj, is_deleted: false });
      if(guexistingPackingType) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Gujarati Packingtype already exist ", null);
      
      const newPackingType = new packingtypeSch(PackingType);
      await newPackingType.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newPackingType, null, "Packingtype Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

adminPackingTypeController.changeStatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packing Type ID is required', null);

    const packingType = await packingtypeSch.findById(id);
    if (!packingType)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Packing Type not found', null);

    const isAssociated = await  productSchema.findOne({ packagingtype: id }); 
    if (isAssociated)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot Deactive packing type as it is associated with a product', null);

    let changeStatus = !packingType.is_active;
    const updatedPackingType = await packingtypeSch.findByIdAndUpdate(id, { is_active : changeStatus ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedPackingType, null,packingType.is_active ?"Packing Type Deactivated successfully" : "Packing Type activated successfully", null);
  } catch (err) {
    next(err);
  }
};

adminPackingTypeController.DeletePackingType = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packingtype id required', null);
    
    const packung_type = await packingtypeSch.findById(id);
    if (!packung_type)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packingtype not found', null);
    
    const isAssociated = await  productSchema.findOne({ packagingtype: id }); 
    if (isAssociated)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot Delete packing type as it is associated with a product', null);
    
    const deleted = await packingtypeSch.findByIdAndUpdate(id, { is_deleted : true, is_active:false, updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Packingtype deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminPackingTypeController;