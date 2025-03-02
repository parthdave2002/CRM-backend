const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const bannerSch = require('../../schema/bannerSchema');
const path = require('path');
const fs = require('fs');

const bannerController = {};

bannerController.getAllBannerList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.id) {
      const user = await bannerSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Banner data found', null);
    }

    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await bannerSch.find({
        $or: [{ name: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0)   return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search data found', page, size, searchResults.length);
    }
    const pulledData = await otherHelper.getQuerySendResponse(bannerSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Banner data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

bannerController.AddBanner = async (req, res, next) => {
  try {
    const Banner = req.body;
    if (req.file) {
      Banner.banner_pic = req.file.filename; 
    }

    if (Banner._id) {
      const update = await bannerSch.findByIdAndUpdate(Banner._id, { $set: Banner }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Banner Data updated successfully ", null);
    } else {

      const newBanner = new bannerSch(Banner);
      await newBanner.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newBanner, null, "Banner Uploaded successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

bannerController.DeleteBanner = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Banner id required', null);
    }

    const banner_id = await bannerSch.findById(id);
    if(!banner_id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Banner not found', null);
    }

    if (banner_id?.banner_pic) {
      const filePath = path.resolve(__dirname, '../../public/banner', banner_id.banner_pic);

      if (fs.existsSync(filePath)) { 
          try {
              fs.unlinkSync(filePath);
          } catch (err) {
              return res.status(400).json({
                  data: err,
                  message: "Banner not deleted successfully",
                  success: false,
              });
          }
      } else {
          console.log('File does not exist:', filePath);
      }
    }

    const deleted = await bannerSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Banner delete success', null);
  } catch (err) {
    next(err);
  }
};

module.exports = bannerController;
