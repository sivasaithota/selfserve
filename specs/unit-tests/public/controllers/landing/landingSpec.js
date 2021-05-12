'use strict';

describe('Controller: projectCtrl', function(){
  var projectCtrl,
    $rootScope,
    scope,
    $q,
    $state,
    ScenarioService,
    editScenarioDeferred,
    $mdDialog,
    $templateCache;

  var allScenarios = [{
    list: [{
      id: 8,
      name: 'Darya',
      tag: 'undefined',
      updatedAt: '2016-12-28T08:21:09.320Z'
    }],
    showTag: false,
    tags: ['all', 'undefined']
  }];

  beforeEach(module('commonApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, _$q_, _$state_, _ScenarioService_, _$mdDialog_, _$templateCache_) {
    $rootScope = _$rootScope_;
    scope = _$rootScope_.$new();
    $q = _$q_;
    $state = _$state_;
    $mdDialog = _$mdDialog_;
    $templateCache = _$templateCache_;
    ScenarioService = _ScenarioService_;
    editScenarioDeferred = $q.defer();
    spyOn(ScenarioService, 'editScenario').and.returnValue(editScenarioDeferred.promise);
    projectCtrl = $controller('projectCtrl', {
      ScenarioService: ScenarioService,
      $scope: scope,
      allScenarios: allScenarios
    });
  }));

  describe('initial status of the controller', function() {
    it('check controller', function() {
      expect(projectCtrl).toBeDefined();
    });

    it('check variables', function() {
      expect(projectCtrl.activeTag).toBe('all');
      expect(projectCtrl.bannerImages).toEqual([1, 2, 3]);
      expect(projectCtrl.projects).toEqual(allScenarios.list);
      expect(projectCtrl.tags).toEqual(allScenarios.tags);
      expect(projectCtrl.showTag).toBe(allScenarios.showTag);
    });
  });

  describe('check functions', function () {
    it('should create project', function() {
      scope.main = {
        homeTooltips: {
          create_tag: 'Organize scenarios using Tags'
        }
      };
      var deferred = $q.defer();
      $mdDialog.show = jasmine.createSpy().and.callFake(function() {
        return deferred.promise;
      });
      projectCtrl.createScenario($.event);
      $rootScope.$digest();
      expect($mdDialog.show).toHaveBeenCalled();
      expect($mdDialog.show).toHaveBeenCalledWith({
        controller: jasmine.any(Function),
        clickOutsideToClose: true,
        template: $templateCache.get('project/create_project.ejs'),
        targetEvent: $.event,
        locals: {
          tooltip: scope.main.homeTooltips.create_tag
        }
      });
    });
  });
});