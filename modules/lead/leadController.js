const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const leadSch = require('../../schema/leadSchema');
const leadController = {};

leadController.getAlllead = async (req, res, next) => {
  try {
    const lead = await leadSch.find();
    res.status(httpStatus.OK).json({ success: true, data: lead, message: "Crops fetched successfully" });
  } catch (err) {
    next(err);
  }
};


leadController.addlead = async (req, res, next) => {
  try {
    console.log("Received Crop Data:", req.body); // Debugging log
    const lead = new leadSch(req.body);
    await lead.save();
    res.status(httpStatus.OK).json({ success: true, data: lead, message: "Crop  created successfully" });
  } catch (err) {
    next(err);
  }
};


leadController.updatelead = async (req, res, next) => {
  try {
    const lead = await leadSch.findByIdAndUpdate(req.body._id, req.body, { new: true });
    if (!lead) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Crop not found" });
    }
    res.status(httpStatus.OK).json({ success: true, data: lead, message: "Crop updated successfully" });
  } catch (err) {
    next(err);
  }
};

leadController.deletelead = async (req, res, next) => {
  try {
    await leadSch.findByIdAndDelete(req.params.id);
    res.status(httpStatus.OK).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = leadController;

