const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');

const orderController = {};

orderController.getAllOrderList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      searchQuery = { $or: [{ customer: searchRegex }] };
    }
    populate = { path: "products", model: "product" };
    
    const pulledData = await otherHelper.getQuerySendResponse(orderSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Order Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

orderController.AddOrderData = async (req, res, next) => {
  try {
    const Product = req.body;


    if (Product._id) {
      const update = await orderSch.findByIdAndUpdate(Product._id, { $set: Product }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Packing type Data updated successfully ", null);
    } else {
      
      const newProduct = new orderSch(Product);
      await newProduct.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newProduct, null, "Product Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = orderController;