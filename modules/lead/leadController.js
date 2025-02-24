const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const leadSch = require('../../schema/leadSchema');
const leadController = {};

leadController.getAlllead = async (req, res, next) => {
  try {
    const { added_from } = req.query;
    let filter = {};

    if (added_from) {
      if (Array.isArray(added_from)) {
        filter.added_from = { $in: added_from };
      } else if (typeof added_from === "string") {
        filter.added_from = added_from; 
      }
    }
    const leads = await leadSch.find(filter);
    return otherHelper.sendResponse(res, httpStatus.OK, true, leads, null,"Leads fetched successfully", null);

  } catch (err) {
    next(err);
  }
};


leadController.addlead = async (req, res, next) => {
  try {
    console.log("Received Crop Data:", req.body); 
    const lead = new leadSch(req.body);
    await lead.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, lead, null,"Crop  created successfully", null);
  } catch (err) {
    next(err);
  }
};


leadController.updatelead = async (req, res, next) => {
  try {
    const lead = await leadSch.findByIdAndUpdate(req.body._id, req.body, { new: true });
    if (!lead) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null,"lead not found", null);
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true, lead, null,"Crop updated successfully" , null);
  } catch (err) {
    next(err);
  }
};

leadController.deletelead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Lead ID is required", null);
    }
    const deletedLead = await leadSch.findByIdAndDelete(id);
    if (!deletedLead) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Lead not found", null);
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, "Lead deleted successfully", null);
  } catch (err) {
    next(err);
  }
};

module.exports = leadController;
