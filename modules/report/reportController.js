const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const reportController = {};

reportController.getAllReportList = async (req, res, next) => {
  try {
    let { page = 1, size = 10, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    populate = [
      { path: 'products.id', model: 'product', populate: [  { path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' }], },
      {
        path: 'customer',
        model: 'customer',
        select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode village vaillage_name taluka taluka_name district district_name',
        populate: [{   path: 'state', model: 'State', select: 'name' },],
      },
      { path: 'advisor_name', model: 'users', select: 'name' },
      { path: 'coupon', model: 'coupon' },
    ];
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, null, 'Order Data retrieved successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

reportController.exportData = async (req, res, next) => {
    try{
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, null, 'Order Data retrieved successfully', page, size, pulledData.totalData);
    } catch (err) {
    next(err);
  }
};

module.exports = reportController;