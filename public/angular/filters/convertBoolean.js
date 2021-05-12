(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FILTER() METHOD
  angular
    .module('commonApp')
    .filter('convertBoolean', convertBoolean);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  convertBoolean.$inject = ['$filter', 'DataService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function convertBoolean () {
    return function (item) {
      return item ? 'Yes' : 'No';
    };
  }
})();
