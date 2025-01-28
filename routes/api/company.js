const express = require('express');
const router = express.Router();

const  companyController  = require('../../modules/company/companyController');
const { sanitize, validate} = require('../../modules/module_access/module_accessValidation');
const { authentication , authorization} = require('../../middleware/auth.middleware');

router.get('/get-company-list',authentication, authorization, companyController.GetCompanylist);
router.post('/add-company-list',  authentication, authorization,  companyController.AddCompany);
router.delete('/remove-company-list',authentication, authorization, companyController.DeleteCompany);

module.exports = router;