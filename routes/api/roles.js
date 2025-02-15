const express = require('express');
const router = express.Router();

const dModule = require('../../modules/role/roleController');
const validations = require('../../modules/role/roleValidation');
const { authorization, authentication } = require('../../middleware/auth.middleware');

// const { sanitize, validate } = validations.sanitizeAndValidate(['name']);
// router.post('/role',  sanitize, validate, dModule.AddRoles);

// Role Apis
router.get('/get-role', dModule.GetRoles);
router.get('/roleview', authentication,authorization, dModule.GetRoleDetail);
router.post('/add-role',  dModule.AddRoles);
router.delete('/remove-role', dModule.DeleteRole);
router.get('/role-search', authentication,authorization,  dModule.GetRoleSearch);


router.get('/role-permission',  dModule.GetRolePermission);

// Save Access Api Code Start
router.post('/access/role', dModule.SaveAccessListFromRole);
router.get('/access/rolelist',dModule.GetAccessListFromRole);


module.exports = router;
