const express = require('express');
const router = express.Router();
const { authentication, authorization } = require('../../middleware/auth.middleware');
const adminDashboardController = require('./../../modules/adminDashboard/adminDashboardController');

router.get('/details',authentication,authorization("Dashboard"), adminDashboardController.getDashboardData);
router.get('/report',authentication,authorization("Dashboard"), adminDashboardController.getReportData);

module.exports = router;