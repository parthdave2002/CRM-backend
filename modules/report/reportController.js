const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const orderSch = require('../../schema/orderSchema');
const leadSch = require('../../schema/leadSchema');
const advisorSch = require('../../schema/userSchema');
const customerSch = require('../../schema/customerSchema');
const stateSch = require('../../schema/locationSchema');

const reportController = {};

function findNameFromState(state, id, type) {
  if (!id || !state?.districts) return '';

  for (const district of state.districts) {
    if (type === 'district' && district._id.equals(id)) return district.name;

    if (!district.talukas) continue;
    for (const taluka of district.talukas) {
      if (type === 'taluka' && taluka._id.equals(id)) return taluka.name;

      if (!taluka.villages) continue;
      for (const village of taluka.villages) {
        if (type === 'village' && village._id.equals(id)) return village.name;
      }
    }
  }
  return '';
}

async function enrichCustomerLocation(customer) {
  if (!customer) return null;

  const baseCustomer = customer.toObject?.() || customer;

  if (!baseCustomer?.state) {
    return { ...baseCustomer, district_name: '', taluka_name: '', village_name: '' };
  }

  try {
    const stateData = baseCustomer.state?.districts?.length
      ? baseCustomer.state
      : await stateSch.findById(baseCustomer.state._id).lean();

    return {
      ...baseCustomer,
      district_name: findNameFromState(stateData, baseCustomer.district, 'district'),
      taluka_name: findNameFromState(stateData, baseCustomer.taluka, 'taluka'),
      village_name: findNameFromState(stateData, baseCustomer.village, 'village'),
    };
  } catch (err) {
    console.error(`Error enriching customer ${baseCustomer._id}:`, err.message);
    return { ...baseCustomer, district_name: '', taluka_name: '', village_name: '' };
  }
}

// reportController.getAllReportList = async (req, res, next) => {
//   try {
//     const { type, subtype, startDate, endDate, } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const size = Math.min(parseInt(req.query.size) || 10, 500);
//     const skip = (page - 1) * size;
//     const filter = {};
//     let totalData = 0;

//     // Date filter
//     if (startDate) {
//       filter.added_at = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate || Date.now()),
//       };
//     }

//     let data = [];

//     switch (type) {
//       case 'order': {
//         const orders = await orderSch
//           .find(filter).skip(skip).limit(size)
//           .populate([
//             {  path: 'products.id',  model: 'product',  populate: [  { path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' } ], },
//             {  path: 'customer',  model: 'customer', select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode post_office village vaillage_name taluka taluka_name district district_name', populate: [{ path: 'state', model: 'State', select: 'name districts talukas villages' }], },
//             { path: 'advisor_name', model: 'users', select: 'name' },
//             { path: 'coupon', model: 'coupon' },
//           ]) .lean();
//         totalData = await orderSch.countDocuments(filter);
//         data = await Promise.all(
//           orders.map(async (order) => ({
//             ...order,
//             customer: await enrichCustomerLocation(order.customer),
//           }))
//         );
//         break;
//       }

//       case 'farmer': {
//         const farmers = await customerSch
//           .find(filter).skip(skip).limit(size)
//           .populate([
//             { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
//             { path: 'created_by', model: 'users', select: 'name' },
//             { path: 'state', model: 'State', select: 'name districts talukas villages' },
//           ]) .lean();
//         totalData = await customerSch.countDocuments(filter)
//         data = await Promise.all(farmers.map(enrichCustomerLocation));
//         break;
//       }

//       case 'advisor': {
//         filter.role = { $ne: '67b388a7d593423df0e24295' };
//         data = await advisorSch
//           .find(filter).skip(skip).limit(size)
//           .populate([{ path: 'role', model: 'roles', select: 'role_title' }])
//           .select(  'aadhar_card pan_card bank_passbook is_active _id name email password gender mobile_no date_of_joining date_of_birth emergency_mobile_no emergency_contact_person address role added_at' )
//           .lean();
//         totalData = await advisorSch.countDocuments(filter)
//         break;
//       }

//       case 'lead': {
//         if (subtype) filter.type = subtype;
//         data = await leadSch.find(filter).skip(skip).limit(size).lean();
//         totalData = await leadSch.countDocuments(filter)
//         break;
//       }

//       default:
//         return otherHelper.sendResponse(  res,  httpStatus.BAD_REQUEST, false,  null,  null,  'Invalid report type', null );
//     }
//     return otherHelper.paginationSendResponse(res, httpStatus.OK, true, data, "Report data fetched", page, size, totalData);
//   } catch (err) {
//     next(err);
//   }
// };


