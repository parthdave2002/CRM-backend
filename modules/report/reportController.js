const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const leadSch = require('../../schema/leadSchema');
const advisorSch = require('../../schema/userSchema');
const customerSch = require('../../schema/customerSchema');
const stateSch = require('../../schema/locationSchema');

const reportController = {};

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

reportController.getAllReportList = async (req, res, next) => {
  try {
    const { type, subtype, startDate, endDate } = req.query;
    const filter = {};

    // Date filter
    if (startDate) {
      filter.added_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate || new Date()), // use today's date if endDate is not provided
      };
    }

    let data = [];

    switch (type) {
      case 'order': {
        const pulledData = await orderSch.find(filter).populate([
          { path: 'products.id', model: 'product', populate: [{ path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' }] },
          {
            path: 'customer',
            model: 'customer',
            select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode post_office village vaillage_name taluka taluka_name district district_name',
            populate: [{ path: 'state', model: 'State', select: 'name' }],
          },
          { path: 'advisor_name', model: 'users', select: 'name' },
          { path: 'coupon', model: 'coupon' },
        ]);

        finalData = await Promise.all(
          pulledData.map(async (order) => {
            const cust = order.customer;
            if (!cust && !cust?.state) {
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
        data = finalData;
        break;
      }

      case 'farmer': {
        const farmers = await customerSch.find(filter).populate([
          { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
          { path: 'created_by', model: 'users', select: 'name' },
          { path: 'state', model: 'State', select: 'name' },
        ]);
        finalData = await Promise.all(
          farmers.map(async (cust) => {
            if (!cust && !cust?.state) {
              return {
                ...cust?.toObject?.(),
                district_name: '',
                taluka_name: '',
                village_name: '',
              };
            }

            try {
              const stateData = cust.state?.districts && cust.state?.districts.length ? cust.state : await stateSch.findOne({ _id: cust.toObject().state._id }).lean();
              const districtName = findNameFromState(stateData, cust.district, 'district') || '';
              const talukaName = findNameFromState(stateData, cust.taluka, 'taluka') || '';
              const villageName = findNameFromState(stateData, cust.village, 'village') || '';

              return {
                ...cust?.toObject?.(),
                district_name: districtName,
                taluka_name: talukaName,
                village_name: villageName,
              };
            } catch (err) {
              console.error(`Error enriching customer ${cust._id}:`, err.message);
              return {
                ...cust?.toObject?.(),
                district_name: '',
                taluka_name: '',
                village_name: '',
              };
            }
          }),
        );
        data = finalData;
        break;
      }

      case 'advisor': {
        filter.role = { $ne: '67b388a7d593423df0e24295' } 
        const advisors = await advisorSch.find(filter).populate([{ path: 'role', model: 'roles', select: 'role_title' }]) .select('aadhar_card pan_card bank_passbook is_active _id name email password gender mobile_no date_of_joining date_of_birth emergency_mobile_no emergency_contact_person address role added_at');
        data = advisors;
        break;
      }

      case 'lead': {
        if (subtype) filter.type = subtype;
        const leads = await leadSch.find(filter);
        data = leads;
        break;
      }

      default:
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid report type', null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Report data fetched', null);
  } catch (err) {
    next(err);
  }
};

reportController.exportData = async (req, res, next) => {
  try {
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, null, 'Order Data retrieved successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

module.exports = reportController;