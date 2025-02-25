const express = require('express');
const router = express.Router();
const validateRegisterInput = require('../../modules/user/userValidations');

const loginLogs = require('../../modules/user/loginlogs/loginlogController').loginLogController;
const uploadHelper = require('../../helper/upload.helper')
const userModule = require('../../modules/user/userController');
const { authentication, authenticationForLogout, authorization, getClientInfo } = require('../../middleware/auth.middleware');


// /USERlIST API CODE START
router.get('/check-user', userModule.GetCheckUser);

router.get('/get-user', userModule.GetAllUser);
router.get('/user-search',  userModule.GetUserSearch);
router.get('/deluser',   userModule.DeleteUser);
router.get('/detailview',   userModule.GetUserDetail);
router.post('/add-user',  uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.PostUser);
router.put('/update-user',  authentication, uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.UpdateUserImage);
// /USERlIST API CODE END

router.post('/login', userModule.Login);
router.post('/forgot-password', userModule.ForgotPassword);
router.get('/verify-token', userModule.VerifyResetPasswordToken);
router.post('/reset-password', userModule.ResetPassword);

router.get('/profile', authentication, userModule.GetProfile);

module.exports = router;