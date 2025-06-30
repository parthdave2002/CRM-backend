const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const taglogSch = require('../../schema/taglogSchema');
const mongoose = require('mongoose');
const customerSch = require('../../schema/customerSchema');
const taglogCustomerSch = require('../../schema/taglogCustomer');
const taglogController = {};

taglogController.getAllTaglogList = async (req, res, next) => {
  try {
    const getid = req.query.id;
    if(getid){
      const user = await taglogSch.findById(getid);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Taglog Data Found', null);
    }
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    searchQuery = { ...searchQuery, is_deleted: false };
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

    const existingTaglog = await taglogSch.findOne({ taglog_name: taglogData.taglog_name, is_deleted: false });
    if (existingTaglog) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Taglog already exist ", null);

    const newTaglog = new taglogSch(taglogData);
    await newTaglog.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, newTaglog, null, "Taglog Created successfully", null);

  } catch (err) {
    next(err);
  }
};

taglogController.changestatus = async (req, res,next) => {
 try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog ID is required', null);

    const taglog = await taglogSch.findById(id);
    if (!taglog)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Taglog not found', null);

    let changeStatus = !taglog.is_active;
    const updatedtaglog = await taglogSch.findByIdAndUpdate(id, { is_active : changeStatus ,updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedtaglog, null,taglog.is_active ? "Taglog Deactivated successfully" : "Taglog activated successfully", null);
  } catch (err) {
    next(err);
  }
}

