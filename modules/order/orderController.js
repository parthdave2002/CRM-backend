const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const productSch = require('../../schema/productSchema');
const orderController = {};

orderController.getAllOrderList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    if (req.query.id) {
      populate = [
        { path: 'products.id', model: 'product' },
        { path: 'customer', model: 'customer', select: 'customer_name  mobile_number address district taluka village pincode' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ];
      selectQuery = 'order_id products customer advisor_name total_amount status added_at updated_at';
      const orderId = req.query.id;
      searchQuery = { _id: orderId };
    } else {
      selectQuery = 'order_id customer advisor_name total_amount status added_at';
      populate = [
        { path: 'customer', model: 'customer', select: 'customer_name' },
        { path: 'advisor_name', model: 'users', select: 'name' },
      ];
      if (req.query.search) {
        const searchRegex = { $regex: req.query.search, $options: 'i' };
        searchQuery = { $or: [{ order_id: searchRegex }, { status: searchRegex }] };
      }
    }

    const pulledData = await otherHelper.getQuerySendResponse(orderSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    if (req.query.id) {
      return otherHelper.sendResponse(res, httpStatus.OK, true, pulledData.data, null, 'Order data retrieved successfully', null);
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
      const today = new Date();
      const todayDate = today.toISOString().slice(2, 10).replace(/-/g, '');
      const lastOrder = await orderSch
        .findOne({ order_id: new RegExp(`^#AB-${todayDate}`) })
        .sort({ order_id: -1, added_at: -1 })
        .limit(1);

      let orderSuffix = '0001';
      if (lastOrder) {
        const lastOrderSuffix = parseInt(lastOrder.order_id.split('-')[2], 10);
        orderSuffix = (lastOrderSuffix + 1).toString().padStart(4, '0');
      }

      const generatedOrderId = `#AB-${todayDate}-${orderSuffix}`;
      order.order_id = generatedOrderId;

      let totalAmount = 0;
      if (order.products && Array.isArray(order.products)) {
        for (const product of order.products) {
          const productDetails = await productSch.findById(product.id);
          if (productDetails) {
            const subtotal = productDetails.price * product.quantity;
            const sGstAmount = subtotal * (productDetails.s_gst / 100);
            const cGstAmount = subtotal * (productDetails.c_gst / 100);
            const totalPriceForProduct = subtotal + sGstAmount + cGstAmount;
            totalAmount += totalPriceForProduct;
          }
        }
      }
      order.total_amount = totalAmount;
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

    let totalAmount = 0;
    if (updatedData.products && Array.isArray(updatedData.products)) {
      for (const product of updatedData.products) {
        const productDetails = await productSch.findById(product.id);
        if (productDetails) {
          const subtotal = productDetails.price * product.quantity;
          const sGstAmount = subtotal * (productDetails.s_gst / 100);
          const cGstAmount = subtotal * (productDetails.c_gst / 100);
          const totalPriceForProduct = subtotal + sGstAmount + cGstAmount;
          totalAmount += totalPriceForProduct;
        }
      }
    }
    updatedData.total_amount = totalAmount;
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