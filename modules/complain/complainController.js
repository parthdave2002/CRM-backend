const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const complainSch = require('../../schema/complainSchema');
const { getAccessData } = require('../../helper/Access.helper');

const complainController = {};

complainController.getAllcomplain = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const userId = req.user.id; 
    if (req.query.id) {
      const complaint = await complainSch.findById(req.query.id).lean();
      if (!complaint) {
        return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Complain not found", null);
      }

      complaint.is_resolved_by = complaint.resolved_by?.toString() === userId || complaint.created_by?.toString() === userId;
      return otherHelper.sendResponse(res, httpStatus.OK, true, complaint, null, "Complain data found", null);
    }

    if (req.query.search && req.query.search !== "null") {
      let searchResults = await complainSch.find({
        $or: [{ adv_name: { $regex: req.query.search, $options: "i" } }],
      }).lean(); 

      if (searchResults.length === 0) {
        return otherHelper.sendResponse(res, httpStatus.OK, true, [], null, "Data not found", null);
      }
      searchResults = searchResults.map(complaint => ({
        ...complaint,
        is_resolved_by: complaint.resolved_by?.toString() === userId || complaint.created_by?.toString() === userId,
      }));
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, "Complain data found", page, size, searchResults.length);
    }

    let pulledData = await otherHelper.getQuerySendResponse(complainSch,page,size,sortQuery,searchQuery,selectQuery,next,populate );
    pulledData.data = pulledData.data.map(complaint => ({
      ...complaint.toObject(),
      is_resolved_by: complaint.resolved_by?.toString() === userId || complaint.created_by?.toString() === userId,
    }));

    return otherHelper.paginationSendResponse(res,httpStatus.OK,true,pulledData.data,"Complain data retrieved successfully",page,size,pulledData.totalData );
  } catch (err) {
    next(err);
  }
};

complainController.addcomplain = async (req, res, next) => {
  try {
    const complain = req.body;
    const now = new Date();
    const formattedDate = [
      String(now.getDate()).padStart(2, '0'),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getFullYear()).slice(-2)
    ].join('');
    
    const lastComplain = await complainSch.findOne({ complain_id: new RegExp(`#ABC-${formattedDate}-`) })
      .sort({ complain_id: -1 })
      .lean();

    let dailyComplainCount = lastComplain ? parseInt(lastComplain.complain_id.split('-')[2], 10) + 1 : 1;
    complain.complain_id = `#ABC-${formattedDate}-${String(dailyComplainCount).padStart(4, '0')}`;

    if (!complain.created_by && req.user) {
      complain.created_by = req.user.id;
    }

    if (complain.Comment && complain.Comment.length > 0) {
      complain.Comment = complain.Comment.map(comment => ({
        name: req.user.id, 
        comment: comment.comment,
        comment_date: new Date() 
      }));
    }

    let savedComplain;
    if (complain._id) {
      savedComplain = await complainSch
        .findByIdAndUpdate(complain._id, { $set: complain }, { new: true })
        .populate("created_by", "name ");
    } else {
      const newComplain = new complainSch(complain);
      savedComplain = await newComplain.save();
      savedComplain = await complainSch.findById(savedComplain._id).populate("created_by", "name ");
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, savedComplain, null, "Complain created successfully", null);
  } catch (err) {
    next(err);
  }
};

complainController.updatecomplain = async (req, res, next) => {
  try {
    const complain = await complainSch.findByIdAndUpdate(req.body.id, req.body, { new: true });
    if (!complain) {
      return otherHelper.sendResponse( res,httpStatus.NOT_FOUND,false,null,null,"Complain not found",null);
    }
    return otherHelper.sendResponse( res,httpStatus.OK,true,complain,null,"Complain updated successfully",null);
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
