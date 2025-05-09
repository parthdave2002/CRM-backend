const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const complainSch = require('../../schema/complainSchema');
const { getAccessData } = require('../../helper/Access.helper');
const mongoose = require('mongoose');

const complainController = {};

complainController.getAllcomplain = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const userId = req.user.id;

    const populateFields = [
      { path: 'product_id', select: 'name.englishname name.gujaratiname' },
      { path: 'customer_id', select: 'customer_name  firstname middlename lastname' },
      { path: 'created_by', select: 'name' },
      { path: 'Comment.name', select: 'name' },
    ];

    if (req.query.id) {
      const complaint = await complainSch.findById(req.query.id)
        .populate(populateFields)
        .lean();

      if (!complaint) {
        return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Complain not found", null);
      }

      complaint.is_resolved_by = complaint.resolved_by?.toString() === userId || complaint.created_by?._id?.toString() === userId;
      return otherHelper.sendResponse(res, httpStatus.OK, true, complaint, null, "Complain data found", null);
    }

    if (req.query.search && req.query.search !== "null") {
      let searchResults = await complainSch.find({
        $or: [{ order_id: { $regex: req.query.search, $options: "i" } }],
      }).populate(populateFields).lean();

      if (searchResults.length === 0) {
        return otherHelper.sendResponse(res, httpStatus.OK, true, [], null, "Data not found", null);
      }
      searchResults = searchResults.map(complaint => ({
        ...complaint,
        is_resolved_by: complaint.resolved_by?.toString() === userId || complaint.created_by?._id?.toString() === userId,
      }));

      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, "Complain data found", page, size, searchResults.length);
    }
    let pulledData = await complainSch.find(searchQuery) .sort(sortQuery) .skip(page * size - size) .limit(size) .select(selectQuery) .populate(populateFields) .lean();
    const totalData = await complainSch.countDocuments(searchQuery);

    pulledData = pulledData.map(complaint => ({
      ...complaint,
      is_resolved_by: complaint.resolved_by?.toString() === userId || complaint.created_by?._id?.toString() === userId,
    }));
    return otherHelper.paginationSendResponse( res, httpStatus.OK, true, pulledData, "Complain data retrieved successfully", page, size, totalData);
  } catch (err) {
    next(err);
  }
};

complainController.getAllSalescomplain = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const userId = req.user.id;
    searchQuery = { created_by: mongoose.Types.ObjectId(userId), resolution :"open" };

    const populateFields = [
      { path: 'product_id', select: 'name.englishname name.gujaratiname' },
      { path: 'customer_id', select: 'customer_name  firstname middlename lastname' },
      { path: 'created_by', select: 'name' },
      { path: 'Comment.name', select: 'name' },
    ];

    if (!userId)  return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Complain not found", null); 
    let pulledData = await complainSch.find(searchQuery) .sort(sortQuery) .skip(page * size - size) .limit(size) .select(selectQuery) .populate(populateFields) .lean();
    const totalData = await complainSch.countDocuments(searchQuery);

    pulledData = pulledData.map(complaint => ({
      ...complaint,
      is_resolved_by: complaint.resolved_by?.toString() === userId || complaint.created_by?._id?.toString() === userId,
    }));
    return otherHelper.paginationSendResponse( res, httpStatus.OK, true, pulledData, "Complain data retrieved successfully", page, size, totalData);
  } catch (err) {
    next(err);
  }
};

