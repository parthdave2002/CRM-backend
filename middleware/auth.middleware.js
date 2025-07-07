'use strict';
const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status');
const useragent = require('useragent');
const requestIp = require('request-ip');
const loginLogSch = require('../modules/user/loginlogs/loginlogSchema');
const otherHelper = require('../helper/others.helper');
const roleAccessModel = require('../schema/role_accessschema');
// const modulesSch = require('../schema/module_accessschema');

const rolesSch = require('../schema/roleSchema');
const userSch = require('../schema/userSchema');
const authMiddleware = {};
const isEmpty = require('../validation/isEmpty');
const { getSetting } = require('../helper/settings.helper');

authMiddleware.breakcheck = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.log('Bearer token not found in headers');
      return;
    }

    const token = authorizationHeader.split(' ')[1];
    const loginLog = await loginLogSch.findOne({ token: token });
    if (loginLog) {
      console.log('User ID:', loginLog.user_id);
    } else {
      console.log('User not found');
    }

    return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, null, 'You on break ', null);
  } catch (err) {
    return next(err);
  }
};

authMiddleware.retrieveClientInfo = async (req, res, next) => {
  try {
    let platform = req.headers['platform'];
    if (platform) {
      if (platform == 'android' || platform == 'ios') {
      } else {
        platform = 'web';
      }
    } else {
      platform = 'web';
    }
    req.platform = platform;
    next();
  } catch (err) {
    next(err);
  }
};
authMiddleware.authentication = async (req, res, next) => {
  try {
    const expiresIn = '5d';
    const secretOrKey = process.env.JWTSecret;
    // const secretOrKey = await getSetting('auth', 'token', 'secret_key', { expiresIn });
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization || req.headers.token;
    if (token && token.length) {
      token = token.replace('Bearer ', '');
      const decoded = await jwt.verify(token, secretOrKey);
      req.user = decoded;
      let passed = await loginLogSch.find({ token, is_active: true });
      if (passed) {
        return next();
      } else {
        return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, null, 'Session Expired', null);
      }
    }
    return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, token, 'Token not found', null);
  } catch (err) {
    return next(err);
  }
};

authMiddleware.socketauth = async (req, res, next) => {
  try {
    const expiresIn = '2d';
    const secretOrKey = await getSetting('auth', 'token', 'secret_key', { expiresIn });
    // console.log("req.headers.authorization",req.headers.authorization)
    // console.log("req.headers.token",req.headers.token)
    // const token = req.headers.authorization || req.headers.token;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZmYwZWVjMGU4NjU1MTA0MGRlNzc3YSIsIm5hbWUiOiJOaXJhdiIsImVtYWlsIjoibmlyYXZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlcyI6W3siX2lkIjoiNjRmZjBkMGI1Mjc1MGQyZjk0N2Q4NjgzIiwicm9sZV90aXRsZSI6IkNTUiJ9XSwiaWF0IjoxNzAxOTMxNDExLCJleHAiOjE3Mzc5MzE0MTF9.lrZoHz_HOyF6VknwTFVVpKgBIUQsqqG1bPXmORsIupE';
    // console.log("token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",token.length);
    // const token =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjM2IyNDRmOWVmNTEwMTcyY2QxZGNiMCIsIm5hbWUiOiJXYWZ0RW5naW5lIEFkbWluIiwiZW1haWwiOiJhZG1pbkB3YWZ0ZW5naW5lLm9yZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyb2xlcyI6W3siX2lkIjoiNWJmN2FlMzY5NGRiMDUxZjU0ODZmODQ1Iiwicm9sZV90aXRsZSI6IlN1cGVyIEFkbWluIn1dLCJpbWFnZSI6eyJmaWVsZG5hbWUiOiJmaWxlIiwib3JpZ2luYWxuYW1lIjoiYXZhdGFyLTIuanBnIiwiZW5jb2RpbmciOiI3Yml0IiwibWltZXR5cGUiOiJpbWFnZS9qcGVnIiwiZGVzdGluYXRpb24iOiJwdWJsaWMvdXNlci8iLCJmaWxlbmFtZSI6IjQ3NUZDNjFBOTBEM0IzMy1hdmF0YXItMi5qcGciLCJwYXRoIjoicHVibGljXFx1c2VyXFw0NzVGQzYxQTkwRDNCMzMtYXZhdGFyLTIuanBnIiwic2l6ZSI6Mzc1NzV9LCJpYXQiOjE2ODUwODA2MzIsImV4cCI6MTcyMTA4MDYzMn0.DwlQOqDpLdnsGlcZ--i3JSpLxCgYR8Yxiy4HdmMHq_8';

    if (token && token.length) {
      const passed = await loginLogSch.findOne({ token: token, is_active: true });
      //  console.log('findOne result ++++++++++++++++++ ', passed);
      //   console.log("passed>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",passed.user_id);
      if (passed && passed.user_id) {
        req.user_id = passed.user_id;

        return next();
      } else {
        console.log('No user_id found in passed.user_id.');
      }
    } else {
      return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, null, 'Session Expired', null);
    }

    return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, token, 'Token not found', null);
  } catch (err) {
    return next(err);
  }
};

