const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const customerSch = require("../../schema/customerSchema")
const complainSch = require("../../schema/complainSchema")
const salesExecutiveController = {};

// salesExecutiveController.GetSalesExecutiveDashboard = async (req, res, next) => {
//   try {
//       // let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

//       populate = [
//         { path: 'products.id', model: 'product', select: 'name  hsn_code discount batch_no price c_gst s_gst ' },
//         { path: 'customer_id', model: 'customer', select: 'customer_name  firstname middlename lastname  mobile_number ' },
//         { path: 'advisor_name', model: 'users', select: 'name' },
//       ];

//     const loggedInUserId = req.user.id;
//     const periods = ['daily', 'weekly', 'monthly'];

//     const getPeriodStartDate = (period) => {
//       const today = new Date();
//       let startDate = new Date(today);
//       let endDate = new Date(today);
//       startDate.setHours(0, 0, 0, 0);
//       if (period === 'weekly') {
//         startDate.setDate(today.getDate() - 7);
//       } else if (period === 'monthly') {
//         startDate.setMonth(today.getMonth() - 1);
//       }
//       return { startDate, endDate };
//     };

//     const calculateMetricsForPeriod = async (period) => {
//       const { startDate, endDate } = getPeriodStartDate(period);
//       const orders = await orderSch.find({
//         advisor_name: loggedInUserId,
//         added_at: { $gte: startDate, $lte: endDate },
//       });

//       let totalRevenue = 0;
//       let totalConfirmedOrders = 0;
//       let totalReturnOrders = 0;
//       let totalFutureOrders = 0;
//       orders.forEach((order) => {

//         if (order.order_type === "confirm" &&  order.status  === 'confirm' ) {
//           totalRevenue += order.total_amount;
//           totalConfirmedOrders += 1;
//         } else if ( order.order_type === "confirm" && order.status === 'return') {
//           totalRevenue -= order.total_amount;
//           totalReturnOrders += 1;
//         } else if (order.order_type === 'future'  &&  order.status  === 'future') {
//           totalFutureOrders += order.total_amount;
//         } else if (order.order_type === 'future') {
//           totalFutureOrders += 1;
//         }
//       });

//       return { totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders };
//     };

//     const totalMetrics = await Promise.all(
//       periods.map(async (period) => {
//         const { totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders } = await calculateMetricsForPeriod(period);
//         return { period, totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders };
//       }),
//     );

//     const customers = await customerSch.find({ created_by: loggedInUserId }).sort({ added_at: -1 }).limit(8).select('customer_name firstname lastname middlename mobile_number');
//     const complain = await complainSch.find({ created_by: loggedInUserId }).sort({ date: -1 }).limit(3).select('complain_id  title  customer_id  created_at  priority').populate(populate);
//     let response = totalMetrics.reduce(
//       (acc, { period, totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders }) => {
//         acc.totalRevenue[period] = totalRevenue;
//         acc.totalOrder[period] = totalConfirmedOrders;
//         acc.totalReturnOrder[period] = totalReturnOrders;
//         acc.totalFutureOrder[period] = totalFutureOrders;

//         return acc;
//       },
//       {
//         totalRevenue: {},
//         totalOrder: {},
//         totalReturnOrder: {},
//         totalFutureOrder: {},
//       },
//     );
//     response.customers = customers;
//     response.complain = complain;
//     return otherHelper.sendResponse(res, httpStatus.OK, true, { data: response }, null, 'Data fetched successfully', null);
//   } catch (err) {
//     next(err);
//   }
// };

salesExecutiveController.GetSalesExecutiveDashboard = async (req, res, next) => {
  try {
    // let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    populate = [
      { path: 'products.id', model: 'product', select: 'name  hsn_code discount batch_no price c_gst s_gst ' },
      { path: 'customer_id', model: 'customer', select: 'customer_name  firstname middlename lastname  mobile_number ' },
      { path: 'advisor_name', model: 'users', select: 'name' },
    ];

    const loggedInUserId = req.user.id;
    const periods = ['daily', 'weekly', 'monthly'];

    const getPeriodStartDate = (period) => {
      const today = new Date();
      let startDate = new Date(today);
      let endDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      if (period === 'weekly') {
        startDate.setDate(today.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setMonth(today.getMonth() - 1);
      }
      return { startDate, endDate };
    };

    const calculateMetricsForPeriod = async (period) => {
      const { startDate, endDate } = getPeriodStartDate(period);
      const orders = await orderSch.find({
        advisor_name: loggedInUserId,
        added_at: { $gte: startDate, $lte: endDate },
      });

      let totalRevenue = 0;
      let totalConfirmedOrders = 0;
      let totalReturnOrders = 0;
      let totalFutureOrders = 0;
      orders.forEach((order) => {
        if (order.order_type === 'confirm' && order.status === 'confirm') {
          totalRevenue += order.total_amount;
          totalConfirmedOrders += 1;
        } else if (order.order_type === 'confirm' && order.status === 'return') {
          totalRevenue -= order.total_amount;
          totalReturnOrders += 1;
        } else if (order.order_type === 'future' && order.status === 'future') {
          totalFutureOrders += order.total_amount;
        } else if (order.order_type === 'future') {
          totalFutureOrders += 1;
        }
      });

      return { totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders };
    };

    const totalMetrics = await Promise.all(
      periods.map(async (period) => {
        const { totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders } = await calculateMetricsForPeriod(period);
        return { period, totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders };
      }),
    );

   const totalFarmer = await customerSch.countDocuments({ created_by: loggedInUserId });
    const customers = await customerSch.find({ created_by: loggedInUserId }).sort({ added_at: -1 }).limit(8).select('customer_name firstname lastname middlename mobile_number');
    const complain = await complainSch.find({ created_by: loggedInUserId }).sort({ date: -1 }).limit(3).select('complain_id  title  customer_id  created_at  priority').populate(populate);
    let response = totalMetrics.reduce(
      (acc, { period, totalRevenue, totalConfirmedOrders, totalReturnOrders, totalFutureOrders }) => {
        acc.totalRevenue[period] = totalRevenue;
        acc.totalOrder[period] = totalConfirmedOrders;
        acc.totalReturnOrder[period] = totalReturnOrders;
        acc.totalFutureOrder[period] = totalFutureOrders;
        return acc;
      },
      {
        totalRevenue: {},
        totalOrder: {},
        totalReturnOrder: {},
        totalFutureOrder: {},
      },
    );
    response.totalMyFarmer = totalFarmer;
    response.customers = customers;
    response.complain = complain;
    return otherHelper.sendResponse(res, httpStatus.OK, true, { data: response }, null, 'Data fetched successfully', null);
  } catch (err) {
    next(err);
  }
};
module.exports = salesExecutiveController;