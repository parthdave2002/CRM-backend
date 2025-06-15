const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const leadSch = require('../../schema/leadSchema');
const leadController = {};

leadController.getAlllead = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req);
    searchQuery = { ...searchQuery };

    if (req.query.id) {
      const lead = await leadSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, lead, null, 'Lead data found', null);
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchResults = await leadSch
        .find({
          $or: [{ name: searchRegex }, { email: searchRegex }, { mobile_number: searchRegex }, { comment: searchRegex }],
        })
        .sort({ added_at: -1 });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, 'Lead data found', page, size, searchResults.length);
    }

    if (req.query.status) searchQuery.status = req.query.status;
    if (req.query.type) searchQuery.type = req.query.type;
    if (req.query.user_type) searchQuery.user_type = req.query.user_type;

    if (req.query.all) {
      const leads = await leadSch.find(searchQuery).sort({ added_at: -1 });
      return otherHelper.sendResponse(res, httpStatus.OK, true, leads, null, 'Lead data fetched successfully', null);
    } else {
      sortQuery = Object.keys(sortQuery).length === 0 ? { added_at: -1 } : sortQuery;

      const pulledData = await otherHelper.getQuerySendResponse(leadSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Lead data fetched successfully', page, size, pulledData.totalData);
    }
  } catch (err) {
    next(err);
  }
};

leadController.addlead = async (req, res, next) => {
  try {
    if (req.body.id) {
      const update = await leadSch.findByIdAndUpdate(req.body.id, { comment: req.body.comment, is_deleted: true }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, 'Lead updated successfully ', null);
    } else {
      const lead = new leadSch(req.body);
      await lead.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, lead, null, 'Lead  created successfully', null);
    }
  } catch (err) {
    next(err);
  }
};

leadController.changeStatus = async (req, res, next) => {
  try {
    if (!req.query._id || !req.query.status) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Missing required parameters', null);
    }
    const lead = await leadSch.findByIdAndUpdate(req.query._id, { status: req.query.status}, { new: true });
    if (!lead)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'lead not found', null);
    return otherHelper.sendResponse(res, httpStatus.OK, true, lead, null, 'Lead updated successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = leadController;