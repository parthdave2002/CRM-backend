const express = require('express');
const router = express.Router();
const { authentication, authorization } = require('../../middleware/auth.middleware');
const reportController = require('../../modules/report/reportController');

router.get('/get-report',authentication,authorization("Report"), reportController.getAllReportList);
router.get('/export-data',authentication,authorization("Report"), reportController.exportData);

module.exports = router