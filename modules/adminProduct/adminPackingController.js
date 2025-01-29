const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const packingSch = require('../../schema/adminPackingSchema');

const adminPackingController = {};

adminPackingController.getAllPackingList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const pulledData = await otherHelper.getQuerySendResponse(packingSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Packing Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

adminPackingController.AddPacking = async (req, res, next) => {
  try {
    const Packing = req.body;

    if (Packing._id) {
      const update = await packingSch.findByIdAndUpdate(Packing._id, { $set: Packing }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Packing Data updated successfully ", null);
    } else {

      const existingCompany = await packingSch.findOne({  number: Packing.number });
      if(existingCompany){
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Packing already exist ", null);
      }
      
      const newPacking = new packingSch(Packing);
      await newPacking.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newPacking, null, "Packing type Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

adminPackingController.DeletePacking = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packing id required', null);
    }

    const packing = await packingSch.findById(id);
    if(!packing){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Packing not found', null);
    }

    const deleted = await packingSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Packing delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminPackingController;
