'use strict';

angular.module('core').service('Menus', [
  function () {
    this.menus = {};
    var defaultRoles = ['*'];

    var shouldRender = function (user) {
      if (!this.roles || this.roles.length === 0 || this.roles.indexOf('*') !== -1) {
        return true;
      } else {
        if (user.roles && user.roles.length > 0) {
          for (var i = 0; i < user.roles.length; i++) {
            if (this.roles.indexOf(user.roles[i]) !== -1) {
              return !this.permissionCode || (user.permissionCodes && user.permissionCodes.indexOf(this.permissionCode) !== -1);
            }
          }
        }

        return false;
      }
    };

    this.getMenu = function (menuId) {
      return this.menus[menuId];
    };

    this.addMenu = function (menuId, options) {
      if (!options) {
        return null;
      }

      this.menus[menuId] = {
        roles: options.roles || defaultRoles,
        permissionCode: options.permissionCode || '',
        items: options.items || [],
        shouldRender: shouldRender
      };

      return this.menus[menuId];
    };

    this.removeMenu = function (menuId) {
      delete this.menus[menuId];
    };

    this.addMenuItem = function (menuId, options) {
      if (!menuId || !this.menus[menuId] || !options || !options.state) {
        return null;
      }

      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: options.roles || defaultRoles,
        permissionCode: options.permissionCode || '',
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            this.addSubMenuItem(menuId, options.state, options.items[i]);
          }
        }
      }

      return this.menus[menuId];
    };

    this.addSubMenuItem = function (menuId, parentItemState, options) {
      if (!options) {
        return null;
      }

      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: options.roles || defaultRoles,
            permissionCode: options.permissionCode || '',
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      return this.menus[menuId];
    };

    this.removeMenuItem = function (menuId, menuItemState) {
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      return this.menus[menuId];
    };

    this.removeSubMenuItem = function (menuId, submenuItemState) {
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
            if (this.menus[menuId].items[itemIndex].items.hasOwnProperty(subitemIndex)) {
              if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
                this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
              }
            }
          }
        }
      }

      return this.menus[menuId];
    };

    this.addMenu('topbar', {
      roles: ['user']
    });
  }
]);
