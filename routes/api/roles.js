const express = require('express');
const router = express.Router();

const dModule = require('../../modules/role/roleController');
const validations = require('../../modules/role/roleValidation');
const Modulevalidations = require('../../modules/module_user_access/module_user_accessValidation');
const { authorization, authentication } = require('../../middleware/auth.middleware');

// const { sanitize, validate } = validations.sanitizeAndValidate(['name']);
// router.post('/role',  sanitize, validate, dModule.AddRoles);

// Role Apis
router.get('/role', authentication, authorization, dModule.GetRoles);
router.get('/roleview', authentication,authorization, dModule.GetRoleDetail);
router.post('/role', validations.sanitizeRole, validations.validateRole, dModule.AddRoles);
router.get('/delrole', authentication,authorization, dModule.DeleteRole);
router.get('/role-search', authentication, dModule.GetRoleSearch);

// Module Apis
router.get('/module', authentication, authorization, dModule.GetModule);
router.get('/module-view', authentication, authorization, dModule.GetModuleDetail);
router.get('/module-search', authentication, dModule.GetModuleSearch);
router.post('/module', authentication, authorization, validations.sanitizeModule, validations.validateModule, dModule.AddModuleList);
router.get('/delmodule', authentication, authorization, dModule.DeleteModule);

// Module Group Apis
router.get('/module-group', authentication,authorization,  dModule.GetModuleGroup);
router.get('/module-group-view', authentication, authorization, dModule.GetModuleGroupDetail);
router.get('/module-group-search', authentication, dModule.GetModuleGroupSearch);
router.post('/module-group', authentication, authorization, validations.validateModuleGroup, dModule.AddModuleGroupList);
router.get('/delmodule-group', authentication, authorization, dModule.deleteModuleGroupList);

// Save Access Api Code Start
router.post('/access/role', authentication, authorization, Modulevalidations.sanitize,Modulevalidations.validate,dModule.SaveAccessListFromRole);
router.get('/access/rolelist', authentication, authorization,dModule.GetAccessListFromRole);


// Save Access Api Code End





// Waft Engine Code
// Access Api
router.get('/access', authentication, authorization, dModule.GetAccessList);
router.post('/access', authentication, authorization, validations.sanitizeAccess, validations.validateAccess, dModule.SaveAccessList);
router.get('/fix-access', authentication, dModule.fixRoleModuleAccessProblem);

/**
 * Access Management of Role to all Module
 */
router.get('/module-hierarchy', authentication,  dModule.GetModulesWithHierarchy);
router.get('/access/role/:roleid', authentication, authorization, dModule.GetAccessListForRole);


/**
 *Access Management of Module to all roles
 */
router.get('/access/module/:moduleid', authentication, authorization, dModule.GetAccessListForModule);
router.post('/access/module/:moduleid', authentication, authorization, dModule.SaveAccessListForModule);

// router.get('/active', authentication, authorization, dModule.GetModuleActive)
// router.delete('/module-group/:id', authentication, authorization, dModule.deleteModuleGroupList)
router.post('/multiple', authentication, authorization, dModule.selectMultipleData);

module.exports = router;
