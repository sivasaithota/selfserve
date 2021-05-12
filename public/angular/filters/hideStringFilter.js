(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FILTER() METHOD
  angular
    .module('commonApp')
    .filter('hideStringFilter', hideStringFilter);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  hideStringFilter.$inject = ['$filter', 'DataService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function hideStringFilter ($filter, DataService) {
    return function (item) {
      var defaultView = 'XXXX-XXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      return item ? DataService.hideToken(item) : defaultView;
    };
  }
})();