const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const productSch = require('../../schema/productSchema');
const complainSch = require('../../schema/complainSchema');
const stateSch = require('../../schema/locationSchema')
const orderController = {};

orderController.getAllOrderList = async (req, res, next) => {
  try {
    let { page = 1, size = 10, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    populate = [
      { path: 'products.id', model: 'product' },
      {
        path: 'customer',
        model: 'customer',
        select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode village vaillage_name taluka taluka_name district district_name',
        populate: [{   path: 'state', model: 'State', select: 'name' },],
      },
      { path: 'advisor_name', model: 'users', select: 'name' },
    ];

    if (req.query.id && req.query.customer_id && req.query.user_id) {
      searchQuery = {
        _id: req.query.id,
        customer: req.query.customer_id,
        advisor_name: req.query.user_id,
      };
    } else if (req.query.customer_id && req.query.user_id) {
      searchQuery = {
        customer: req.query.customer_id,
        advisor_name: req.query.user_id,
      };
    } else if (req.query.id && req.query.customer_id) {
      searchQuery = { _id: req.query.id, customer: req.query.customer_id };
    } else if (req.query.id && req.query.user_id) {
      searchQuery = { _id: req.query.id, advisor_name: req.query.user_id };
    } else if (req.query.id) {
      selectQuery = 'order_id order_type products customer advisor_name total_amount status added_at updated_at';
      const orderId = req.query.id;
      searchQuery = { _id: orderId };
    } else if (req.query.user_id) {
      const userId = req.query.user_id;
      searchQuery = { advisor_name: userId };
    } else if (req.query.customer_id) {
      const customerId = req.query.customer_id;
      searchQuery = { customer: customerId };
    } else {
      selectQuery = 'order_id order_type  customer advisor_name total_amount status added_at';
      populate = [
        { path: 'customer', model: 'customer', select: 'firstname middlename lastname' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ];
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      searchQuery = { ...searchQuery, $or: [{ order_id: searchRegex }, { status: searchRegex }] };
    }

    const pulledData = await otherHelper.getQuerySendResponse(orderSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);

    let finalData = pulledData.data;

    if (req.query.id || req.query.customer_id) {
      finalData = await Promise.all(
        pulledData.data.map(async (order) => {
          const cust = order.customer;
          if (!cust && !cust.state) {
            return {
              ...order.toObject(),
              customer: {
                ...cust?.toObject?.(),
                district_name: '',
                taluka_name: '',
                village_name: '',
              },
            };
          }

          try {
            const stateData = cust.state?.districts && cust.state?.districts.length ? cust.state : await stateSch.findOne({ _id: order.customer.toObject().state._id }).lean();
            const districtName = findNameFromState(stateData, cust.district, 'district') || '';
            const talukaName = findNameFromState(stateData, cust.taluka, 'taluka') || '';
            const villageName = findNameFromState(stateData, cust.village, 'village') || '';

            return {
              ...order.toObject(),
              customer: {
                ...cust?.toObject?.(),
                district_name: districtName,
                taluka_name: talukaName,
                village_name: villageName,
              },
            };
          } catch (err) {
            console.error(`Error enriching customer ${cust._id}:`, err.message);
            return {
              ...order.toObject(),
              customer: {
                ...cust?.toObject?.(),
                district_name: '',
                taluka_name: '',
                village_name: '',
              },
            };
          }
        }),
      );
    }

    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, finalData, 'Order Data retrieved successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

function findNameFromState(state, id, type) {
  if (!id || !state || !state.districts) return null;

  for (const district of state.districts) {
    if (type === 'district' && district._id.equals(id)) {
      return district.name;
    }
    if (!district.talukas) continue;
    for (const taluka of district.talukas) {
      if (type === 'taluka' && taluka._id.equals(id)) {
        return taluka.name;
      }
      if (!taluka.villages) continue;
      for (const village of taluka.villages) {
        if (type === 'village' && village._id.equals(id)) {
          return village.name;
        }
      }
    }
  }
}

orderController.AddOrUpdateOrderData = async (req, res, next) => {
  const session = await orderSch.startSession();
  try {
    session.startTransaction();
    const order = req.body;
    if (order._id) {
      order.updated_at = Date.now();
      const updatedOrder = await orderSch.findByIdAndUpdate(order._id, { $set: order }, { new: true });
      await session.commitTransaction();
      return otherHelper.sendResponse(res, httpStatus.OK, true, updatedOrder, null, 'Order updated successfully', null);
    } else {
      if (order.order_type === 'future') {
        if (!order.future_order_date) {
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Future order date is required for future orders', null);
        }
        order.future_order_date = new Date(order.future_order_date);
        if (isNaN(order.future_order_date.getTime())) {
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid future order date', null);
        }
        const today = new Date();
        if (order.future_order_date < today) {
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Future order date cannot be earlier than today', null);
        };
        order.mark_as_done = false;
        order.status = null;
      } else if (order.order_type && order.order_type !== 'confirm') {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order type must be either "confirm" or "future"', null);
      } else {
        order.mark_as_done = null;
        order.future_order_date = null;
      }

      const today = new Date();
      const todayDate = today.toISOString().slice(2, 10).replace(/-/g, '');
      const lastOrder = await orderSch
        .findOne({ order_id: new RegExp(`^#AB-${todayDate}`) })
        .sort({ order_id: -1, added_at: -1 })
        .limit(1)
        .session(session);

      let orderSuffix = '0001';
      if (lastOrder) {
        const lastOrderSuffix = parseInt(lastOrder.order_id.split('-')[2], 10);
        orderSuffix = (lastOrderSuffix + 1).toString().padStart(4, '0');
      }

      order.order_id = `#AB-${todayDate}-${orderSuffix}`;

      let totalAmount = 0;
      if (order.products && Array.isArray(order.products)) {
        for (const product of order.products) {
          const productDetails = await productSch.findById(product.id).session(session);
          if (!productDetails) {
            await session.abortTransaction();
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Products not found for Order', null);
          }
          if (product.quantity > productDetails.avl_qty) {
            await session.abortTransaction();
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order quantity is more than available quantity', null);
          }
          if (!order.order_type || order.order_type === 'confirm') {
            productDetails.avl_qty -= product.quantity;
            if (productDetails.avl_qty < 0) {
              await session.abortTransaction();
              return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Insufficient stock available', null);
            }
            await productDetails.save({ new: true }); //
          }
          let subtotal = productDetails.price * product.quantity;
          subtotal -= productDetails.discount;
          const sGstAmount = subtotal * (productDetails.s_gst / 100);
          const cGstAmount = subtotal * (productDetails.c_gst / 100);
          const totalPriceForProduct = subtotal + sGstAmount + cGstAmount;
          totalAmount += totalPriceForProduct;
        }
      }
      order.total_amount = totalAmount;
      order.advisor_name = req.user.id;
      const newOrder = new orderSch(order);
      await newOrder.save({ session });
      await session.commitTransaction();

      return otherHelper.sendResponse(res, httpStatus.OK, true, newOrder, null, 'Order created successfully', null);
    }
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

orderController.UpdateOrder = async (req, res, next) => {
  const session = await orderSch.startSession();
  let message;
  try {
    session.startTransaction();
    const id = req.body.order_id || req.query.order_id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order ID is required for update', null);
    }
    const existingOrder = await orderSch.findOne({ order_id: id });
    if (!existingOrder) {
      await session.abortTransaction();
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Order not found', null);
    }
    const { _id, updated_at, ...updatedData } = req.body;
    if (updatedData.order_type === 'confirm') {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      if (updatedData.status === 'return' && existingOrder.status === 'confirm') {
        const addedAtDate = new Date(existingOrder.added_at);
        if (addedAtDate < sevenDaysAgo) {
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order can not Update to Return due to return policy of 7 days', null);
        }
      }
      message = 'Order place successfully!';
    } else if (updatedData.order_type === 'future') {
      if (updatedData.status === 'cancel') {
        updatedData.status = 'cancel';
        updatedData.mark_as_done = false;
        updatedData.future_order_date = null;
        message = 'Order cancel successfully!';
      } else if (updatedData.future_order_date && updatedData.status === "null") {
        if (updatedData.future_order_date && new Date(updatedData.future_order_date) <= new Date(existingOrder.future_order_date)) {
          await session.abortTransaction();
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Extended Future order date must be greater than the existing future order date', null);
        }
        updatedData.mark_as_done = false;
        updatedData.future_order_date = new Date(updatedData.future_order_date);
        updatedData.status = null;
        message = 'Order extended successfully!';
      } else if (updatedData.order_type === 'confirm' && updatedData.status === 'confirm' && existingOrder.order_type === 'future' && existingOrder.status !== 'cancel') {
        (updatedData.mark_as_done = true), (updatedData.future_order_date = null);
        updatedData.added_at = Date.now();
        message = 'Order updated successfully!';
      }
    }

    let totalAmount = 0;
    if (updatedData.products && Array.isArray(updatedData.products)) {
      for (const product of updatedData.products) {
        const productDetails = await productSch.findById(product.id).session(session);
        if (!productDetails) {
          await session.abortTransaction();
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product not found for Order', null);
        }
        if (product.quantity > productDetails.avl_qty) {
          await session.abortTransaction();
          return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order quantity is more than available quantity', null);
        }
        if (existingOrder.order_type === 'future' && updatedData.order_type === 'confirm') {
          productDetails.avl_qty -= product.quantity;
          if (productDetails.avl_qty < 0) {
            await session.abortTransaction();
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Insufficient stock available', null);
          }
          await productDetails.save({ new: true }); //
        }
        let subtotal = productDetails.price * product.quantity;
        subtotal -= productDetails.discount;
        const sGstAmount = subtotal * (productDetails.s_gst / 100);
        const cGstAmount = subtotal * (productDetails.c_gst / 100);
        const totalPriceForProduct = subtotal + sGstAmount + cGstAmount;
        totalAmount += totalPriceForProduct;
      }
    }

    updatedData.total_amount = totalAmount;
    updatedData.updated_at = Date.now();
    const updatedOrder = await orderSch.findByIdAndUpdate(existingOrder._id, { $set: updatedData }, { new: true }).session(session);
    await session.commitTransaction();
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedOrder, null, message || 'Order updated successfully', null);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

orderController.DeleteOrderData = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order ID required', null);
    }
    const order = await orderSch.findById(id);
    if (!order) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order not found', null);
    }
    const deletedOrder = await orderSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deletedOrder, null, 'Order deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

orderController.GetCallBacks = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    if (!loggedInUserId) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Current User's ID not found", null);
    }
    let orders;
    const today = new Date();
    let startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (req.query.callback === 'true') {
       orders = await orderSch
        .find({
          advisor_name: loggedInUserId,
          order_type: 'future',
          mark_as_done: false,
          future_order_date: { $lt: endDate },
        })
        .populate([{ path: 'customer', model: 'customer', select: 'customer_name  firstname middlename lastname mobile_number' }]);

      // const ordersWithCounts = await Promise.all(
      //   orders.map(async (order) => {
      //     if (order.customer && order.customer._id) {
      //       const confirmOrders = await orderSch.find({
      //         customer: order.customer._id,
      //         status: 'confirm',
      //       });
      //       order.totalConfirmOrders = confirmOrders.length;

      //       const returnOrders = await orderSch.find({
      //         customer: order.customer._id,
      //         status: 'return',
      //       });

      //       order.totalReturnOrder = returnOrders.length;
      //       const complain = await complainSch.find({ created_by: order.customer._id });
      //       order.totalComplain = complain.length;

      //       order._doc.totalConfirmOrders = order.totalConfirmOrders;
      //       order._doc.totalReturnOrder = order.totalReturnOrder;
      //       order._doc.totalComplain = order.totalComplain;
      //     }
      //     return order;
      //   }),
      // );
      // return otherHelper.sendResponse(res, httpStatus.OK, true, ordersWithCounts, null, 'Callbacks retrieved successfully!', null);
    } else {
       orders = await orderSch
        .find({
          advisor_name: loggedInUserId,
          order_type: 'future',
          future_order_date: { $gt: today },
        })
        .populate([{ path: 'customer', model: 'customer', select: 'customer_name  firstname middlename lastname mobile_number' }]);

      // return otherHelper.sendResponse(res, httpStatus.OK, true, orders, null, 'Future Orders retrieved successfully!', null);
    }
    const ordersWithCounts = await Promise.all(
      orders.map(async (order) => {
        if (order.customer && order.customer._id) {
          const confirmOrders = await orderSch.find({
            customer: order.customer._id,
            status: 'confirm',
          });
          order.totalConfirmOrders = confirmOrders.length;

          const returnOrders = await orderSch.find({
            customer: order.customer._id,
            status: 'return',
          });

          order.totalReturnOrder = returnOrders.length;
          const complain = await complainSch.find({ customer_id: order.customer._id });
          order.totalComplain = complain.length;

          order._doc.totalConfirmOrders = order.totalConfirmOrders;
          order._doc.totalReturnOrder = order.totalReturnOrder;
          order._doc.totalComplain = order.totalComplain;
        }
        return order;
      }),
    );
    return otherHelper.sendResponse(res, httpStatus.OK, true, ordersWithCounts, null, 'Callbacks retrieved successfully!', null);
 
  } catch (err) {
    next(err);
  }
};

orderController.UpdateFutureOrder = async (req, res, next) => {
  const session = await orderSch.startSession();

  try {
    session.startTransaction();
    const { id } = req.query;
    const { customer_id } = req.query;
 
    if (!id || !customer_id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, ' Order ID, and Customer ID are required for update', null);
    }

    const existingOrder = await orderSch.findOne({ _id: id, advisor_name: req.user.id, customer: customer_id });
    if (!existingOrder) {
      await session.abortTransaction();
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Order not found', null);
    }

    const updatedData = req.body;

    if (!updatedData.mark_as_done && updatedData.status === 'cancel') {
      updatedData.mark_as_done = null;
    } else if (updatedData.mark_as_done === false) {
      if (updatedData.future_order_date && new Date(updatedData.future_order_date) <= new Date(existingOrder.future_order_date)) {
        await session.abortTransaction();
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Extended Future order date must be greater than the existing future order date', null);
      }
    } else if (updatedData.mark_as_done === true) {
      updatedData.status = 'confirm';
      updatedData.future_order_date = null;
      updatedData.added_at = Date.now();
      updatedData.order_type = 'confirm';

      if (updatedData.products && Array.isArray(updatedData.products)) {
        let totalAmount = 0;

        for (const product of updatedData.products) {
          const productDetails = await productSch.findById(product.id).session(session);
          if (!productDetails) {
            await session.abortTransaction();
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Products not found for Order', null);
          }
          if (product.quantity > productDetails.avl_qty) {
            await session.abortTransaction();
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order quantity is more than available quantity', null);
          }
          if (!updatedData.order_type || updatedData.order_type === 'confirm') {
            productDetails.avl_qty -= product.quantity;
            if (productDetails.avl_qty < 0) {
              await session.abortTransaction();
              return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Insufficient stock available', null);
            }
            await productDetails.save({ new: true });
          }
          let subtotal = productDetails.price * product.quantity;
          subtotal -= productDetails.discount;
          const sGstAmount = subtotal * (productDetails.s_gst / 100);
          const cGstAmount = subtotal * (productDetails.c_gst / 100);
          const totalPriceForProduct = subtotal + sGstAmount + cGstAmount;
          totalAmount += totalPriceForProduct;
        }
        updatedData.total_amount = totalAmount;
      }
    }

    if (Object.keys(updatedData).length > 0) {
      updatedData.updated_at = Date.now();
      const updatedOrder = await orderSch.findByIdAndUpdate(id, { $set: updatedData }, { new: true }).session(session);
      await session.commitTransaction();
      return otherHelper.sendResponse(res, httpStatus.OK, true, updatedOrder, null, 'Order updated successfully', null);
    } else {
      await session.abortTransaction();
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'No valid data to update', null);
    }
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

orderController.OrderRelatedData = async (req, res, next) => {
  try {
    const search = req.query.data;
    const data = await orderSch
      .find({
        $or: [{ order_id: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { 'customer.name': { $regex: search, $options: 'i' } }],
      })
      .populate('customer')
      .populate('sales_executive');
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Order data retrieved successfully', null);
  } catch (err) {
    next(err);
  }
};

orderController.getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order ID required', null);
    }

    const order = await orderSch.findOne({ order_id: orderId }).populate('products customer sales_executive');
    if (!order) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Order not found', null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, order, null, 'Order data retrieved successfully', null);
  } catch (err) {
    next(err);
  }
};

module.exports = orderController;