const userSch = require('../../schema/userSchema');
const roleSch = require('../../schema/roleSchema');
const roleAccessModel = require("../../schema/role_accessschema")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./userConfig');
const httpStatus = require('http-status');
const emailHelper = require('./../../helper/email.helper');
const twoFaHelper = require('./../../helper/2fa.helper');
const renderMail = require('./../template/templateController').internal;
const otherHelper = require('../../helper/others.helper');
const loginLogs = require('./loginlogs/loginlogController').internal;
const { getSetting } = require('../../helper/settings.helper');
const { getAccessData } = require('../../helper/Access.helper');
const userConfig = require('./userConfig');
const sendEmail = require('../../helper/comman-email.helper');
const userController = {};
const tokenSchema = require("../../schema/tokenSchema")

userController.GetCheckUser = async (req, res, next) => {
  try {
      const username = req.query.search;
      const existingUser = await userSch.findOne({name : username});
      if(existingUser){
        return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, 'user exist!', null);
      }
      else{
        return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'user not exist!', null );
      }
  } catch (err) {
    next(err);
  }
};

userController.GetAllUser = async (req, res, next) => {
  try {
    if(req.query.id){
      const user = await userSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'User Data found', null);
    }
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);
    if (req.query.search && req.query.search !== "null"){
      const searchResults = await userSch.find({
        $or: [{ name: { $regex: req.query.search, $options: "i" } }], 
      });
      if (searchResults.length === 0)   return otherHelper.sendResponse(res, httpStatus.OK, true, null, [],'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults , " Search Data found", page, size, searchResults.length);
    }
    selectQuery = 'name email password gender mobile_no date_of_joining  role user_id is_active';
    populate = [{ path: 'roles', select: 'role_title' }];

    const pulledData = await otherHelper.getQuerySendResponse(userSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, config.gets, page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};


userController.DeleteUser = async (req, res, next) => {
  try {
    const id = req.query.id;
    const user = await userSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, 'User delete Succeessfully', null);
  } catch (err) {
    next(err);
  }
};

userController.GetUserDetail = async (req, res, next) => {
  try {
    const user = await userSch.findById(req.query.id, {
      email_verified: 1,
      roles: 1,
      name: 1,
      email: 1,
      bio: 1,
      updated_at: 1,
      is_active: 1,
      password: 1,
    });

    return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, config.get, null);
  } catch (err) {
    next(err);
  }
};

userController.PostUser = async (req, res, next) => {
  try {
    const user = req.body;

    let profilePic = null;
    if (req?.file) {
      profilePic = req.file.filename;
    }

    const existingUserName = await userSch.findOne({ name: req.body.name })
    if (existingUserName) return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'Username already exist!', null);

    let email = req.body.email && req.body.email.toLowerCase();
    const existingUser = await userSch.findOne({ email: email })
    if (existingUser) return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'user email already exist!', null);
    
    const existingMobile = await userSch.findOne({ mobile_no: user.mobile_no })
    if (existingMobile)  return otherHelper.sendResponse(res, httpStatus.OK, false, null, null, 'user mobile  already exist!', null);
    
    let salt = await bcrypt.genSalt(10);
    let hashPwd = await bcrypt.hash(req.body.password, salt);

    const data = await userSch.create({
      ...req.body,
      password: hashPwd,
      user_pic: profilePic,
    });

    // const newUser = new userSch(user);
    // await newUser.save();
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'user add success!', null);
  } catch (err) {
    next(err);
  }
};

userController.UpdateUserImage = async (req, res, next) => {
  try {
    const userId = req.body.id;
    const user = req.body;

    if (!userId) return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, "User id not found", null);

    let updateData = {
      $set: { ...user, updated_at: new Date() },
    };

    if (req?.file) {
      updateData.$set.user_pic = req.file.filename;
    }

    const updatedUser = await userSch.findByIdAndUpdate( userId, updateData, { new: true } );
    return otherHelper.sendResponse(res, httpStatus.OK, true, updatedUser, null, 'user update success!', null);
  } catch (err) {
    next(err);
  }
};
// User List Api Code End

