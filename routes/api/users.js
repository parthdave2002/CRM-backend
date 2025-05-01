const express = require('express');
const router = express.Router();
const validateRegisterInput = require('../../modules/user/userValidations');

const loginLogs = require('../../modules/user/loginlogs/loginlogController').loginLogController;
const uploadHelper = require('../../helper/upload.helper')
const userModule = require('../../modules/user/userController');
const { authentication, authorization } = require('../../middleware/auth.middleware');


// /USERlIST API CODE START
router.get('/check-user', userModule.GetCheckUser);

router.get('/get-user',authentication,authorization("User"), userModule.GetAllUser);
router.get('/deluser',authentication, authorization("User"),  userModule.DeleteUser);
router.get('/detailview',authentication, authorization("User"),  userModule.GetUserDetail);
router.post('/add-user', authentication,authorization("User"), uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.PostUser);
router.post('/update-user', authentication,authorization("User"), uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.UpdateUserImage);
// /USERlIST API CODE END

router.post('/login', userModule.Login);
router.post('/forgot-password', userModule.ForgotPassword);
router.get('/verify-token', userModule.VerifyResetPasswordToken);
router.post('/reset-password', userModule.ResetPassword);

router.get('/profile', authentication, userModule.GetProfile);
router.post('/update-profile', authentication, uploadHelper.uploadFiles('public/user', 'single', 'user_pic'), userModule.updateUserProfileImage);

module.exports = router;