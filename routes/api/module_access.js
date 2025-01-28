const express = require('express');
const router = express.Router();

const  module_accessController  = require('../../modules/module_access/module_accesscontroller');
const { sanitize, validate} = require('../../modules/module_access/module_accessValidation');
const { authentication , authorization} = require('../../middleware/auth.middleware');

router.get('/get-module-access-list',authentication, authorization, module_accessController.getModule);
router.get('/get-search-module-access-list',authentication, authorization, module_accessController.getsearchModule);
router.post('/add-module-access-list',  authentication, authorization,  module_accessController.postModule);

module.exports = router;
