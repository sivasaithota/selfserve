(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridMain')
    .filter('editOptionFilter', editOptionFilter)
    .filter('updateOptionFilter', updateOptionFilter);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  editOptionFilter.$inject = [];
  updateOptionFilter.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function editOptionFilter() {
    return function (options) {
      var resultString = [];
      angular.forEach(options, function(option) {
        _.forIn(option, function(value) {
          if (value) resultString.push(value);
        });
      });
      return _.uniq(resultString);
    };
  }

  function updateOptionFilter() {
    return function (options) {
      return _.map(options, function (val) {
        return '\'' + val + '\'';
      });
    };
  }
})();