userController.validLoginResponse = async (req, user, next) => {
  try {
    // let accesses = await accessSch.find({ role_id: user.roles, is_active: true }, { access_type: 1, _id: 0 });
    let routes = [];
    // if (accesses && accesses.length) {
    //   const access = accesses.map((a) => a.access_type).reduce((acc, curr) => [...curr, ...acc]);
    //   const routers = await moduleSch.find({ 'path._id': access }, { 'path.admin_routes': 1, 'path.access_type': 1 });
    //   for (let i = 0; i < routers.length; i++) {
    //     for (let j = 0; j < routers[i].path.length; j++) {
    //       routes.push(routers[i].path[j]);
    //     }
    //   }
    // }
    
    // const secretOrKey = await getSetting('auth', 'token', 'secret_key');
    const secretOrKey = process.env.JWTSecret;
    
    var tokenExpireTime = await getSetting('auth', 'token', 'expiry_time');
    tokenExpireTime = Number.parseInt(tokenExpireTime);
    // Create JWT payload

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.role,
    };
    // Sign Token
    let token = await jwt.sign(payload, secretOrKey, {
      expiresIn: "5d",
    });
    loginLogs.addloginlog(req, token, next);
    token = `${token}`;
    return { token, payload };
  } catch (err) {
    next(err);
  }
};

userController.Login = async (req, res, next) => {
  try {
    let errors = {};
    const password = req.body.password;
    let username = req.body.username.trim();
    const user = await userSch.findOne({ name: username });
    if (!user) {
      errors.username = "User not found";
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, errors, errors.username, null);
    }

    if (!user.is_active) {
      errors.inactive = "Please Contact Admin to reactivate your account";
      return otherHelper.sendResponse(res, httpStatus.NOT_ACCEPTABLE, false, null, errors, errors.inactive, null);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.password = "Password incorrect";
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, errors, errors.password, null);
    }
    let rolePermissions = [];
    let user_img = "";

    if (user.role) {
      rolePermissions = await roleAccessModel.find({ role_id: user.role }).select("permissions module_name");
    }
    if (user) {
      user_img = await userSch.findOne({ _id: user.id }).select("user_pic");
    }
    const { token, payload } = await userController.validLoginResponse(req, user, next);
    payload.rolePermissions = rolePermissions;
    payload.user_img = user_img;
    return otherHelper.sendResponse(res, httpStatus.OK, true, payload, null, "Login Successful", token);
  } catch (err) {
    console.error("Error in Login API:", err);
    return next(err);
  }
};

userController.GetProfile = async (req, res, next) => {
  try {
    let populate = [{ path: 'role', select: '_id role_title' }];
    const userProfile = await userSch.findById(req.user.id, 'user_pic name email  role').populate(populate);
    return otherHelper.sendResponse(res, httpStatus.OK, true, userProfile, null, null, null);
  } catch (err) {
    next(err);
  }
};

userController.postProfile = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = req.file;
    }
    const { name, date_of_birth, bio, description, image, phone, location, is_two_fa, company_name, company_location, company_established, company_phone_no } = req.body;
    const updateUser = await userSch.findByIdAndUpdate(req.user.id, { $set: { name, date_of_birth, bio, image, description, phone, location, company_name, company_location, company_established, company_phone_no, updated_at: new Date() } }, { new: true });
    const msg = 'User Update Success';
    const msgfail = 'User not found.';
    if (updateUser) {
      return otherHelper.sendResponse(res, httpStatus.OK, true, { name, date_of_birth, bio, image, description, phone, location, company_name, company_location, company_established, company_phone_no }, null, msg, null);
    } else {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, msgfail, null);
    }
  } catch (err) {
    return next(err);
  }
};

userController.selectMultipleData = async (req, res, next) => {
  try {
    const { user_id, type } = req.body;
    if (type == 'is_active') {
      const Data = await userSch.updateMany({ _id: { $in: user_id } }, [
        {
          $set: {
            is_active: { $not: '$is_active' },
          },
        },
      ]);
      return otherHelper.sendResponse(res, httpStatus.OK, true, Data, null, 'Status Change Success', null);
    } else if (type == 'email_verified') {
      const User = await userSch.updateMany({ _id: { $in: user_id } }, [
        {
          $set: {
            email_verified: { $not: '$email_verified' },
          },
        },
      ]);
      return otherHelper.sendResponse(res, httpStatus.OK, true, User, null, 'Status Change Success', null);
    } else {
      const User = await userSch.updateMany(
        { _id: { $in: user_id } },
        {
          $set: {
            is_deleted: true,
            deleted_at: new Date(),
          },
        },
      );
      return otherHelper.sendResponse(res, httpStatus.OK, true, User, null, 'Multiple Data Delete Success', null);
    }
  } catch (err) {
    next(err);
  }
};

