const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const cropSch = require('../../schema/cropSchema');
const cropController = {};

cropController.getAllcrop = async (req, res, next) => {
  try {
    const crops = await cropSch.find();
    res.status(httpStatus.OK).json({ success: true, data: crops, message: "Crops fetched successfully" });
  } catch (err) {
    next(err);
  }
};


cropController.addcrop = async (req, res, next) => {
  try {
    console.log("Received Crop Data:", req.body); // Debugging log
    const order = new cropSch(req.body);
    await order.save();
    res.status(httpStatus.OK).json({ success: true, data: order, message: "Crop  created successfully" });
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
    await cropSch.findByIdAndDelete(req.params.id);
    res.status(httpStatus.OK).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = cropController;

