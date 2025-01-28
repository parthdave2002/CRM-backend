const express = require('express');
const router = express.Router();

const  module_accessController  = require('../../modules/module_user_access/module_user_accesscontroller');
const { sanitize, validate} = require('../../modules/module_user_access/module_user_accessValidation');
const { authentication , authorization} = require('../../middleware/auth.middleware');

router.get('/get-module-user-access-list',authentication, authorization, module_accessController.getModule);
router.post('/add-module-user-access-list', authentication, authorization,  sanitize, validate, module_accessController.postModule);

module.exports = router;
