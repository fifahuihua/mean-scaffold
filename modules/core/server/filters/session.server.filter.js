/**
 * Created by Antony on 11/10/2017.
 */

var Util = require('../utils/core.server.util');
var Config = require('../../../../config/config');

var _ = require('lodash');

var URLS_NOT_REQUIRE_LOGIN = [
  '/',
  '/api/auth/*',
  '/user/signin',
  '/api/auth/signup',
  '/user/logout'
];

var RESPONSE_TYPE_JSON = "JSON";
var RESPONSE_JSON_CONTENT = { message: 'unauthorized' };
var RESPONSE_TYPE_REDIRECT_INVALID_LOGIN_PAGE = 'REDIRECT_INVALID_LOGIN_PAGE';
var INVALID_LOGIN_URL = '/#!/forbidden';
var UNKNOWN_URL = '/#!/not-found';

// the mapping like as : url -> { authCode: 'XXXX', responseType: 'JSON'}
var URL_PERMISSION_MAPPING = {
  '/api/admin/changepassword': { permissionType: 'FREE', authCode: 'USER_ADMIN', responseType: RESPONSE_TYPE_JSON },
  '/api/admin/users/update': { permissionType: 'FREE', authCode: 'USER_ADMIN', responseType: RESPONSE_TYPE_JSON },
  '/api/admin/users/profile': { permissionType: 'FREE', authCode: 'USER_ADMIN', responseType: RESPONSE_TYPE_JSON }
};

module.exports = function (req, res, next) {
  var currentPath = req.path;

  if (Util.isPublicResource(currentPath)) {
    next();
  } else {
    if (isUrlNotRequireLogin(currentPath)) {
      next();
    } else {
      Util.checkAndRefreshSession(req, res);
      var permission = getPermission(currentPath);
      if (permission) {
        if (checkPermission(req, permission)) {
          next();
        } else if (permission.responseType === RESPONSE_TYPE_JSON) {
          res.status(403).send(RESPONSE_JSON_CONTENT);
        } else {
          res.redirect(INVALID_LOGIN_URL);
        }
      } else {
        if (_.startsWith(currentPath, '/api')
          || _.startsWith(currentPath, '/client_modules')
          || _.startsWith(currentPath, '/core')
          || _.startsWith(currentPath, '/favicon.ico')
          || _.startsWith(currentPath, '/#!')
        ) {
          res.redirect(UNKNOWN_URL);
        } else {
          res.redirect('/#!' + currentPath);
        }
      }
    }
  }
};

var checkPermission = function (req, permission) {
  if (!req.isAuthenticated()) {
    return false;
  }

  if (permission.permissionType === 'FREE') {
    return req.user.userType === 'PAID' || req.user.userType === 'FREE';
  }

  if (permission.permissionType === 'PAID') {
    // return Util.hasPermission(req.user.paidProducts, permission.authCode);
    return true;
  }

  return false;
};

var getPermission = function (currentPath) {
  if (URL_PERMISSION_MAPPING[currentPath]) {
    return URL_PERMISSION_MAPPING[currentPath];
  }
  Object.keys(URL_PERMISSION_MAPPING).forEach(function (url) {
    var pathRegex = "^" + url.replace(/\*/g, '(.*)') + '$';
    var pattern = new RegExp(pathRegex, "i");
    if (pattern.test(currentPath)) {
      return URL_PERMISSION_MAPPING[url];
    }
  });

  return null;
};

var isUrlNotRequireLogin = function (currentPath) {
  for (var i = 0; i < URLS_NOT_REQUIRE_LOGIN.length; i++) {
    var pathRegex = "^" + URLS_NOT_REQUIRE_LOGIN[i].replace(/\*/g, '(.*)') + '$';
    var pattern = new RegExp(pathRegex, "i");
    if (pattern.test(currentPath)) {
      return true;
    }
  }

  return false;
};

