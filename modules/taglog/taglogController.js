const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const taglogSch = require('../../schema/taglogSchema');

const taglogController = {};

taglogController.getAllTaglogList = async (req, res, next) => {
  try {
    const getid = req.query.id;
    if(getid){
      const user = await taglogSch.findById(getid);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Taglog Data Found', null);
    }
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    if (req.query.search && req.query.search !== "null"){
      const searchResults = await taglogSch.find({
        $or: [{ taglog_name: { $regex: req.query.search, $options: "i" } }], 
      });
      if (searchResults.length === 0)  return otherHelper.sendResponse(res, httpStatus.OK, true, null, [],'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults , " Search data found", page, size, searchResults.length);
}
    const pulledData = await otherHelper.getQuerySendResponse(taglogSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Taglog Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

taglogController.AddTaglog = async (req, res, next) => {
  try {
    const taglogData = req.body;

    if (taglogData._id) {
      const update = await taglogSch.findByIdAndUpdate(taglogData._id, { $set: taglogData }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Taglog Data updated successfully ", null);
    } else {

      const existingTaglog = await taglogSch.findOne({ taglog_name: taglogData.taglog_name });
      if(existingTaglog){
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Taglog already exist ", null);
      }

      const newTaglog = new taglogSch(taglogData);
      await newTaglog.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newTaglog, null, "Taglog Data Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

taglogController.DeleteTaglog = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog id required', null);
    }

    const taglog_id = await taglogSch.findById(id);
    if(!taglog_id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog not found', null);
    }

    const deleted = await taglogSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Taglog delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = taglogController;