authMiddleware.authenticationForLogout = async (req, res, next) => {
  try {
    const secretOrKey = await getSetting('auth', 'token', 'secret_key');
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization || req.headers.token;
    if (token && token.length) {
      token = token.replace('Bearer ', '');
      const d = await jwt.verify(token, secretOrKey);
      req.user = d;
      return next();
    }
    return otherHelper.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, token, 'token not found', null);
  } catch (err) {
    return next(err);
  }
};

authMiddleware.authorization = (module) => async (req, res, next) => {
  const methodPermissionMap = {
    GET: 'view',
    POST: 'add',
    PUT: 'edit',
    DELETE: 'delete',
  };

  try {
    const role = req.user.roles;
    if(role != "67b388a7d593423df0e24295"){

      const { method } = req;
      const requiredPermission = methodPermissionMap[method];

      if (!role || !role.length)  return otherHelper.sendResponse(res, 401, false, null, null, 'Role Not Found', null);
      const roleAccesses = await roleAccessModel.findOne({ role_id: role, module_name: module }).select('permissions');
      if (!roleAccesses)  return otherHelper.sendResponse(res, 401, false, null, null, 'Module Access Restricted', null);

      const userModulePermission = roleAccesses?.permissions;
      if (!userModulePermission || !userModulePermission[requiredPermission])  return otherHelper.sendResponse(res, 401, false, null, null, 'Module Access Restricted', null);
      
    }

    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.getClientInfo = async (req, res, next) => {
  let info = {};

  let agent = useragent.parse(req.headers['user-agent']);
  // let another = useragent.fromJSON(JSON.stringify(agent));

  info.browser = agent.toAgent().toString();
  info.os = agent.os.toString();
  info.device = agent.device.toString();

  info.ip = requestIp.getClientIp(req);
  // on localhost you'll see 127.0.0.1 if you're using IPv4
  // or ::1, ::ffff:127.0.0.1 if you're using IPv6

  req.client_info = info;
  return next();
};

authMiddleware.isPublicFacebookRegistrationAllow = async (req, res, next) => {
  try {
    let checkis_public_registration = await getSetting('auth', 'auth', 'is_public_registration');
    let checkis_fblogin = await getSetting('auth', 'facebook', 'allow_login');
    if (checkis_public_registration == false || checkis_fblogin == false) {
      return otherHelper.sendResponse(res, HttpStatus.NOT_ACCEPTABLE, false, null, null, 'facebook login function disabled', 'null');
    } else {
      return next();
    }
  } catch (err) {
    next(err);
  }
};

authMiddleware.isPublicGoogleRegistrationAllow = async (req, res, next) => {
  try {
    let checkis_public_registration = await getSetting('auth', 'auth', 'is_public_registration');
    let checkis_googleLogin = await getSetting('auth', 'google', 'allow_login');
    if (checkis_public_registration == false || checkis_googleLogin == false) {
      return otherHelper.sendResponse(res, HttpStatus.NOT_ACCEPTABLE, false, null, null, 'google login function disabled', 'null');
    } else {
      return next();
    }
  } catch (err) {
    next(err);
  }
};
module.exports = authMiddleware;
