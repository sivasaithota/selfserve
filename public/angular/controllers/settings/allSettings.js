(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('allSettings', allSettings);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  allSettings.$inject = ['appSettings'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function allSettings (appSettings) {
    // represent the binding scope
    var vm = this;
    vm.appSettings = appSettings;
  }
})();
