const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const apiCallHelper = require('../../helper/apicall.helper');
const userSch = require('../../schema/userSchema');
const bugSch = require('../../schema/bugSchema');
const roleSch = require('../../schema/roleSchema');
const productSch = require("../../schema/productSchema");
const orderSch = require("../../schema/orderSchema");
const complainSch = require("../../schema/complainSchema")
const customerSch  =require("../../schema/customerSchema");
const stateSch = require("../../schema/locationSchema")

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


// adminDashboardController.getDashboardData = async (req, res, next) => {
//   try {
//     const periods = ['daily', 'weekly', 'monthly'];
//     const products = await productSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5).populate([{ path: 'categories', model: 'categories', select: 'name_guj name_eng' }]).select('name categories avl_qty price hsn_code batch_no added_at'); 
//     const users = await userSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5).select('name email is_active user_pic added_at');
//     const customers = await customerSch.find().sort({ added_at: -1 }).limit(5).select('customer_name  firstname middlename lastname district taluka village mobile_number is_deleted');
//     const orders = await orderSch.find().sort({ added_at: -1 }).limit(10).select('order_id customer advisor_name total_amount status added_at')
//       .populate([
//         { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname' },
//         { path: 'advisor_name', model: 'users', select: 'name' },
//       ]);
//     const getTotalForPeriod = async (model, dateField, periods, getRevenue) => {
//       const totals = {};
//       for (const period of periods) {
//         const dateRange = getPeriodDates(period);
//         if (!getRevenue) {
//           const total = await model.find({
//             [dateField]: { $gte: dateRange.startDate },
//           });
//           totals[period] = total.length;
//         } else if (getRevenue) {
//           const total = await model.find({
//             [dateField]: { $gte: dateRange.startDate },
//             status: 'confirm',
//             order_type: 'confirm',
//           });
//           totals[period] = total.reduce((revenue, order) => revenue + order.total_amount, 0);
//         }
//       }
//       return totals;
//     };

//     const totalProducts = await getTotalForPeriod(productSch, 'added_at', periods);
//     const totalUsers = await getTotalForPeriod(userSch, 'added_at', periods);
//     const totalOrders = await getTotalForPeriod(orderSch, 'added_at', periods);
//     const totalCustomers = await getTotalForPeriod(customerSch, 'added_at', periods);
//     const totalRevenue = await getTotalForPeriod(orderSch, 'added_at', periods, true);
//     const stateData = await stateSch.find({});
//     const enrichedData = customers.map((cust) => {
//       const districtName = findNameFromState(stateData, cust.district, 'district');
//       const talukaName = findNameFromState(stateData, cust.taluka, 'taluka');
//       const villageName = findNameFromState(stateData, cust.village, 'village');
//       return {
//         ...cust.toObject(),
//         district: {
//           _id: cust.district,
//           name: districtName,
//         },
//         taluka: {
//           _id: cust.taluka,
//           name: talukaName,
//         },
//         village: {
//           _id: cust.village,
//           name: villageName,
//         },
//       };
//     });

//     return otherHelper.sendResponse(
//       res,
//       httpStatus.OK,
//       true,
//       {
//         products,
//         users,
//         customers: enrichedData || [],
//         orders,
//         totalProducts,
//         totalOrders,
//         totalUsers,
//         totalCustomers,
//         totalRevenue,
//       },
//       null,
//       'Dashboard data fetched successfully',
//       null,
//     );
//   } catch (err) {
//     next(err);
//   }
// };


