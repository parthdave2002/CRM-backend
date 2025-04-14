const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const locationSch = require('../../schema/locationSchema');
const locationController = {};

locationController.getAllState = async (req, res, next) => {
  try {
    const states = await locationSch.find().select('name');
    return otherHelper.sendResponse(res, httpStatus.OK, true, states, null, "State data successfully fetched", null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllDistrict = async (req, res, next) => {
  try {
    const { stateId } = req.query;
    const state = await locationSch.findById(stateId).select('districts.name districts._id');
    if (!state) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "State not found", null);
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true, state.districts, null, "District data successfully fetched", null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllTaluka = async (req, res, next) => {
  try {
    const { stateId, districtId } = req.query;
    const state = await locationSch.findById(stateId);
    if (!state) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "State not found", null);
    }
    const district = state.districts.id(districtId)
    if (!district) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "District not found", null);
    }
    const talukaList = district.talukas.map(taluka => ({
      _id: taluka._id,
      name: taluka.name
    }));
    return otherHelper.sendResponse(res, httpStatus.OK, true, talukaList, null, "Taluka data successfully fetched", null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllVillage = async (req, res, next) => {
  try {
    const { stateId, districtId, talukaId } = req.query;
    const state = await locationSch.findById(stateId);
    if (!state) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "State not found", null);
    }
    const district = state.districts.find(d => d._id.toString() === districtId);
    if (!district) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "District not found", null);
    }
    const taluka = district.talukas.find(t => t._id.toString() === talukaId);
    if (!taluka) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "Taluka not found", null);
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true, taluka.villages, null, "Village data successfully fetched", null);
  } catch (err) {
    next(err);
  }
};

module.exports = locationController;