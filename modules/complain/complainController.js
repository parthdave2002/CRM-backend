const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const complainSch = require('../../schema/complainSchema');
const { getAccessData } = require('../../helper/Access.helper');

const complainController = {};

complainController.getAllcomplain = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.id) {
      const complaint = await complainSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, complaint, null, 'Complain data found', null);
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await complainSch.find({
        $or: [{ adv_name: { $regex: req.query.search, $options: 'i' } }],
      });

      if (searchResults.length === 0) 
        return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);

      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, 'Complain data found', page, size, searchResults.length);
    }

    const pulledData = await otherHelper.getQuerySendResponse(complainSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Complain data retrieved successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

complainController.addcomplain = async (req, res, next) => {
  try {
    const complain = req.body;

    if (complain._id) {
      const update = await complainSch.findByIdAndUpdate(complain._id, { $set: complain }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, "Complain updated successfully", null);
    } else {
      const newComplain = new complainSch(complain);
      await newComplain.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newComplain, null, "Complain created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

complainController.updatecomplain = async (req, res, next) => {
  try {
    const complain = await complainSch.findByIdAndUpdate(req.body._id, req.body, { new: true });

    if (!complain) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Complain not found" });
    }

    res.status(httpStatus.OK).json({ success: true, data: complain, message: "Complain updated successfully" });
  } catch (err) {
    next(err);
  }
};

complainController.deletecomplain = async (req, res, next) => {
  try {
    const id = req.query.id;

    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Complain ID required', null);
    }

    const complainData = await complainSch.findById(id);
    if (!complainData) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Complain not found', null);
    }

    const deleted = await complainSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Complain deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = complainController;
