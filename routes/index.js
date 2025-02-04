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

const module_access = require('./api/module_access');
router.use('/moduleaccess', module_access);

const module_user_access = require('./api/module_user_access');
router.use('/moduleuseraccess', module_user_access);

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

module.exports = router;
