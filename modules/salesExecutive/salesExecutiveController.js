const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const customerSch = require("../../schema/customerSchema")
const complainSch = require("../../schema/complainSchema")
const salesExecutiveController = {};

salesExecutiveController.GetSalesExecutiveDashboard = async (req, res, next) => {
    try {
      const loggedInUserId = req.user.id;
      const periods = ['daily', 'weekly', 'monthly'];
      const today = new Date();
  
      const getPeriodStartDate = (period) => {
        let startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        if (period === 'weekly') {
          startDate.setDate(today.getDate() - 7);
        } else if (period === 'monthly') {
          startDate.setMonth(today.getMonth() - 1);
        }
        return startDate;
      };
  
      const calculateMetricsForPeriod = async (period) => {
        const startDate = getPeriodStartDate(period);
  
        const orders = await orderSch.find({
          advisor_name: loggedInUserId,
          status: { $in: ['confirm', 'return'] },
          added_at: { $gte: startDate },
        });
  
        let totalRevenue = 0;
        let totalConfirmedOrders = 0;
        let totalReturnOrders = 0;
  
        orders.forEach((order) => {
          if (order.status === 'confirm') {
            totalRevenue += order.total_amount;
            totalConfirmedOrders += 1;
          } else if (order.status === 'return') {
            totalRevenue -= order.total_amount;
            totalReturnOrders += 1;
          }
        });
  
        return { totalRevenue, totalConfirmedOrders, totalReturnOrders };
      };
  
      const totalMetrics = await Promise.all(
        periods.map(async (period) => {
          const { totalRevenue, totalConfirmedOrders, totalReturnOrders } = await calculateMetricsForPeriod(period);
          return { period, totalRevenue, totalConfirmedOrders, totalReturnOrders };
        }),
      );
  
      const customers = await customerSch.find({ created_by: loggedInUserId }).sort({ added_at: -1 }).select('customer_name mobile_number');
      const complain = await complainSch
        .find({ created_by: loggedInUserId })
        .sort({ date: -1 })
        .limit(3)
        .select(' complain_id adv_name product order priority comments date,resolution')
        .populate([{ path: 'advisor_name', model: 'users', select: 'name' }]);
      let response = totalMetrics.reduce(
        (acc, { period, totalRevenue, totalConfirmedOrders, totalReturnOrders }) => {
          acc.totalRevenue[period] = totalRevenue;
          acc.totalOrder[period] = totalConfirmedOrders;
          acc.totalReturnOrder[period] = totalReturnOrders;
          return acc;
        },
        {
          totalRevenue: {},
          totalOrder: {},
          totalReturnOrder: {},
        },
      );
      response.customers = customers;
      response.complain = complain;
      return otherHelper.sendResponse(res, httpStatus.OK, true, { data: response }, null, 'Data fetched successfully', null);
    } catch (err) {
      next(err);
    }
};

module.exports = salesExecutiveController;