reportController.getAllReportList = async (req, res, next) => {
  try {
    const { type, subtype, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const size = Math.min(parseInt(req.query.size) || 10, 500);
    const skip = (page - 1) * size;
    const filter = {};
    let totalData = 0;

    // ✅ Date filter
    if (startDate) {
      filter.added_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate || Date.now()),
      };
    }

    let data = [];

    switch (type) {
      case "order": {
        const query = orderSch.find(filter)
          .populate([
            { path: 'products.id', model: 'product', populate: [{ path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' }] },
            { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode post_office village vaillage_name taluka taluka_name district district_name', populate: [{ path: 'state', model: 'State', select: 'name districts talukas villages' }] },
            { path: 'advisor_name', model: 'users', select: 'name' },
            { path: 'coupon', model: 'coupon' },
          ])
          .lean();

  query.skip(skip).limit(size);
  const orders = await query;
        totalData = await orderSch.countDocuments(filter);

        data = await Promise.all(
          orders.map(async (order) => ({
            ...order,
            customer: await enrichCustomerLocation(order.customer),
          }))
        );
        break;
      }

      // Repeat same skip/limit logic for other types
      case "farmer": {
        const query = customerSch.find(filter)
          .populate([
            { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
            { path: 'created_by', model: 'users', select: 'name' },
            { path: 'state', model: 'State', select: 'name districts talukas villages' },
          ])
          .lean();
  query.skip(skip).limit(size);
  const farmers = await query;
        totalData = await customerSch.countDocuments(filter);
        data = await Promise.all(farmers.map(enrichCustomerLocation));
        break;
      }

        case 'advisor': {
        filter.role = { $ne: '67b388a7d593423df0e24295' };
        data = await advisorSch
          .find(filter).skip(skip).limit(size)
          .populate([{ path: 'role', model: 'roles', select: 'role_title' }])
          .select(  'aadhar_card pan_card bank_passbook is_active _id name email password gender mobile_no date_of_joining date_of_birth emergency_mobile_no emergency_contact_person address role added_at' )
          .lean();
        totalData = await advisorSch.countDocuments(filter)
        break;
      }

      case 'lead': {
        if (subtype) filter.type = subtype;
        data = await leadSch.find(filter).skip(skip).limit(size).lean();
        totalData = await leadSch.countDocuments(filter)
        break;
      }

        default:
        return otherHelper.sendResponse(  res,  httpStatus.BAD_REQUEST, false,  null,  null,  'Invalid report type', null );
    }

    return otherHelper.paginationSendResponse(res, 200, true, data, "Report data fetched", page, size, totalData);
  } catch (err) {
    next(err);
  }
};


reportController.exportData = async (req, res, next) => {
  try {
    const { type, subtype, startDate, endDate } = req.query;

    if (!type) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Missing report type', null);

    const filter = {};
    if (startDate) {
      filter.added_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate || Date.now()),
      };
    }

  // Set headers for streaming JSON and force download so the browser won't try to preview a huge payload
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  const filename = `report-${(type || 'data')}-${Date.now()}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Flush headers to the client early (if supported) so download starts immediately
  if (typeof res.flushHeaders === 'function') res.flushHeaders();
  // Start JSON array
  res.write('[');
    let first = true;

    const streamAndWrite = async (cursor, transformFn) => {
      try {
        for await (const doc of cursor) {
          const obj = transformFn ? await transformFn(doc) : (doc.toObject?.() || doc);
          const chunk = JSON.stringify(obj);
          if (!first) res.write(',');
          res.write(chunk);
          first = false;
        }
      } catch (err) {
        throw err;
      }
    };

    switch (type) {
      case 'order': {
        const q = orderSch.find(filter)
          .populate([
            { path: 'products.id', model: 'product', populate: [{ path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' }] },
            { path: 'customer', model: 'customer', select: 'customer_name firstname middlename lastname address alternate_number mobile_number pincode post_office village vaillage_name taluka taluka_name district district_name', populate: [{ path: 'state', model: 'State', select: 'name districts talukas villages' }] },
            { path: 'advisor_name', model: 'users', select: 'name' },
            { path: 'coupon', model: 'coupon' },
          ])
          .lean()
          .cursor();

        await streamAndWrite(q, async (order) => ({
          ...order,
          customer: await enrichCustomerLocation(order.customer),
        }));
        break;
      }

      case 'farmer': {
        // Use aggregation with $lookup to avoid N+1 queries when enriching location
        const pipeline = [{ $match: filter }];

        // lookup crops
        pipeline.push({
          $lookup: {
            from: 'crops',
            localField: 'crops',
            foreignField: '_id',
            as: 'crops',
          },
        });

        // lookup created_by (users)
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by',
          },
        });
        pipeline.push({ $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } });

        // lookup state using the actual collection name for the state schema
        pipeline.push({
          $lookup: {
            from: stateSch.collection.name,
            localField: 'state',
            foreignField: '_id',
            as: 'state',
          },
        });
        pipeline.push({ $unwind: { path: '$state', preserveNullAndEmptyArrays: true } });

        const cursor = customerSch.aggregate(pipeline).cursor({ batchSize: 100 }).exec();

        await streamAndWrite(cursor, async (farmer) => await enrichCustomerLocation(farmer));
        break;
      }

      case 'advisor': {
        filter.role = { $ne: '67b388a7d593423df0e24295' };
        const q = advisorSch.find(filter)
          .populate([{ path: 'role', model: 'roles', select: 'role_title' }])
          .select('aadhar_card pan_card bank_passbook is_active _id name email password gender mobile_no date_of_joining date_of_birth emergency_mobile_no emergency_contact_person address role added_at')
          .lean()
          .cursor();

        await streamAndWrite(q);
        break;
      }

      case 'lead': {
        if (subtype) filter.type = subtype;
        const q = leadSch.find(filter).lean().cursor();
        await streamAndWrite(q);
        break;
      }

      default:
        // close the array before returning
        res.write(']');
        res.end();
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid report type', null);
    }

    // Close JSON array and end response
    res.write(']');
    res.end();
  } catch (err) {
    // If response already started streaming, end it with an error wrapper
    try {
      if (!res.headersSent) {
        return next(err);
      }
      // attempt to send an error fragment (client may ignore malformed JSON)
      res.end();
    } catch (e) {
      // swallow
    }
    next(err);
  }
};

module.exports = reportController;