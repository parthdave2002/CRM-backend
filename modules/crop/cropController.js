const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const cropSch = require('../../schema/cropSchema');
const { getAccessData } = require('../../helper/Access.helper');
const cropController = {};

cropController.getAllcrop = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
   
       if (req.query.search) {
         const searchRegex = { $regex: req.query.search, $options: 'i' };
         searchQuery = { $or: [{ type: searchRegex }] };
       }
   
       const pulledData = await otherHelper.getQuerySendResponse(cropSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
       return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Crop Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

cropController.addcrop = async (req, res, next) => {
  try {
    const Crop = req.body;
   
       if (Crop._id) {
         const update = await cropSch.findByIdAndUpdate(Crop._id, { $set: Crop }, { new: true });
         return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Crop Data updated successfully ", null);
       } else {
   
           const existingCrop = await cropSch.findOne({ name: Crop.name });
           if(existingCrop){
               return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Crop already exist ", null);
           }
         
         const newCrop = new cropSch(Crop);
         await newCrop.save();
         return otherHelper.sendResponse(res, httpStatus.OK, true, newCrop, null, "Crop Created successfully", null);
       }
  } catch (err) {
    next(err);
  }
};

cropController.updatecrop = async (req, res, next) => {
  try {
    const crop = await cropSch.findByIdAndUpdate(req.body._id, req.body, { new: true });
    if (!crop) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Crop not found" });
    }
    res.status(httpStatus.OK).json({ success: true, data: crop, message: "Crop updated successfully" });
  } catch (err) {
    next(err);
  }
};

cropController.deletecrop = async (req, res, next) => {
  try {

    const id = req.query.id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Crop id required', null);
    }

    const cropdata = await cropSch.findById(id);
    if (!cropdata) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Crop not found', null);
    }

    const deleted = await cropSch.findByIdAndDelete(id);
   return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Crop delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = cropController;

