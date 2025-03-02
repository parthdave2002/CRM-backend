const express = require('express');
const router = express.Router();

const dModule = require('../../modules/role/roleController');
const validations = require('../../modules/role/roleValidation');
const { authorization, authentication } = require('../../middleware/auth.middleware');

// const { sanitize, validate } = validations.sanitizeAndValidate(['name']);
// router.post('/role',  sanitize, validate, dModule.AddRoles);

// Role Apis
router.get('/get-role',authentication, dModule.GetRoles);
router.get('/roleview', authentication,authorization, dModule.GetRoleDetail);
router.post('/add-role', authentication, dModule.AddRoles);
router.delete('/remove-role',authentication, dModule.DeleteRole);
router.get('/role-search', authentication,authorization,  dModule.GetRoleSearch);


router.get('/role-permission',authentication,  dModule.GetRolePermission);

// Save Access Api Code Start
router.post('/access/role',authentication, dModule.SaveAccessListFromRole);
router.get('/access/rolelist',authentication,dModule.GetAccessListFromRole);


module.exports = router;