userController.ForgotPassword = async (req, res, next) => {
  try {
    let errors = {};
    let username = req.body.username.trim();
    const user = await userSch.findOne({ name: username });
    console.log('user: ', user);
    if (!user) {
      errors.username = 'User not found';
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, errors, errors.username, null);
    }

    if (!user.is_active) {
      errors.inactive = 'Please Contact Admin to reactivate your account';
      return otherHelper.sendResponse(res, httpStatus.NOT_ACCEPTABLE, false, null, errors, errors.inactive, null);
    }

    let rolePermissions = [];

    if (user.role) {
      rolePermissions = await roleAccessModel.find({ role_id: user.role }).select('permissions module_name');
    }
    let tokenExist = await tokenSchema.findOne({ userId: user._id });
    if (tokenExist) await tokenExist.deleteOne();
    const secretOrKey = process.env.JWTSecret || 'secretkey';
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    let token = await jwt.sign(payload, secretOrKey, {
      expiresIn: process.env.ResetTokenExpiresIn ||'5m',
    });
    console.log('token: ', token);
    await new tokenSchema({
      userId: user._id,
      token: token,
    }).save();
    const resetLink = `${process.env.FRONTEND_URL}/${token}/${user._id}`;

    const htmlContent = `
    <p>Hello HR Team,<p/> 
    <p>You received a request from<b> ${user.name}</b> to reset password</p>
    <p><a href=${resetLink}>Click here to Reset Your Password</a></p>
    `;

    await sendEmail(user.email, 'Password Reset Request', htmlContent);

    payload.rolePermissions = rolePermissions;
    return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, `Password Reset Link For ${payload.name} is sent to email`, token);
  } catch (err) {
    console.error('Error in ForgotPassword API:', err);
    return next(err);
  }
};

userController.VerifyResetPasswordToken = async (req, res, next) => {
  try {
    const { token, user_id } = req.query;

    if (!token || !user_id) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Refresh token and user ID are required.', null);
    }
    const resetRecord = await tokenSchema.findOne({
      userId: user_id,
      token: token,
    });

    if (!resetRecord) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'Invalid reset token.', null);
    }
    const secretOrKey = process.env.JWTSecret || 'secretkey';

    let decodedToken;
    try {
      decodedToken = await jwt.verify(token, secretOrKey); // Verify the JWT refresh token
      console.log('decodedToken: ', decodedToken);
    } catch (err) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'Token Expired', null);
    }

    if (decodedToken.id !== user_id) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'User ID does not match the token.', null);
    }
    return otherHelper.sendResponse(res, httpStatus.OK, true,null, null, 'Token is valid, you can now reset your password.', null);
  } catch (err) {
    console.error('Error in verifyResetPasswordToken:', err);
    return next(err);
  }
};

userController.ResetPassword = async (req, res, next) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'User ID and new password are required.', null);
    }

    const resetRecord = await tokenSchema.findOne({
      userId: user_id,
    });

    if (!resetRecord) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'Invalid reset token.', null);
    }
    const secretOrKey = process.env.JWTSecret || 'secretkey';

    let decoded;
    try {
      decoded = await jwt.verify(resetRecord?.token, secretOrKey);
    } catch (err) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'Token is Expired', null);
    }

    if (decoded.id !== user_id) {
      return otherHelper.sendResponse(res, httpStatus.UNAUTHORIZED, false, null, null, 'User ID does not match the token.', null);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await userSch.findByIdAndUpdate(user_id, { password: hashedPassword }, { new: true });
    if (!updatedUser) {
      return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'User not found.', null);
    }
    await tokenSchema.deleteOne({ _id: resetRecord._id });

    return otherHelper.sendResponse(res, httpStatus.OK, true, null, null, 'Password has been successfully reset.', null);
  } catch (err) {
    console.error('Error in ResetPassword API:', err);
    return next(err);
  }
};

module.exports = userController;