const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const customerSch = require('../../schema/customerSchema');
const orderSch = require("../../schema/orderSchema");
const complainSch = require("../../schema/complainSchema")

const customerController = {};

customerController.getAllCustomerList = async (req, res, next) => {
  try {
    const { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    const query = { ...searchQuery };
    const search = req.query.search?.trim();

       if(req.query.id){
          const populateFields = [
              { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
              { path: 'created_by', model: 'users', select: 'name' },
              { path: 'state', model: 'State', select: 'name' },
              { path: 'village', model: 'Village', select: 'name' },
              { path: 'taluka', model: 'Taluka', select: 'name' },
              { path: 'district', model: 'District', select: 'name' },
            ];
          const user = await customerSch.findById(req.query.id).select(selectQuery).populate(populateFields).lean();
          return otherHelper.paginationSendResponse(res, httpStatus.OK, true, [user],  null, " Search Data found", page, size, user.length);
        }

    if (search && search !== "null") {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { customer_name: searchRegex },
        { firstname: searchRegex },
        { middlename: searchRegex },
        { lastname: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$mobile_number" },
              regex: search,
              options: "i",
            },
          },
        },
      ];
    }

    const populateFields = [
      { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
      { path: 'created_by', model: 'users', select: 'name' },
      { path: 'state', model: 'State', select: 'name' },
      { path: 'village', model: 'Village', select: 'name' },
      { path: 'taluka', model: 'Taluka', select: 'name' },
      { path: 'district', model: 'District', select: 'name' },
    ];

    const [customers, totalData] = await Promise.all([
      customerSch.find(query).sort(sortQuery).skip((page - 1) * size).limit(size).populate(populateFields).select("customer_name firstname middlename lastname mobile_number alternate_number smart_phone land_area land_type irrigation_source irrigation_type crops heard_about_agribharat address district taluka village pincode added_at is_deleted created_by" ).lean(),
      customerSch.countDocuments(query),
    ]);
    return otherHelper.paginationSendResponse( res, httpStatus.OK, true, customers, "Customer Data fetched successfully", page, size, totalData);
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
      customerData.created_by = req.user.id;
      customerData.added_at = new Date();
      const newCustomer = await new customerSch(customerData).save();

      const populatedCustomer  =  await customerSch
          .findById(newCustomer._id)
          .populate([{ path: "crops", select: "name_eng name_guj" },{ path: 'state', model: 'State', select: 'name' },
            { path: 'village', model: 'Village', select: 'name' },
            { path: 'taluka', model: 'Taluka', select: 'name' },
            { path: 'district', model: 'District', select: 'name' }])
          .lean()

      return otherHelper.sendResponse(res, httpStatus.OK, true, populatedCustomer, null, 'Customer Created successfully', null);
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
      { path: 'state', model: 'State', select: 'name' },
            { path: 'village', model: 'Village', select: 'name' },
            { path: 'taluka', model: 'Taluka', select: 'name' },
            { path: 'district', model: 'District', select: 'name' },
    ];
    const customer = await customerSch.findById(id);
    if (!customer)   return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Customer not found', null);

    const updatedCustomer = await customerSch.findByIdAndUpdate(id, { $set: customerData }, { new: true }).populate(populate);
  
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
    const number = (req.query.number || req.body.number || '').toString().replace(/[^0-9]/g, '');
    const order_id = req.query.order_id || req.params.order_id;
    const complain_id = req.query.complain_id  || req.params.complain_id;
    
    populate = [
      { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
      { path: 'created_by', model: 'users', select: 'name' },
      { path: 'state', model: 'State', select: 'name' },
            { path: 'village', model: 'Village', select: 'name' },
            { path: 'taluka', model: 'Taluka', select: 'name' },
            { path: 'district', model: 'District', select: 'name' },
      // { path: 'ref_name', model: 'users', select: 'name', strictPopulate: false },
    ];
    if (!number && !order_id && !complain_id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'At least one identifier (number, order_id, or complain_id) is required', null);
    }

    let customer = null;

    if (number) {
      customer = await customerSch.findOne({ mobile_number: number }).populate(populate);
    } else if (order_id) {
      let searchOrder = order_id.startsWith("AB-") ? `${order_id}` : `AB-${order_id}`;
      const order = await orderSch.findOne({ order_id: searchOrder }).select('customer');
      if (order && order.customer) {
        customer = await customerSch.findById(order.customer).populate(populate);
      }
    } else if (complain_id) {
      let searchComplain = complain_id.startsWith("ABC-") ? `${complain_id}` : `ABC-${complain_id}`;
      const complain = await complainSch.findOne({ complain_id: searchComplain }).select('customer_id');
      if (complain && complain.customer_id) {
        customer = await customerSch.findById(complain.customer_id).populate(populate);
      }
    }
    if (!customer)   return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'Customer not matched', null);

    return otherHelper.sendResponse(res, httpStatus.OK, true, customer, null, 'Customer found', null);
  } catch (err) {
    next(err);
  }
};

module.exports = customerController;