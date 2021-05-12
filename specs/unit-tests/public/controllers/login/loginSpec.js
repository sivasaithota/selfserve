'use strict';

describe('Controller: LoginCtrl', function(){
  var LoginCtrl,
    UserService,
    logInDeferred,
    $controller,
    $q,
    $rootScope,
    $state;

  beforeEach(module('commonApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _UserService_, _$state_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    UserService = _UserService_;
    logInDeferred = $q.defer();
    spyOn(UserService, 'logIn').and.returnValue(logInDeferred.promise);
    LoginCtrl = $controller('LoginCtrl', {
      UserService: UserService
    });
  }));

  describe('initial status of the controller', function() {
    it('check controller', function() {
      expect(LoginCtrl).toBeDefined();
    });

    it('check variables', function() {
      expect(LoginCtrl.isLoginError).toBe(false);
      expect(LoginCtrl.isResetPass).toBe(false);
    });
  });

  describe('check functions', function () {
    it('should not call service if username or password is missed', function () {
      LoginCtrl.logIn('username');
      expect(LoginCtrl.isLoginError).toBe(false);
      expect(UserService.logIn).not.toHaveBeenCalled();
      LoginCtrl.logIn();
      expect(LoginCtrl.isLoginError).toBe(false);
      expect(UserService.logIn).not.toHaveBeenCalled();
    });

    it('should call service and go tho the home page', function () {
      spyOn($state, 'go');
      LoginCtrl.logIn('username', 123);
      expect(LoginCtrl.isLoginError).toBe(false);
      logInDeferred.resolve();
      $rootScope.$digest();
      expect(UserService.logIn).toHaveBeenCalled();
      expect(UserService.logIn).toHaveBeenCalledWith('username', 123);
      expect($state.go).toHaveBeenCalledWith('base.WSProjects.list');
    });
  });
});