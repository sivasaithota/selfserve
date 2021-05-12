(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FILTER() METHOD
  angular
    .module('commonApp')
    .filter('secondsToDateTime', secondsToDateTime);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  secondsToDateTime.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function secondsToDateTime () {
    return function (seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds);
    };
  }
})();