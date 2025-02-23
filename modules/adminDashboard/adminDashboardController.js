const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const apiCallHelper = require('../../helper/apicall.helper');
const userSch = require('../../schema/userSchema');
const bugSch = require('../../schema/bugSchema');
const roleSch = require('../../schema/roleSchema');
const productSch = require("../../schema/productSchema");
const customerSch  =require("../../schema/customerSchema");

const adminDashboardController = {};

const getPeriodDates = (period) => {
  const today = new Date();
  let startDate = new Date(today);
  let endDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  switch (period.toString()) {
    case 'daily':
      startDate.setDate(today.getDate());
      break;
    case 'weekly':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(today.getMonth() - 1);
      break;
    default:
  }
  return { startDate: startDate, endDate: endDate };
};

adminDashboardController.getDashboardData = async (req, res, next) => {
  try {
    const periods = ['daily', 'weekly', 'monthly'];
    const products = await productSch.find({}).sort({ added_at: -1 }).limit(5);
    const users = await userSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5);
    const customers = await customerSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5);

    const getTotalForPeriod = async (model, dateField, periods) => {
      const totals = {};
      for (const period of periods) {
        const dateRange = getPeriodDates(period);
        const total = await model.find({
          [dateField]: { $gte: dateRange.startDate },
        });
        totals[period] = total.length;
      }
      return totals;
    };

    const totalProducts = await getTotalForPeriod(productSch, 'added_at', periods);
    const totalUsers = await getTotalForPeriod(userSch, 'added_at', periods);
    // const totalOrders = await getTotalForPeriod(orderSch, 'added_at', periods);
    const totalCustomers = await getTotalForPeriod(customerSch, 'added_at', periods);

    return otherHelper.sendResponse(
      res,
      httpStatus.OK,
      true,
      {
        products,
        users,
        customers,
        totalProducts,
        // totalOrders,
        totalUsers,
        totalCustomers,
      },
      null,
      'Dashboard data fetched successfully',
      null,
    );
  } catch (err) {
    next(err);
  }
};

adminDashboardController.getNoOfCustomerByRegistration = async (req, res, next) => {
  try {
    const data = await userSch.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $group: {
          _id: `$register_method`,
          amt: { $sum: 1 },
        },
      },
    ]);
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Get User by Day', null);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.getWaftEngineInfo = async (req, res, next) => {
  try {
    const d = await apiCallHelper.requestThirdPartyApi(req, 'https://waftengine.org/api/documentation/latestinfo', {}, {}, 'GET', next);
    return otherHelper.sendResponse(res, httpStatus.OK, true, d.data, null, 'Get User by Day', null);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.GetErrorsGroupBy = async (req, res, next) => {
  try {
    const bugs = await bugSch.aggregate([{ $group: { _id: '$error_type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    let totalData = 0;
    bugs.forEach((each) => {
      totalData = totalData + each.count;
    });
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, bugs, 'errors by group by get success!', 1, 1, totalData);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.getLastXDayUserRegistration = async (req, res, next) => {
  try {
    const days = req.params.day;
    var d = new Date();
    d.setDate(d.getDate() - days);
    const data = await userSch.aggregate([
      {
        $match: {
          added_at: { $gte: d },
          is_deleted: false,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$added_at' },
            day: { $dayOfMonth: '$added_at' },
            year: { $year: '$added_at' },
          },
          amt: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.rm': 1 },
      },
      { $project: { _id: '$_id.year', month: '$_id.month', day: '$_id.day', rm: '$_id.rm', amt: '$amt' } },
    ]);
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Get User by Day', null);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.getLatestFiveUsers = async (req, res, next) => {
  try {
    let top = 5;
    top = Number.parseInt(top);
    const fiveUsers = await userSch.find({ is_deleted: false }).select('name email image').sort({ _id: -1 }).limit(top);
    return otherHelper.sendResponse(res, httpStatus.OK, true, fiveUsers, null, 'Get User by Day', null);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.getNoOfBlogByBlogWriter = async (req, res, next) => {
  try {
    const data = []
    const count = 0
    return otherHelper.sendResponse(res, httpStatus.OK, true, { blog: data, count: count }, null, 'Get User by Day', null);
  } catch (err) {
    next(err);
  }
};

adminDashboardController.GetAllUserGroupBy = async (req, res, next) => {
  try {
    let role = await roleSch.find({ is_deleted: false }).select('role_title').lean();
    let totalData = await userSch.countDocuments({ is_deleted: false });
    for (var j = 0; j < role.length; j++) {
      role[j].count = await userSch.countDocuments({ roles: { $in: [role[j]._id] }, is_deleted: false });
    }
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, { role }, 'users by group by get success!', 1, 1, totalData);
  } catch (err) {
    next(err);
  }
};

const getDataByType = async (startDate, endDate, type) => {
  try {
    let data = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    switch (type.toLowerCase()) {
      case 'product':
        data = await productSch
          .find({
            added_at: { $gte: start, $lte: end },
          })
          .sort({ added_at: -1 });
        break;

      case 'user':
        data = await userSch
          .find({
            added_at: { $gte: start, $lte: end },
            is_deleted: false,
          })
          .sort({ added_at: -1 });
        break;

      case 'order':
        data = await orderSch
          .find({
            added_at: { $gte: start, $lte: end },
          })
          .sort({ added_at: -1 });
        break;

      case 'customer':
        data = await customerSch
          .find({
            added_at: { $gte: start, $lte: end },
          })
          .sort({ added_at: -1 });
        break;

      default:
        throw new Error('Invalid type specified');
    }

    return data;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw new Error('An error occurred while fetching data');
  }
};

adminDashboardController.getReportData = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate || !type) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Missing parameters', null);
    }
    const data = await getDataByType(startDate, endDate, type);
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, "data ,fetched successfully", null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminDashboardController;