adminDashboardController.getDashboardData = async (req, res, next) => {
  try {
    const periods = ['daily', 'weekly', 'monthly'];
    const products = await productSch
      .find({ is_deleted: false })
      .sort({ added_at: -1 })
      .limit(5)
      .populate([{ path: 'categories', model: 'categories', select: 'name_guj name_eng' }])
      .select('name categories avl_qty price hsn_code batch_no added_at');
    const users = await userSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5).select('name email is_active user_pic added_at');
    const customers = await customerSch.find().sort({ added_at: -1 }).limit(5).select('customer_name  firstname middlename lastname district taluka village mobile_number is_deleted');
    const orders = await orderSch
      .find()
      .sort({ added_at: -1 })
      .limit(10)
      .select('order_id customer advisor_name total_amount status added_at')
      .populate([
        { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ]);
    const complainDetails = await complainSch
      .find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate([
        { path: 'product_id', select: 'name.englishname name.gujaratiname' },
        { path: 'customer_id', select: 'customer_name  firstname middlename lastname' },
        { path: 'created_by', select: 'name' },
        { path: 'Comment.name', select: 'name' },
      ]);
    const returnOrdersDetails = await orderSch
      .find({ order_type: 'confirm', status: 'return' })
      .sort({ added_at: -1 })
      .limit(10)
      .select('order_id customer advisor_name total_amount status added_at')
      .populate([
        { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ]);
    const getTotalForPeriod = async (model, dateField, periods, getRevenue, searchQuery) => {
      const totals = {};
      for (const period of periods) {
        const dateRange = getPeriodDates(period);
        let total;
        const query = {
          ...searchQuery,
          [dateField]: { $gte: dateRange.startDate }, // add other date logic if needed
        };
        total = await model.find(query);
        if (!getRevenue) {
          totals[period] = total.length;
        } else if (getRevenue) {
          totals[period] = total.reduce((revenue, order) => revenue + order.total_amount, 0);
        }
      }
      return totals;
    };

    const totalProducts = await getTotalForPeriod(productSch, 'added_at', periods);
    const totalUsers = await getTotalForPeriod(userSch, 'added_at', periods);
    const totalOrders = await getTotalForPeriod(orderSch, 'added_at', periods);
    const totalCustomers = await getTotalForPeriod(customerSch, 'added_at', periods);
    const totalRevenue = await getTotalForPeriod(orderSch, 'added_at', periods, true, { order_type: 'confirm', status: 'confirm' });
    const totalComplain = await getTotalForPeriod(complainSch, 'created_at', periods);
    const totalReturnOrder = await getTotalForPeriod(orderSch, 'added_at', periods, false, { order_type: 'confirm', status: 'return' });
    const totalReturnOrderRevenue = await getTotalForPeriod(orderSch, 'added_at', periods, true, { order_type: 'confirm', status: 'return' });
    const stateData = await stateSch.find({});
    const enrichedData = customers.map((cust) => {
      const districtName = findNameFromState(stateData, cust.district, 'district');
      const talukaName = findNameFromState(stateData, cust.taluka, 'taluka');
      const villageName = findNameFromState(stateData, cust.village, 'village');
      return {
        ...cust.toObject(),
        district: {
          _id: cust.district,
          name: districtName,
        },
        taluka: {
          _id: cust.taluka,
          name: talukaName,
        },
        village: {
          _id: cust.village,
          name: villageName,
        },
      };
    });

    return otherHelper.sendResponse(
      res,
      httpStatus.OK,
      true,
      {
        products,
        users,
        customers: enrichedData || [],
        orders,
        returnOrdersDetails,
        complainDetails,
        totalProducts,
        totalOrders,
        totalUsers,
        totalCustomers,
        totalComplain,
        totalReturnOrder,
        totalReturnOrderRevenue,
        totalRevenue,
      },
      null,
      'Dashboard data fetched successfully',
      null,
    );
  } catch (err) {
    next(err);
  }
};

function findNameFromState(states, id, type) {
  if (!id) return null;
  for (const state of states) {
    for (const district of state.districts) {
      if (type === 'district' && district._id.equals(id)) {
        return district.name;
      }
      for (const taluka of district.talukas) {
        if (type === 'taluka' && taluka._id.equals(id)) {
          return taluka.name;
        }
        for (const village of taluka.villages) {
          if (type === 'village' && village._id.equals(id)) {
            return village.name;
          }
        }
      }
    }
  }
  return null;
}
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
          .sort({ added_at: -1 }).populate([{ path: 'categories', model: 'categories', select: 'name_guj name_eng' },{ path: 'company', model: 'company', select: 'name' },{ path: 'packagingtype', model: 'packing-type', select: 'type_end type_guj' }]);
        break;

      case 'user':
        data = await userSch
          .find({
            added_at: { $gte: start, $lte: end },
            is_deleted: false,
          })
          .sort({ added_at: -1 }).populate([
            { path: 'role', model: 'roles', select: 'role_title' },
          ]);
        break;

      case 'order':
        data = await orderSch
          .find({
            added_at: { $gte: start, $lte: end },
          })
          .sort({ added_at: -1 }).populate([
            { path: 'customer', model: 'customer', select: 'customer_name  firstname middlename lastname' },
            { path: 'advisor_name', model: 'users', select: 'name' },
          ]);
        break;

      case 'customer':
        data = await customerSch
          .find({
            added_at: { $gte: start, $lte: end },
          })
          .sort({ added_at: -1 }).populate([{ path: 'crops', model: 'crop', select: 'name' },{ path: 'created_by', model: 'users', select: 'name' }]);
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
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'data ,fetched successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = adminDashboardController;
