(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('Inactive', Inactive);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  Inactive.$inject = ['$rootScope', 'ScenarioSetService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function Inactive($rootScope, ScenarioSetService) {
    // represent the binding scope
    var vm = this;
    if (!$rootScope.appName) ScenarioSetService.getAppDetails()
  }
})();
