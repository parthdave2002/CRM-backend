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

module.exports = router;
