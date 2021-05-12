(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('LoginCtrl', LoginCtrl);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  LoginCtrl.$inject = ['UserService', 'usSpinnerService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function LoginCtrl(UserService, usSpinnerService) {
    // represent the binding scope
    var vm = this;
    vm.isLoginError = true;
    // vm.loginErrorMsg = "test"
    vm.isLoginError = true;
    vm.loginErrorMsg = "User details not found with the user name. You are being logged out.";
    usSpinnerService.spin('spinner-1');
    setTimeout(function (){
      window.location.reload();
    }, 3000);
  }
})();
