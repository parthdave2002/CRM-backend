const express = require('express');
const router = express.Router();
const couponController = require('../../modules/coupon/couponController');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const validations = require('../../validation/validathions');
const { sanitize, validate } = validations.sanitizeAndValidate(['name', 'smount']);

router.get('/get-coupon',  couponController.GetCouponList);
router.post('/add-coupon', authentication, authorization('Coupon'), couponController.AddCoupon);
router.delete('/remove-coupon', authentication, authorization('Coupon'), couponController.DeleteCoupon);
router.delete('/status-coupon', authentication, authorization('Coupon'), couponController.ChangeStatus);

module.exports = router;
