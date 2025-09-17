const express = require('express');
const router = express.Router();
const dModule = require('../../modules/role/roleController');
const { authorization, authentication } = require('../../middleware/auth.middleware');

// Role Apis
router.get('/get-role',authentication,authorization("Roles"), dModule.GetRoles);
router.post('/add-role', authentication,authorization("Roles"), dModule.AddRoles);
router.delete('/remove-role',authentication,authorization("Roles"), dModule.DeleteRole);

// Save Access Api Code Start
router.get('/role-permission',authentication,authorization("Roles"), dModule.GetRolePermission);
router.post('/access/role',authentication,authorization("Roles"), dModule.SaveAccessListFromRole);
router.get('/access/rolelist',authentication,authorization("Roles"),dModule.GetAccessListFromRole);

module.exports = router;