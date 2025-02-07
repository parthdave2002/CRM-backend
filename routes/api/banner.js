const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const BannerController = require('../../modules/banner/bannerController');

router.get("/get-banner", BannerController.getAllBannerList)
router.post("/add-banner",uploadHelper.uploadFiles('public/banner', 'single', 'banner_pic'), BannerController.AddBanner)
router.delete("/remove-banner", BannerController.DeleteBanner)

module.exports = router