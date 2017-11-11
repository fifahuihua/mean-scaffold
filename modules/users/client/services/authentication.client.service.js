(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$window'];

  function Authentication($window) {
    var auth = {
      user: $window.user,
      isLogin: function () {
        return $window.user && $window.user.username;
      }
    };

    return auth;
  }
}());
