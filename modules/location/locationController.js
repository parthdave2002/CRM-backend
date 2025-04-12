const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const locationSch = require('../../schema/locationSchema');
const locationController = {};

locationController.getAllState= async (req, res, next) => {
  try {
    return otherHelper.sendResponse(res, httpStatus.OK, true, null, null,"State data successfully", null);
  } catch (err) {
    next(err);
  }
};

locationController.getAllDistict= async (req, res, next) => {
    try {
      return otherHelper.sendResponse(res, httpStatus.OK, true, null, null,"District data successfully", null);
    } catch (err) {
      next(err);
    }
  };

  locationController.getAllTaluka= async (req, res, next) => {
    try {
      return otherHelper.sendResponse(res, httpStatus.OK, true, null, null,"Taluka data successfully", null);
    } catch (err) {
      next(err);
    }
  };


  locationController.getAllVillage= async (req, res, next) => {
    try {
      return otherHelper.sendResponse(res, httpStatus.OK, true, null, null,"Village data successfully", null);
    } catch (err) {
      next(err);
    }
  };

module.exports = locationController;