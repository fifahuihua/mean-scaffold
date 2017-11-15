/**
 * Created by Antony on 11/10/2017.
 */

var Util = require('../utils/core.server.util');
var Config = require('../../../../config/config');

var _ = require('lodash');

var URLS_NOT_REQUIRE_LOGIN = [
  '/',
  '/user/signin',
  '/user/logout'
];

var RESPONSE_TYPE_JSON = "JSON";
var RESPONSE_JSON_CONTENT = { message: 'unauthorized' };
var INVALID_LOGIN_URL = '/#!/forbidden';
var UNKNOWN_URL = '/#!/not-found';

var URL_PERMISSION_MAPPING = {
  '/api/articles': { permissionType: 'FREE'},
  '/api/users': { permissionType: 'FREE'},
  '/api/users/*': { permissionType: 'FREE'},
  '/api/auth/test': { permissionType: 'AUTH', authCode: 'TEST_AUTH'}
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
      if (permission && checkPermission(req, permission)) {
        next();
      } else {
        console.log("currentPath: " + currentPath);
        return req.method === 'GET' ? res.redirect(UNKNOWN_URL) : res.status(403).send(RESPONSE_JSON_CONTENT);
      }
    }
  }
};

var checkPermission = function (req, permission) {
  if (!req.isAuthenticated()) {
    return false;
  }

  if (permission.permissionType === 'FREE') {
    return true;
  }

  if (permission.permissionType === 'PAID') {
    return Util.hasPermission(req.user.paidProducts, permission.authCode);
  }

  return false;
};

var getPermission = function (currentPath) {
  var permission = URL_PERMISSION_MAPPING[currentPath];

  if (permission) {
    return permission;
  }

  Object.keys(URL_PERMISSION_MAPPING).forEach(function (url) {
    var pathRegex = "^" + url.replace(/\*/g, '(.*)') + '$';
    var pattern = new RegExp(pathRegex, "i");
    if (pattern.test(currentPath)) {
      permission = URL_PERMISSION_MAPPING[url];
    }
  });

  return permission;
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

