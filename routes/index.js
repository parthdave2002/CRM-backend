const express = require('express');
const router = express.Router();

// All route of User
const userRoutes = require('./api/users');
router.use('/user', userRoutes);

// All route of Roles
const roleRoutes = require('./api/roles');
router.use('/role', roleRoutes);

const adminDashboard = require('./api/adminDashboard');
router.use('/dashboard', adminDashboard);

const customerRoutes = require('./api/customer');
router.use('/customer', customerRoutes);

const company = require('./api/company');
router.use('/company', company);

const admincategory = require('./api/adminCategory');
router.use('/category', admincategory);

const adminpackingtype = require('./api/adminPackingType');
router.use('/packing-type', adminpackingtype);

const adminpacking = require('./api/adminPacking');
router.use('/packing', adminpacking);

const productdata = require('./api/product');
router.use('/product', productdata);

const orderdata = require('./api/order');
router.use('/order', orderdata);

const bannerdata = require('./api/banner');
router.use('/banner', bannerdata);


const taglogdata = require('./api/taglog');
router.use('/taglog', taglogdata);

const leaddata = require('./api/lead');
router.use('/lead', leaddata);

const cropdata = require('./api/crop');
router.use('/crop', cropdata);

const coupon = require('./api/coupon');
router.use('/coupon', coupon);

const complaindata = require('./api/complain');
router.use('/complain', complaindata);

const salesExcutivedata = require('./api/salesExecutive');
router.use('/sales-executive', salesExcutivedata);

const Statedata = require('./api/location');
router.use('/location', Statedata);

module.exports = router;
