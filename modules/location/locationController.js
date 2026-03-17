const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const State = require('../../schema/locationSchema');
const District = require('../../schema/districtSchema');
const Taluka = require('../../schema/talukaSchema');
const Village = require('../../schema/villageSchema');

const locationController = {};

locationController.getAllState = async (req, res, next) => {
  try {
    const states = await State.find().select('_id name').sort({ name: 1 });
    return otherHelper.sendResponse(res, httpStatus.OK, true, states, null, 'State data successfully fetched', null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllDistrict = async (req, res, next) => {
  try {
    const { stateId } = req.query;
    if (!stateId) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'stateId is required', null);
    }

    const districts = await District.find({ state: stateId }).select('_id name').sort({ name: 1 });

    if (!districts.length) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, [], null, 'No districts found for this state', null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, districts, null, 'District data successfully fetched', null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllTaluka = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    if (!districtId) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'districtId is required', null);
    }

    const talukas = await Taluka.find({ district: districtId }).select('_id name').sort({ name: 1 });

    if (!talukas.length) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, [], null, 'No talukas found for this district', null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, talukas, null, 'Taluka data successfully fetched', null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllVillage = async (req, res, next) => {
  try {
    const { talukaId } = req.query;
    if (!talukaId) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'talukaId is required', null);
    }

    const villages = await Village.find({ taluka: talukaId }).select('_id name pincode').sort({ name: 1 });

    if (!villages.length) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, [], null, 'No villages found for this taluka', null);
    }

    return otherHelper.sendResponse(res, httpStatus.OK, true, villages, null, 'Village data successfully fetched', null);
  } catch (err) {
    next(err);
  }
};

module.exports = locationController;