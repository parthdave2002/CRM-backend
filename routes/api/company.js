const express = require('express');
const router = express.Router();
const  companyController  = require('../../modules/company/companyController');
const { authentication , authorization} = require('../../middleware/auth.middleware');
const validations = require('../../validation/validathions');
const { sanitize, validate } = validations.sanitizeAndValidate(["name_eng", "name_guj", "description", "is_active"]);

router.get('/get-company-list', authentication, authorization("Company"),companyController.GetCompanylist);
router.post('/add-company-list', sanitize, validate, authentication, authorization("Company"),   companyController.AddCompany);
router.delete('/remove-company-list', sanitize, validate, authentication, authorization("Company"), companyController.DeleteCompany);
router.delete('/status-company-list', authentication, authorization("Company"), companyController.changeStatus);

module.exports = router;