complainController.addcomplain = async (req, res, next) => {
  try {
    const complain = req.body;
    const now = new Date();
    const formattedDate = [
      String(now.getFullYear()).slice(-2),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');

    const productIds = Array.isArray(complain.product_id) ? complain.product_id : [complain.product_id];
    const createdComplaints = [];
    const lastComplain = await complainSch.findOne({
      complain_id: new RegExp(`#ABC-${formattedDate}-`)
    }).sort({ complain_id: -1 }).lean();

    let dailyComplainCount = lastComplain ? parseInt(lastComplain.complain_id.split('-')[2], 10) + 1 : 1;

    for (let i = 0; i < productIds.length; i++) {
      const singleComplain = { ...complain };
      singleComplain.product_id = [productIds[i]];
      singleComplain.complain_id = `#ABC-${formattedDate}-${String(dailyComplainCount++).padStart(4, '0')}`;
      if (!singleComplain.created_by && req.user) {
        singleComplain.created_by = req.user.id;
      }
      if (singleComplain.Comment && singleComplain.Comment.length > 0) {
        singleComplain.Comment = singleComplain.Comment.map(comment => ({
          name: req.user.id,
          comment: comment.comment,
          comment_date: new Date()
        }));
      }
      const newComplainDoc = new complainSch(singleComplain);
      const savedComplain = await newComplainDoc.save();
      const populatedComplain = await complainSch.findById(savedComplain._id).populate("created_by", "name");
      createdComplaints.push(populatedComplain);
    }
    return otherHelper.sendResponse(res,httpStatus.OK,true,createdComplaints,null,"Complaints created successfully",null);
  } catch (err) {
    console.error("Error while creating complaints:", err);
    next(err);
  }
};

complainController.updatecomplain = async (req, res, next) => {
  try {
    const { id, comment, ...restData } = req.body;
    const userId = req.user?.id;

    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Complain ID is required", null);

    let updateQuery = {};

    if (comment) {
      updateQuery.$push = {
        Comment: {
          name: userId,
          comment,
          comment_date: new Date(),
        }
      };
    }

    if (Object.keys(restData).length > 0) {
      updateQuery.$set = restData;
    }

    const updatedComplain = await complainSch.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true }
    );

    if (!updatedComplain) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Complain not found", null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedComplain, null, "Complain updated successfully", null);
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

// complainController.getbyid = async (req, res, next) => {
//   try {
//     let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
//     const userId = req.query.user_id;
//     const { customer_id } = req.query;

//     const query = {};
//     if (customer_id) {
//       query.customer_id = customer_id;
//     }

//     if (userId) {
//       query.created_by = userId;
//       query.resolution = 'open'
//     }

//     if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
//       query.$or = [
//         { title: { $regex: searchQuery, $options: 'i' } },
//         { complain_id: { $regex: searchQuery, $options: 'i' } },
//       ];
//     }

//     const populateFields = [
//       { path: 'product_id', select: 'name.englishname name.gujaratiname' },
//       { path: 'customer_id', select: 'customer_name' },
//       { path: 'created_by', select: 'name' },
//       { path: 'Comment.name', select: 'name' },
//     ];

//     let pulledData = await complainSch
//       .find(query)
//       .skip((page - 1) * size)
//       .limit(size)
//       .select(selectQuery)
//       .populate(populateFields)
//       .sort(sortQuery)
//       .lean();

//     pulledData = pulledData.map(complaint => {
//       const resolvedById = complaint.resolved_by?.toString();
//       const createdById = complaint.created_by?._id?.toString() || complaint.created_by?.toString();
//       return {
//         ...complaint,
//         is_resolved_by: resolvedById === userId || createdById === userId,
//       };
//     });

//     const totalData = await complainSch.countDocuments(query);
//     return otherHelper.paginationSendResponse(res,httpStatus.OK,true,pulledData,"Complain data retrieved successfully",page,size,totalData );
//   } catch (err) {
//     console.error("Error in getting complaints: ", err);
//     next(err);
//   }
// };

complainController.getbyid = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const userId = req.query.user_id;
    const { customer_id } = req.query;

    const query = {};
    if (customer_id) {
      query.customer_id = customer_id;
    }

    if (userId) {
      query.created_by = userId;
      query.resolution = 'open'
    }

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { complain_id: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const populateFields = [
      { path: 'product_id', select: 'name.englishname name.gujaratiname' },
      { path: 'customer_id', select: 'customer_name  firstname middlename lastname' },
      { path: 'created_by', select: 'name' },
      { path: 'Comment.name', select: 'name' },
    ];

    let pulledData = await complainSch .find(query) .skip((page - 1) * size).limit(size).select(selectQuery).populate(populateFields).sort(sortQuery).lean();
    pulledData = pulledData.map(complaint => {
      const resolvedById = complaint.resolved_by?.toString();
      const createdById = complaint.created_by?._id?.toString() || complaint.created_by?.toString();
      return {
        ...complaint,
        is_resolved_by: resolvedById === userId || createdById === userId,
      };
    });

    if (userId) {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      pulledData.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        return priorityA - priorityB;
      });
    }
    const totalData = await complainSch.countDocuments(query);
    return otherHelper.paginationSendResponse(res,httpStatus.OK,true,pulledData,"Complain data retrieved successfully",page,size,totalData );
  } catch (err) {
    console.error("Error in getting complaints: ", err);
    next(err);
  }
};

module.exports = complainController;
