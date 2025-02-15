const express = require('express');
const router = express.Router();
const  companyController  = require('../../modules/company/companyController');
const { authentication , authorization} = require('../../middleware/auth.middleware');

router.get('/get-company-list', companyController.GetCompanylist);
router.post('/add-company-list',    companyController.AddCompany);
router.delete('/remove-company-list', companyController.DeleteCompany);

module.exports = router;