taglogController.DeleteTaglog = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog id required', null);
    
    const taglog_id = await taglogSch.findById(id);
    if(!taglog_id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog not found', null);

    const deleted = await taglogSch.findByIdAndUpdate(id, { is_deleted : true, is_active: false, updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Taglog deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

taglogController.getAllSubtaglog = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    searchQuery = { ...searchQuery, is_deleted: false };
    const id = req.query.id;
    if(!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Please enter taglog id', null);

    if (req.query.search && req.query.search !== "null"){
      const searchResults = await taglogSch.find({
        $or: [{ taglog_name: { $regex: req.query.search, $options: "i" } }], 
      });
      if (searchResults.length === 0)  return otherHelper.sendResponse(res, httpStatus.OK, true, null, [],'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults , " Search data found", page, size, searchResults.length);
    }

    const subtags = await taglogSch.findById(id).select("subtaglog");
    if(subtags){
      const activeSubtags = subtags.subtaglog.filter(subtag => subtag.is_deleted == false);
      return otherHelper.sendResponse(res, httpStatus.OK, true, activeSubtags, null, 'Subtaglog data found', null);
    }else{
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Enter taglog id not found', null);
    }
  } catch (err) {
    next(err);
  }
};

taglogController.AddSubtaglog = async (req, res, next) => {
  try {
    const { taglog_id, name, is_active } = req.body;
    if(!taglog_id) return  otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'taglog id is required', null);

    const validtaglog = await taglogSch.findById(taglog_id);
    if(validtaglog){
      const newSubtaglog = {
        name: name,
        is_active: is_active, 
        created_date: new Date(),
        is_deleted: false
      };

      const updatedtaglog = await taglogSch.findByIdAndUpdate(taglog_id, { $push: { subtaglog: newSubtaglog }, $set: { updated_at: new Date() } }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, updatedtaglog, null, 'Subtaglog added successfully', null);
    }else{
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Please enter valid talgog id', null);
    }
  } catch (err) {
    next(err);
  }
};

taglogController.updateSubtaglog = async (req, res, next) => {
  try {
    const { id, taglog_id } = req.query || req.params;

    if (!taglog_id)   return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog ID is required', null);
    if (!id)   return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Subtaglog ID is required', null);

    const existtaglog = await taglogSch.findById(taglog_id);
    if (!existtaglog)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog not found', null);
    
    const subtag = existtaglog.subtaglog.id(id);
    if (!subtag)   return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Subtaglog not found', null);

    subtag.is_active = !subtag.is_active;
    existtaglog.updated_at = new Date();
    await existtaglog.save();

    return otherHelper.sendResponse(res, httpStatus.OK, true, subtag, null, 'Subtaglog status updated successfully', null);
  } catch (err) {
    next(err);
  }
};

taglogController.DeleteSubtaglog = async (req, res, next) => {
  try {
    const { id, taglog_id } = req.query || req.params;

    if (!taglog_id)   return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog ID is required', null);
    if (!id)   return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Subtaglog ID is required', null);

    const existtaglog = await taglogSch.findById(taglog_id);
    if (!existtaglog)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Taglog not found', null);
    
    const subtag = existtaglog.subtaglog.id(id);
    if (!subtag)   return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Subtaglog not found', null);

    subtag.is_active =false;
    subtag.is_deleted = true,
    existtaglog.updated_at = new Date();
    await existtaglog.save();

    return otherHelper.sendResponse(res, httpStatus.OK, true, subtag, null, 'Subtaglog  deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

taglogController.AddTaglogCustomer = async (req, res, next) => {
  try {
    const {customer_id, taglog_id, subtaglog_id} = req.body;

    if(!customer_id || !taglog_id || !subtaglog_id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID, Taglog ID and Subtaglog ID are required', null);
    }
    if(customer_id && !mongoose.Types.ObjectId.isValid(customer_id)){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Customer ID', null);
    }
    if(taglog_id && !mongoose.Types.ObjectId.isValid(taglog_id)){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Taglog ID', null);
    }
    if(subtaglog_id && !mongoose.Types.ObjectId.isValid(subtaglog_id)){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Subtaglog ID', null);
    }
    req.body.created_at = Date.now();
    req.body.added_by = req.user.id
    const newEntry = new taglogCustomerSch(req.body);
    await newEntry.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, newEntry, null, 'Customer Taglog added successfully', null);
  } catch (err) {
    next(err);
  }
};

// taglogController.getAllTaglogCustomers = async (req, res, next) => {
//   try {
//     const customer_id = req.query.customer_id;
//     if (!customer_id) {
//       return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID is required', null);
//     }

//     if (!mongoose.Types.ObjectId.isValid(customer_id)) {
//       return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Customer ID', null);
//     }
//     const customerExists = await customerSch.findById(customer_id);
//     if (!customerExists) {
//       return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);
//     }
//     const customers = await taglogCustomerSch.find({ customer_id })
//       .populate('customer_id', 'firstname middlename lastname')
//       .populate('taglog_id', 'taglog_name subtaglog')
//       .lean(); 

//     const enrichedCustomers = customers.map((item) => {
//       const taglog = item.taglog_id;
//       const subtaglogId = item.subtaglog_id?.toString();

//       let subtaglogName = null;
//       if (taglog && Array.isArray(taglog.subtaglog) && subtaglogId) {
//         const match = taglog.subtaglog.find((sub) => sub._id.toString() === subtaglogId);
//         if (match) {
//           subtaglogName = match.name;
//         }
//       }

//       const customer = item.customer_id;
//       const fullName = [customer?.firstname, customer?.middlename, customer?.lastname]
//         .filter(Boolean)
//         .join(' ');

//       return {
//         _id: item._id,
//         taglog: { _id: taglog?._id, taglog_name: taglog?.taglog_name },
//         subtaglog: { _id: subtaglogId,  name: subtaglogName, },
//         comment: item.comment, 
//         created_by: item.created_by,
//         createdAt: item.createdAt,
//       };
//     });
//     return otherHelper.sendResponse(res,httpStatus.OK,true,enrichedCustomers,null,'Customer Taglogs fetched successfully',null);
//   } catch (err) {
//     next(err);
//   }
// };

taglogController.getAllTaglogCustomers = async (req, res, next) => {
  try {
    const customer_id = req.query.customer_id;

    if (!customer_id)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID is required', null);
    if (!mongoose.Types.ObjectId.isValid(customer_id))  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Customer ID', null);
    
    const customerExists = await customerSch.findById(customer_id);
    if (!customerExists) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);
    }
    let { page, size, sortQuery="-created_at"} = otherHelper.parseFilters(req);

    const totalData = await taglogCustomerSch.countDocuments({ customer_id });
    const customers = await taglogCustomerSch
      .find({ customer_id })
      .sort(sortQuery)
      .populate('customer_id', 'firstname middlename lastname ')
      .populate('taglog_id', 'taglog_name subtaglog ')
      .populate('added_by', 'name')
      .skip((page- 1) * size)
      .limit(size)
      .lean();

    const enrichedCustomers = customers.map((item) => {
      const taglog = item.taglog_id;
      const subtaglogId = item.subtaglog_id?.toString();

      let subtaglogName = null;
      if (taglog && Array.isArray(taglog.subtaglog) && subtaglogId) {
        const match = taglog.subtaglog.find((sub) => sub._id.toString() === subtaglogId);
        if (match) {
          subtaglogName = match.name;
        }
      }

      const customer = item.customer_id;
      const fullName = [customer?.firstname, customer?.middlename, customer?.lastname].filter(Boolean).join(' ');

      return {
        _id: item._id,
        taglog: { _id: taglog?._id, taglog_name: taglog?.taglog_name },
        subtaglog: { _id: subtaglogId, name: subtaglogName },
        comment: item.comment,
        created_by: item.created_by,
        created_at: item.created_at,
        added_by : item.added_by
      };
    });
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, enrichedCustomers, 'Customer Taglogs fetched successfully', page, size, totalData);
  } catch (err) {
    next(err);
  }
};

module.exports = taglogController;