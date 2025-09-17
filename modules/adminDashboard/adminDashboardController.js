const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const userSch = require('../../schema/userSchema');
const productSch = require("../../schema/productSchema");
const orderSch = require("../../schema/orderSchema");
const complainSch = require("../../schema/complainSchema")
const customerSch  =require("../../schema/customerSchema");
const stateSch = require("../../schema/locationSchema")

const adminDashboardController = {};

const getPeriodDates = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case 'weekly':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(today.getMonth() - 1);
      break;
    default:
      break; // daily uses today's date
  }
  return { startDate, endDate };
};

const getTotalForPeriod = async (model, dateField, periods, getRevenue = false, searchQuery = {}) => {
  const totals = {};
   await Promise.all(
    periods.map(async (period) => {
      const { startDate, endDate } = getPeriodDates(period);
      const query = { ...searchQuery, [dateField]: { $gte: startDate, $lte: endDate } };

      if (getRevenue) {
        const revenue = await model.aggregate([
          { $match: query },
          { $group: { _id: null, total: { $sum: "$total_amount" } } }
        ]);
        totals[period] = revenue[0]?.total || 0;
      } else {
        totals[period] = await model.countDocuments(query);
      }
    })
  );

  return totals;
};

const createStateLookupMaps = (states) => {
  const districtMap = new Map();
  const talukaMap = new Map();
  const villageMap = new Map();

  states.forEach((state) => {
    state.districts.forEach((district) => {
      districtMap.set(district._id.toString(), district.name);

      district.talukas.forEach((taluka) => {
        talukaMap.set(taluka._id.toString(), taluka.name);

        taluka.villages.forEach((village) => {
          villageMap.set(village._id.toString(), village.name);
        });
      });
    });
  });

  return { districtMap, talukaMap, villageMap };
};

adminDashboardController.getDashboardData = async (req, res, next) => {
  try {
    const periods = ['daily', 'weekly', 'monthly'];
    const productQuery = await productSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5).populate([{ path: 'categories', model: 'categories', select: 'name_guj name_eng' }]).select('name categories avl_qty price hsn_code batch_no added_at').lean();
    const userQuery  = await userSch.find({ is_deleted: false }).sort({ added_at: -1 }).limit(5).select('name email is_active user_pic added_at').lean();
    const customerQuery  = await customerSch.find().sort({ added_at: -1 }).limit(5).select('customer_name  firstname middlename lastname district taluka village mobile_number is_deleted').lean();
    const orderQuery  = await orderSch.find().sort({ added_at: -1 }).limit(10).select('order_id customer advisor_name total_amount status added_at')
      .populate([
        { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ])
      .lean();
    const complainQuery  = await complainSch
      .find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate([
        { path: 'product_id', select: 'name.englishname name.gujaratiname' },
        { path: 'customer_id', select: 'customer_name  firstname middlename lastname' },
        { path: 'created_by', select: 'name' },
        { path: 'Comment.name', select: 'name' },
      ])
      .lean();
    const returnOrderQuery  = await orderSch
      .find({ order_type: 'confirm', status: 'return' })
      .sort({ added_at: -1 })
      .limit(10)
      .select('order_id customer advisor_name total_amount status added_at')
      .populate([
        { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ])
      .lean();

      const [products, users, customers, orders, complainDetails, returnOrdersDetails, stateData] = await Promise.all([
        productQuery,
        userQuery,
        customerQuery,
        orderQuery,
        complainQuery,
        returnOrderQuery,
        stateSch.find({}).lean()
      ]);

      const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalCustomers,
      totalRevenue,
      totalComplain,
      totalReturnOrder,
      totalReturnOrderRevenue
    ] = await Promise.all([
      getTotalForPeriod(productSch, 'added_at', periods),
      getTotalForPeriod(userSch, 'added_at', periods),
      getTotalForPeriod(orderSch, 'added_at', periods),
      getTotalForPeriod(customerSch, 'added_at', periods),
      getTotalForPeriod(orderSch, 'added_at', periods, true, { order_type: 'confirm', status: 'confirm' }),
      getTotalForPeriod(complainSch, 'created_at', periods),
      getTotalForPeriod(orderSch, 'added_at', periods, false, { order_type: 'confirm', status: 'return' }),
      getTotalForPeriod(orderSch, 'added_at', periods, true, { order_type: 'confirm', status: 'return' }),
    ]);

    const { districtMap, talukaMap, villageMap } = createStateLookupMaps(stateData);
    const enrichedData = customers.map((cust) => ({
      ...cust,
      district: { _id: cust.district, name: districtMap.get(cust.district?.toString()) || null },
      taluka: { _id: cust.taluka, name: talukaMap.get(cust.taluka?.toString()) || null },
      village: { _id: cust.village, name: villageMap.get(cust.village?.toString()) || null },
    }));

    return otherHelper.sendResponse( res, httpStatus.OK, true, { products, users, customers: enrichedData || [], orders, returnOrdersDetails, complainDetails, totalProducts, totalOrders, totalUsers, totalCustomers, totalComplain, totalReturnOrder,  totalReturnOrderRevenue, totalRevenue,}, null, 'Dashboard data fetched successfully', null,);
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
