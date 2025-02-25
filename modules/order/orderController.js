const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const mongoose = require('mongoose');
const orderController = {};
const { v4: uuidv4 } = require('uuid');

orderController.getAllOrderList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    populate = { path: 'products', model: 'product' };
    selectQuery = 'order_id products customer sales_executive total_amount status added_at updated_at';

    if (req.query.id) {
      const orderId = req.query.id;
      searchQuery = { _id: orderId };
    } else {
      if (req.query.search) {
        const searchRegex = { $regex: req.query.search, $options: 'i' };
        searchQuery = { $or: [{ order_id: searchRegex }, { status: searchRegex }] };
      }
    }

    const pulledData = await otherHelper.getQuerySendResponse(orderSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    if (req.query.id) {
      return otherHelper.sendResponse(res, httpStatus.OK, true, pulledData, null, 'Order data retrieved successfully', null);
    } else {
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Order Data retrieved successfully', page, size, pulledData.totalData);
    }
  } catch (err) {
    next(err);
  }
};

orderController.AddOrUpdateOrderData = async (req, res, next) => {
  try {
    const order = req.body;
    if (order._id) {
      order.updated_at = Date.now();
      const updatedOrder = await orderSch.findByIdAndUpdate(order._id, { $set: order }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, updatedOrder, null, 'Order updated successfully', null);
    } else {
      const existingOrder = await orderSch.findOne({ order_id: order.order_id });
      if (existingOrder) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order already exists', null);
      }
      const objectIdTimestamp = new mongoose.Types.ObjectId().getTimestamp();
      const timestamp = objectIdTimestamp.toISOString().replace(/[-T:]/g, '').slice(0, 8);
      const randomUUID = uuidv4().replace(/-/g, '').substring(0, 8);

      const generatedOrderId = `#AB-${timestamp}-${randomUUID}`;
      order.order_id = generatedOrderId;
      const newOrder = new orderSch(order);
      await newOrder.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newOrder, null, 'Order created successfully', null);
    }
  } catch (err) {
    next(err);
  }
};

orderController.UpdateOrder = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Order ID is required for update', null);
    }

    const existingOrder = await orderSch.findById(id);
    if (!existingOrder) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Order not found', null);
    }

    const { _id, updated_at, ...updatedData } = req.body;
    updatedData.updated_at = Date.now();
    const updatedOrder = await orderSch.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedOrder, null, 'Order updated successfully', null);
  } catch (err) {
    next(err);
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

// Get orders related to a specific search (by customer, order_id, or status)
orderController.OrderRelatedData = async (req, res, next) => {
  try {
    const search = req.query.data;
    const data = await orderSch
      .find({
        $or: [{ order_id: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { 'customer.name': { $regex: search, $options: 'i' } }],
      })
      .populate('customer')
      .populate('sales_executive'); // Populate customer and sales executive details
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Order data retrieved successfully', null);
  } catch (err) {
    next(err);
  }
};

// Get order details by order_id
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