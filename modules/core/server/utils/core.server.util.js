/**
 * Created by ZHANGAN2 on 11/10/2017.
 */

var Config = require('../../../../config/config');

var PUBLIC_RESOURCE_FILE_TYPES = [
  '.htm', '.html',                                // static html page
  '.js',                                          // javascript file
  '.css',                                         // style
  '.png', '.jpg', '.gif',                         // image
  '.svg', '.eot', '.woff', '.woff2', '.ttf',      // font
  '.pdf', '.json'                                          // PDF file
];

var SESSION_ID_COOKIE_KEY = 'MEAN_SCAFFOLD_ID';
var SESSION_ID_EXPIRATION_AGE = 3 * 60 * 60 * 1000; // 3 hours.

var isPublicResource = function(currentPath) {
  for (var i = 0; i < PUBLIC_RESOURCE_FILE_TYPES.length; i++) {
    var fileType = PUBLIC_RESOURCE_FILE_TYPES[i];
    if (currentPath.endsWith(fileType)) {
      return true;
    }
  }

  return false;
};

var getSessionId = function (req) {
  return req.cookies[SESSION_ID_COOKIE_KEY];
};

var clearSessionId = function(res) {
  if (!Config.sessionCookie.maxAge) {
    res.cookie(SESSION_ID_COOKIE_KEY, null, { maxAge: 0 });
  }
};

var resetSessionIdExpiredTime = function(req, res, meanScaffoldId) {
  if (!Config.sessionCookie.maxAge && meanScaffoldId && meanScaffoldId !== '') {
    res.cookie(SESSION_ID_COOKIE_KEY, meanScaffoldId, { maxAge: SESSION_ID_EXPIRATION_AGE });
  }
};

var checkAndRefreshSession = function (req, res) {
  if (Config.sessionCookie.maxAge) {
    res.cookie(Config.sessionKey, req.cookies[Config.sessionKey], { maxAge: Config.sessionCookie.maxAge });
    return;
  }

  if (req.user) {
    if (!req.user.sessionId || req.user.sessionId !== getSessionId(req)) {
      clearSessionId(res);
      req.logout();
    } else {
      resetSessionIdExpiredTime(req, res, req.user.sessionId);
    }
  } else if (getSessionId(req)) {
    clearSessionId(res);
  }
};

var hasPermission = function (userPaidProducts, authCode) {
  return true; // TODO: need to finish this function of permission checking.
};

exports.isPublicResource = isPublicResource;
exports.hasPermission = hasPermission;
exports.checkAndRefreshSession = checkAndRefreshSession;
