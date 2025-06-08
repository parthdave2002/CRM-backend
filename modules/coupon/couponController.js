const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const couponSch = require('../../schema/couponSchema');
const couponController = {};

couponController.GetCouponList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);

    searchQuery = { ...searchQuery, is_deleted: false };

    if (req.query.page && req.query.page == 0) {
      selectQuery = 'name_eng name_guj is_active is_deleted';
      const coupon = await couponSch.find(searchQuery).select(selectQuery);
      return otherHelper.sendResponse(res, httpStatus.OK, true, coupon, null, 'All coupons retrieved successfully', null);
    }

    if (req.query.id) {
      const coupon = await couponSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, coupon, null, 'Coupon retrieved successfully', null);
    }
    if (req.query.name) {
      const coupon = await couponSch.findOne({ name: req.query.name, is_active: true, is_deleted: false });
      console.log(req.query.name,coupon)
      if (!coupon) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Coupon not found', null);
      }
      return otherHelper.sendResponse(res, httpStatus.OK, true, coupon, null, 'Coupon retrieved successfully', null);
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await couponSch.find({
        $or: [{ name: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'No coupons found', null);

      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, 'Search results found', page, size, searchResults.length);
    }

    if (req.query.is_active) {
      searchQuery = { is_active: true, ...searchQuery };
    }

    let pulledData = await otherHelper.getQuerySendResponse(couponSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Coupons retrieved successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

couponController.AddCoupon = async (req, res, next) => {
  try {
    const Coupon = req.body;

    if (Coupon._id) {
      const updated = await couponSch.findByIdAndUpdate(Coupon._id, { $set: Coupon }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, updated, null, 'Coupon updated successfully', null);
    } else {
      const existingCoupon = await couponSch.findOne({ name: Coupon.name, is_deleted: false });
      if (existingCoupon) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'English coupon name already exists', null);

      const newCoupon = new couponSch(Coupon);
      await newCoupon.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newCoupon, null, 'Coupon created successfully', null);
    }
  } catch (err) {
    next(err);
  }
};

couponController.ChangeStatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Coupon ID is required', null);

    const coupon = await couponSch.findById(id);
    if (!coupon) return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Coupon not found', null);

    const newStatus = !coupon.is_active;
    const updated = await couponSch.findByIdAndUpdate(id, { is_active: newStatus, updated_at: new Date() }, { new: true });

    return otherHelper.sendResponse(res, httpStatus.OK, true, updated, null, coupon.is_active ? 'Coupon deactivated successfully' : 'Coupon activated successfully', null);
  } catch (err) {
    next(err);
  }
};

couponController.DeleteCoupon = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Coupon ID required', null);

    const coupon = await couponSch.findById(id);
    if (!coupon) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Coupon not found', null);

    const deleted = await couponSch.findByIdAndUpdate(id, { is_deleted: true, is_active: false, updated_at: new Date() }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Coupon deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = couponController;
