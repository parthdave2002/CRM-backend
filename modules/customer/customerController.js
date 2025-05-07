const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const customerSch = require('../../schema/customerSchema');
const stateSch  = require('../../schema/locationSchema');
const orderSch = require("../../schema/orderSchema");
const complainSch = require("../../schema/complainSchema")

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
          { firstname: { $regex: req.query.search, $options: 'i' } },
          { lastname: { $regex: req.query.search, $options: 'i' } },
          { middlename: { $regex: req.query.search, $options: 'i' } },
          { $expr: { $regexMatch: { input: { $toString: "$mobile_number" }, regex: searchQuery, options: "i" } } }
        ],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search Data found', page, size, searchResults.length);
    }

    populate = [{ path: 'crops', model: 'crop', select: 'name_eng name_guj'},{ path: 'created_by', model: 'users', select: 'name' }];
    selectQuery = 'customer_name  firstname middlename lastname  mobile_number alternate_number smart_phone land_area land_type irrigation_source irrigation_type crops heard_about_agribharat address district taluka village pincode added_at is_deleted created_by';
    if (req.query.id) {
      searchQuery = { _id: req.query.id };
    }
    const pulledData = await otherHelper.getQuerySendResponse(customerSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    const stateData = await stateSch.find({}); 
    const enrichedData = pulledData.data.map(cust => {
      const districtName = findNameFromState(stateData, cust.district, 'district');
      const talukaName = findNameFromState(stateData, cust.taluka, 'taluka');
      const villageName = findNameFromState(stateData, cust.village, 'village');
      return {
        ...cust.toObject(),
        district_name: districtName,
        taluka_name: talukaName,
        village_name: villageName
      };
    });

    return otherHelper.paginationSendResponse(res, httpStatus.OK, true,enrichedData, 'Customer Data fetched successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

function findNameFromState(states, id, type) {
  if (!id || !states ) return null;
  const statesData = Array.isArray(states)? states :[states] 
  for (const state of statesData) {
    if(!state.districts) return null;
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
      customerData.created_by = req.user.id;
      customerData.added_at = new Date();
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
    const id = req.body.id || req.query.id;
    const customerData = req.body;

    if (!id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Customer ID is required', null);
    }
    const  populate = [
      { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
      { path: 'created_by', model: 'users', select: 'name' },
      { path: 'state', model: 'State', select: 'name district' },
    ];
    const customer = await customerSch.findById(id);
    if (!customer)   return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);

    const updatedCustomer = await customerSch.findByIdAndUpdate(id, { $set: customerData }, { new: true }).populate(populate);
    let enrichedCustomer = updatedCustomer.toObject();
    try {
      const stateData = await stateSch.findById(updatedCustomer.toObject().state._id).lean();

      if (stateData) {
        enrichedCustomer.district_name = findNameFromState(stateData, updatedCustomer.district, 'district');
        enrichedCustomer.taluka_name = findNameFromState(stateData, updatedCustomer.taluka, 'taluka');
        enrichedCustomer.village_name = findNameFromState(stateData, updatedCustomer.village, 'village');
      } else {
        enrichedCustomer.district_name = null;
        enrichedCustomer.taluka_name = null;
        enrichedCustomer.village_name = null;
      }
    } catch (err) {
      enrichedCustomer.district_name = null;
      enrichedCustomer.taluka_name = null;
      enrichedCustomer.village_name = null;
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true, enrichedCustomer, null, 'Customer updated successfully', null);
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
    const number = (req.query.number || req.body.number || '').toString().replace(/[^0-9]/g, '');
    const order_id = req.query.order_id || req.body.order_id;
    const complain_id = req.query.complain_id || req.body.complain_id;

    populate = [
      { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
      { path: 'created_by', model: 'users', select: 'name' },
      { path: 'state', model: 'State', select: 'name district' },
      // { path: 'ref_name', model: 'users', select: 'name', strictPopulate: false },
    ];
    if (!number && !order_id && !complain_id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'At least one identifier (number, order_id, or complain_id) is required', null);
    }

    let customer = null;

    if (number) {
      customer = await customerSch.findOne({ mobile_number: number }).populate(populate);
    } else if (order_id) {
      const order = await orderSch.findOne({ order_id: order_id }).select('customer');
      if (order && order.customer) {
        customer = await customerSch.findById(order.customer).populate(populate);
      }
    } else if (complain_id) {
      const complain = await complainSch.findOne({ complain_id: complain_id }).select('customer_id');
      if (complain && complain.customer_id) {
        customer = await customerSch.findById(complain.customer_id).populate(populate);
      }
    }
    if (!customer)   return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'Customer not matched', null);

    let enrichedCustomer = customer.toObject();
    try {
      const stateData = await stateSch.findById(customer.toObject().state._id).lean();

      if (stateData) {
        enrichedCustomer.district_name = findNameFromState(stateData, customer.district, 'district');
        enrichedCustomer.taluka_name = findNameFromState(stateData, customer.taluka, 'taluka');
        enrichedCustomer.village_name = findNameFromState(stateData, customer.village, 'village');
      } else {
        enrichedCustomer.district_name = null;
        enrichedCustomer.taluka_name = null;
        enrichedCustomer.village_name = null;
      }
    } catch (err) {
      enrichedCustomer.district_name = null;
      enrichedCustomer.taluka_name = null;
      enrichedCustomer.village_name = null;
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, enrichedCustomer, null, 'Customer found', null);
  } catch (err) {
    next(err);
  }
};

module.exports = customerController;