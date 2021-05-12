(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridMain')
    .provider('GridProvider', GridProvider);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  GridProvider.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function GridProvider() {
    var defaults = {
      rowsNumber: 14,
      defaultHeight: 46,
      watchCount: 0,
      colModel: [],
      columnTypes: [],
      displayList: [],
      tablenameServer: ''
    };
    this.$get = function () {
      return {
        getDefaults: function (newDefaults) {
          return angular.extend({}, defaults, newDefaults);
        }
      };
    };
  }
})();
