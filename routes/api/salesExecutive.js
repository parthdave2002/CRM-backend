const express = require('express');
const router = express.Router();
const { authentication, authorization } = require('../../middleware/auth.middleware');
const salesExecutiveController = require('../../modules/salesExecutive/salesExecutiveController');

router.get('/dashboard', authentication, salesExecutiveController.GetSalesExecutiveDashboard);


module.exports = router