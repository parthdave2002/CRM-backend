const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const cropSch = require('../../schema/cropSchema');
const customerSch = require('../../schema/customerSchema');
const cropController = {};

cropController.getAllcrop = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req);
    searchQuery = { ...searchQuery, is_deleted: false };

    if (req.query.id) {
      const user = await cropSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Crop data found', null);
    }
    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await cropSch.find({
        $or: [{ name_eng: { $regex: req.query.search, $options: 'i' } }, { name_guj: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Crop data found', page, size, searchResults.length);
    }
    searchQuery = { ...searchQuery, is_active: true, is_deleted: false };

    if (req.query.all) {
      const user = await cropSch.find(searchQuery);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Crop data get successfully', null);
    } else {
      const pulledData = await otherHelper.getQuerySendResponse(cropSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Crop Data get successfully', page, size, pulledData.totalData);
    }
  } catch (err) {
    next(err);
  }
};

cropController.addcrop = async (req, res, next) => {
  try {
    const Crop = req.body;
    if (req.files) {
      Crop.crop_pics = req.files.map((file) => file.filename);
    }
    const existingCrop = await cropSch.findOne({ name_guj: Crop.name_guj, is_deleted: false });
    if (existingCrop)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Gujarati Crop already exist ", null);

    const guexistingPackingType = await cropSch.findOne({ name_eng: Crop.name_eng, is_deleted: false });
    if (guexistingPackingType) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "English Crop already exist ", null);

    const newCrop = new cropSch(Crop);
    await newCrop.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, newCrop, null, "Crop created successfully", null);

  } catch (err) {
    next(err);
  }
};

cropController.updatecrop = async (req, res, next) => {
  try {
    let { id, ...updatedData } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return otherHelper.sendResponse(res, 400, false, null, null, 'Invalid Crop ID', null);
    }

    const cropId = new mongoose.Types.ObjectId(id);
    const existingCrop = await cropSch.findById(cropId);
    if (!existingCrop) {
      return otherHelper.sendResponse(res, 404, false, null, null, 'Crop not found', null);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.filename);

      if (existingCrop.crop_pics && existingCrop.crop_pics.length > 0) {
        existingCrop.crop_pics.forEach((image) => {
          const imagePath = path.join(__dirname, '../../public/crop', image);
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath);
            } catch (err) {
              console.error('Error deleting file:', err);
            }
          }
        });
      }

      updatedData.crop_pics = newImages;
    }
    const crop = await cropSch.findByIdAndUpdate(cropId, { $set: updatedData }, { new: true });
    if (!crop) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Crop not found" });
    }
    res.status(httpStatus.OK).json({ success: true, data: crop, message: "Crop updated successfully" });
  } catch (err) {
    next(err);
  }
};

cropController.changestatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Crop ID is required', null);

    const cropdata = await cropSch.findById(id);
    if (!cropdata)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Crop not found', null);

    const isAssociated = await customerSch.findOne({ crops: id });
    if (isAssociated) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot deactive crop because its assigned to product', null);

    let changeStatus = !cropdata.is_active;
    const updatedPackingType = await cropSch.findByIdAndUpdate(id, { is_active : changeStatus ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedPackingType, null,cropdata.is_active ?"Crop deactivated successfully" : "Crop activated successfully", null);
  } catch (err) {
    next(err);
  }
};

cropController.deletecrop = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Crop id required', null);

    const cropdata = await cropSch.findById(id);
    if (!cropdata) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Crop not found', null);

    const isAssociated = await customerSch.findOne({ crops: id });
    if (isAssociated) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Cannot delete crop because its assign to product', null);

    const deleted = await cropSch.findByIdAndUpdate(id, { is_deleted : true, is_active: false ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Crop delete successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = cropController;

