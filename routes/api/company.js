const express = require('express');
const router = express.Router();
const  companyController  = require('../../modules/company/companyController');
const { authentication , authorization} = require('../../middleware/auth.middleware');

router.get('/get-company-list', authentication, authorization("Company"),companyController.GetCompanylist);
router.post('/add-company-list', authentication, authorization("Company"),   companyController.AddCompany);
router.delete('/remove-company-list', authentication, authorization("Company"), companyController.DeleteCompany);
router.delete('/status-company-list', authentication, authorization("Company"), companyController.changeStatus);

module.exports = router;