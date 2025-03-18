const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const customerSch = require('../../schema/customerSchema');

const customerController = {};

customerController.getAllCustomerList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search};
      searchQuery = { $or: [{ customer_name: searchRegex }, { mobile_number: searchRegex }, { address: searchRegex }] };
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchQuery = req.query.search;
      const searchResults = await customerSch.find({
        $or: [
          { customer_name: { $regex: req.query.search, $options: 'i' } },
          { $expr: { $regexMatch: { input: { $toString: "$mobile_number" }, regex: searchQuery, options: "i" } } }
        ],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search Data found', page, size, searchResults.length);
    }

    populate = [{ path: 'crops', model: 'crop', select: 'name' },{ path: 'created_by', model: 'users', select: 'name' }];
    selectQuery = 'customer_name mobile_number alternate_number smart_phone land_area land_type irrigation_source irrigation_type crops heard_about_agribharat address district taluka village pincode added_at is_deleted created_by';
    if (req.query.id) {
      searchQuery = { _id: req.query.id };
    }
    const pulledData = await otherHelper.getQuerySendResponse(customerSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Customer Data fetched successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

customerController.AddCustomerData = async (req, res, next) => {
  try {
    const customerData = req.body;
    if (customerData._id) {
      const update = await customerSch.findByIdAndUpdate(customerData._id, { $set: customerData }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, 'Customer Data updated successfully', null);
    } else {
      const existingCustomer = await customerSch.findOne({ mobile_number: customerData.mobile_number });
      if (existingCustomer) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer with this mobile number already exists', null);
      }

      const newCustomer = new customerSch(customerData);
      await newCustomer.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newCustomer, null, 'Customer Created successfully', null);
    }
  } catch (err) {
    next(err);
  }
};

customerController.DeleteCustomerData = async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer id required', null);
    }

    const customer = await customerSch.findById(id);
    if (!customer) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer not found', null);
    }

    const deleted = await customerSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Customer deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

customerController.updateCustomerData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const customerData = req.body;

    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID is required', null);
    }

    const customer = await customerSch.findById(id);
    if (!customer) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);
    }
    const existingCustomer = await customerSch.findOne({ mobile_number: customerData.mobile_number });
    if (existingCustomer) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer with this mobile number already exists', null);
    }
    const updatedCustomer = await customerSch.findByIdAndUpdate(id, { $set: customerData }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedCustomer, null, 'Customer updated successfully', null);
  } catch (err) {
    next(err);
  }
};

customerController.changeStatus = async (req, res, next) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id)  return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID is required', null);

    const customer = await customerSch.findById(id);
    if (!customer) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);
    }
    customer.is_deleted = !customer.is_deleted;
    const updatedCustomer = await customerSch.findByIdAndUpdate(id, { $set: customer }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedCustomer, null, !customer.is_deleted ? 'Customer unblocked Successfully' : 'Customer blocked Successfully ', null);
  } catch (err) {
    next(err);
  }
};

customerController.matchNumber = async (req, res, next) => {
  try {
    const number = req.query.number || req.body.number;
    if (!number) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer Number is required', null);
    }
    const customer = await customerSch.findOne({ mobile_number: number });
    return otherHelper.sendResponse(res,httpStatus.OK,  customer ? true : false,customer || null,null , customer ? 'Customer found' : 'Customer Number Not matched',null);
  } catch (err) {
    next(err);
  }
};

module.exports = customerController;