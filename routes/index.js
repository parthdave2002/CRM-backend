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

// const company = require('./api/company');
// router.use('/company', company);

module.exports = router;
