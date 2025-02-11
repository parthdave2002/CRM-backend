const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateRegisterInput = require('../../modules/user/userValidations');

const loginLogs = require('../../modules/user/loginlogs/loginlogController').loginLogController;
const uploadHelper = require('../../helper/upload.helper')
const userModule = require('../../modules/user/userController');
const { authentication, authenticationForLogout, authorization, getClientInfo, isPublicGoogleRegistrationAllow } = require('../../middleware/auth.middleware');


// /USERlIST API CODE START
router.get('/check-user', userModule.GetCheckUser);

router.get('/get-user', authentication,userModule.GetAllUser);
router.get('/user-search', authentication, userModule.GetUserSearch);
router.get('/deluser', authentication, authorization, userModule.DeleteUser);
router.get('/detailview', authentication,  userModule.GetUserDetail);
router.post('/add-user', authentication, uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.PostUser);
// /USERlIST API CODE END


router.post('/detail/:id', authentication, authorization, uploadHelper.uploadFiles('public/user/', 'single', 'file'), validateRegisterInput.sanitizeUpdateProfile, validateRegisterInput.validateUpdateProfile, userModule.UpdateUserDetail);

router.post('/changepw', authentication, validateRegisterInput.sanitizeAdd, validateRegisterInput.validateAdd, userModule.PostUserPwd);

/**
 * @route POST api/user/register
 * @description Register user route
 * @access Public
 */
router.post('/register', validateRegisterInput.sanitizeRegister, validateRegisterInput.validateRegisterInput, getClientInfo, userModule.Register);

/**
 * @route POST api/user/register/admin
 * @description Register user route || for admin
 * @access Public
 */
router.post('/register/admin', authentication, authorization, uploadHelper.uploadFiles('public/user/', 'single', 'file'), validateRegisterInput.sanitizeRegister, validateRegisterInput.validateRegisterInput, userModule.RegisterFromAdmin);

/**
 * @route POST api/user/verifymail
 * @description Verify mail by user
 * @access Public
 */
router.post('/verifymail', getClientInfo, userModule.Verifymail);

/**
 * @route POST api/user/verifymail/resend
 * @description Resent Verify mail by user
 * @access Public
 */
router.post('/verifymail/resend', userModule.ResendVerificationCode);

/**
 * @route POST api/user/login
 * @description Login user / Returning JWT Token
 * @access Public
 */
router.post('/login', userModule.Login);

// router.post('/login/2fa', getClientInfo, userModule.LoginAfterTwoFa);
// router.post('/login/2faga', getClientInfo, userModule.LoginAfterTwoFaGa);
/**
 * @route POST api/user/forgotpassword
 * @description Forgot Password
 * @access Public
 */
router.post('/forgotpassword', userModule.ForgotPassword);

/**
 * @route POST api/user/resetpassword
 * @description Forgot Password
 * @access Public
 */
router.post('/resetpassword', getClientInfo, userModule.ResetPassword);

/**
 * @route POST api/user/changepassword
 * @description change Password
 * @access Public
 */
router.post('/changepassword', authentication, validateRegisterInput.validateChangePassword, userModule.changePassword);

/**
 * @route POST api/user/info
 * @description returns the user info
 * @access Public
 */
router.get('/info', authentication, userModule.Info);

/**
 * @route POST api/user/loginlogs
 * @description returns the loginlogs
 * @access Private
 */
router.get('/loginlogs', authentication, authorization, loginLogs.getLogList);

/**
 * @route POST api/user/loginlogs/logout
 * @description remove token from loginlog
 * @access Private
 */
router.post('/loginlogs/logout', authentication, validateRegisterInput.validateLogsLogoutAction, loginLogs.removeToken);

/**
 * @route POST api/user/logout
 * @description remove token from loginlog
 * @access Public
 */
router.get('/logout', authenticationForLogout, loginLogs.logout);

/**
 * @route GET api/user/profile
 * @description get user profile info
 * @access Public
 */
router.get('/profile', authentication, userModule.GetProfile);

/**
 * @route POST api/user/profile
 * @description POST user profile info
 * @access Public
 */
router.post('/profile', authentication, uploadHelper.uploadFiles('public/user/', 'single', 'file'), validateRegisterInput.sanitizeUpdateUserProfile, validateRegisterInput.validateUpdateUserProfile, userModule.postProfile);
router.post('/multiple', authentication, authorization, userModule.selectMultipleData);

module.exports = router;
