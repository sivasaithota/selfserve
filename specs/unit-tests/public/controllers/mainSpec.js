'use strict';

describe('Controller: AppCtrl', function(){
  var AppCtrl,
    $state,
    $q,
    $rootScope,
    UserService,
    logOutDeferred;

  var appName = 'Rota';
  var tooltips = {
    home: {
      home_btn: 'Home page',
      scenario_settings_btn: 'Scenario settings',
      user_settings_btn: 'User settings',
      tableau_settings_btn: 'Tableau settings',
      slack_settings_btn: 'Slack settings'
    },
    settings: {
      user_settings: {
        option_button: 'User options',
        change_access_scenario: 'Choose scenario that will be available to the current user'
      }
    },
    scenario: {
      open_slack: 'Open slack modal window to choose current chat'
    }
  };

  beforeEach(module('commonApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$state_, _$q_, _$rootScope_, _UserService_) {
    $state = _$state_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    UserService = _UserService_;
    logOutDeferred = $q.defer();
    spyOn(UserService, 'logOut').and.returnValue(logOutDeferred.promise);
    AppCtrl = $controller('AppCtrl', {
      UserService: UserService,
      AppName: appName,
      Tooltips: tooltips
    });
  }));

  describe('initial status of the controller', function() {
    it('check controller', function() {
      expect(AppCtrl).toBeDefined();
    });

    it('check variables', function() {
      expect(AppCtrl.headerName).toEqual(appName);
      expect(AppCtrl.homeTooltips).toEqual(tooltips.home);
      expect(AppCtrl.settingsTooltips).toEqual(tooltips.settings);
      expect(AppCtrl.scenarioTooltips).toEqual(tooltips.scenario);
    });
  });

  describe('check functions', function () {
    it('log out', function() {
      spyOn($state, 'go');
      AppCtrl.logout();
      logOutDeferred.resolve();
      $rootScope.$digest();
      expect(UserService.logOut).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalledWith('login');
    });
  });
});