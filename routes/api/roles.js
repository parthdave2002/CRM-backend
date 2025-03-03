const express = require('express');
const router = express.Router();

const dModule = require('../../modules/role/roleController');
const validations = require('../../modules/role/roleValidation');
const { authorization, authentication } = require('../../middleware/auth.middleware');

// const { sanitize, validate } = validations.sanitizeAndValidate(['name']);
// router.post('/role',  sanitize, validate, dModule.AddRoles);

// Role Apis
router.get('/get-role',authentication,authorization("Roles"), dModule.GetRoles);
router.get('/roleview', authentication,authorization("Roles"), dModule.GetRoleDetail);
router.post('/add-role', authentication,authorization("Roles"), dModule.AddRoles);
router.delete('/remove-role',authentication,authorization("Roles"), dModule.DeleteRole);
router.get('/role-search', authentication,authorization("Roles"),  dModule.GetRoleSearch);


router.get('/role-permission',authentication,authorization("Roles"),  dModule.GetRolePermission);

// Save Access Api Code Start
router.post('/access/role',authentication,authorization("Roles"), dModule.SaveAccessListFromRole);
router.get('/access/rolelist',authentication,authorization("Roles"),dModule.GetAccessListFromRole);


module.exports = router;
