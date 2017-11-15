'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', '$http', '$window', 'Authentication', 'Menus',
  function ($scope, $state, $http, $window, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    $scope.isFailToLogin = false;
    $scope.credentials = {};

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Get the account menu
    $scope.accountMenu = Menus.getMenu('account').items[0];

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    $scope.redirectToSignUpPage = function () {
      $state.go('authentication.signup');
    };

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.signin = function(isValid) {
      $scope.error = null;
      $scope.isFailToLogin = false;

      if (!isValid) {
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $window.user = response;
        $scope.isFailToLogin = false;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
        $scope.isFailToLogin = true;

        setTimeout(function () {
          $scope.$apply(function () {
            $scope.isFailToLogin = false;
          });
        }, 3000);
      });
    };
  }
]);
