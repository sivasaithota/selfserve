(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('projectCtrl', projectCtrl);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
    projectCtrl.$inject = ['allScenarios', '$scope', '$timeout', '$mdDialog', '$templateCache', 'UserService',
        'ScenarioService', 'dragulaService', '$state', 'LockService', 'DataService', '$filter',
        'ArchiveService', '$rootScope', 'NavigateService', 'tMessages'];
    // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
    function projectCtrl(allScenarios, $scope, $timeout, $mdDialog, $templateCache, UserService, ScenarioService,
                         dragulaService, $state, LockService, DataService, $filter, ArchiveService, $rootScope,
                         NavigateService, tMessages) {
    // represent the binding scope
    var vm = this;
    vm.progressBar = $rootScope.progressBar;
    vm.checkAccess = UserService.checkAccess;
    vm.bannerImages = _.range(1, 4);
    vm.projects = $filter('orderBy')(allScenarios.scenarios, 'order_id');
    vm.templates = allScenarios.templates;
    vm.filter = {};
    vm.selectedProjects = [];
    vm.activeObj = {
      showActive: true,
      showArchived: true
    };
    vm.scenarioMessages = tMessages.getScenario();

    // CALL SERVICE METHOD TO Drag handles float your cruise
    dragulaService.options($scope, 'scenario-bag', {
      moves: function (el, container, handle) {
        return handle.className === 'handle';
      }
    });

    $scope.$on('scenario-bag.drop', function (e, el) {
      if ($scope.main.currentUser.functions.Sc_Edit) {
        vm.progressBar.start();
        $timeout(function () {
          angular.forEach(vm.projects, function (value, key) {
            var newIndex = key + 1;
            if (value.order_id !== newIndex) {
              ScenarioService.changeOrderId(value.id, newIndex)
                .then(function () {
                  vm.progressBar.complete();
                }, function () {
                  vm.progressBar.reset();
                });
            }
          });
        }, 100);
      }
    });

    ScenarioService.getTags()
      .then(function (data) {
        vm.tags = data;
      });

    // defining the functions
    vm.createScenario = createScenario;
    vm.viewProject = NavigateService.viewProject;
    vm.editProject = editProject;
    vm.copyProject = copyProject;
    vm.closeWin = closeWin;
    vm.lockScenario = lockScenario;
    vm.unlockScenario = unlockScenario;
    vm.openWindow = openWindow;
    vm.selectForDeleting = selectForDeleting;
    vm.toggleForDeleting = toggleForDeleting;
    vm.closeFilter = closeFilter;
    vm.clearFilters = clearFilters;
    vm.openFilter = openFilter;
    vm.showView = showView;
    vm.disableArchive = disableArchive;

    // CREATE NEW SCENARIO
    function createScenario(ev) {
      // SHOW CREATE DIALOG TEMPLATE
      $mdDialog
        .show({
          controller: function ($scope, ScenarioService, DataService, tMessages, tooltip, templates) {
            $scope.templates = templates;
            $scope.tooltip = tooltip;
            $scope.showTag = false;
            $scope.tags = vm.tags;
            $scope.scenarioPattern = /^[a-zA-Z0-9\ ._-]*$/;
            $scope.scenarioMessages = tMessages.getScenario();
            $scope.addProject = function () {
              var newScenario = {
                name: $scope.pname,
                templateId: $scope.templateId || 1,
                tag: $scope.tag || 'untagged'
              };
              // CALL SERVICE METHOD TO CREATE SCENARIO
              ScenarioService.createScenario(newScenario).then(function (project) {
                $mdDialog.hide(project);
              }, function () {
                $mdDialog.cancel();
              });
            };
            $scope.cancel = function () {
              $mdDialog.cancel();
            };
            // CREATE NEW TAG FOR SCENARIO
            $scope.saveTag = function () {
              if (!_.filter($scope.tags, {tag_name: $scope.newTag}).length) {
                ScenarioService.saveTag($scope.newTag)
                  .then(function (data) {
                    $scope.tags.push(data.result);
                    DataService.success($scope.scenarioMessages.tagSaved);
                  });
              } else {
                DataService.error($scope.scenarioMessages.tagExists);
              }
              $scope.newTag = "";
              $scope.showTag = false;
            };
          },
          clickOutsideToClose: true,
          template: $templateCache.get('project/create_project.ejs'),
          targetEvent: ev,
          parent: angular.element(document.querySelector('#create_content')),
          locals: {
            tooltip: $scope.main.homeTooltips.create_tag,
            templates: vm.templates
          }
        })
        .then(function (answer) {
          if (answer) {
            vm.projects.push({
              id: answer.id,
              name: answer.name,
              updated_at: answer.updated_at,
              updated_by: answer.updated_by,
              tag_id: answer.tag,
              edit: false,
              locking: {},
              status: answer.status
            });
          }
        }, function () {
        });
    }

    // Editing the scenario
    function editProject (project) {
      project.isEdited = false;
      project.process = 'editing';

      ScenarioService.editScenario(project);
    }

    // editScenario event handler called after finishing scenario editing in the backend
    $rootScope.$on('editScenario', function (ev, data) {
      // Updating the edited scenario
      var editedScenario = _.find(vm.projects, { id: data.scenario.id });
      editedScenario.process = null;

      if (!data.error) Object.assign(editedScenario, data.scenario);
    });

    // Copy scenario menu option click handler
    function copyProject (project) {
      project.isCopied = false;

      // A placeholder for the new scenario until it is copied in the backend
      var placeholder = {
        id: project.id,
        placeholderID: Math.floor(Math.random() * 1000000), // random ID for tracking the placeholder
        name: project.newName,
        originalName: project.name,
        status: 'active',
        process: 'copying'
      };
      vm.projects.push(placeholder);

      // Sending data to copy the scenario to the backend
      ScenarioService.copyScenario(placeholder);
    }

    // addScenario event handler called after finishing scenario copying in the backend
    $rootScope.$on('addScenario', function (ev, data) {
      // Removing the placeholder
      _.remove(vm.projects, function (project) {
        return project.placeholderID === data.placeholderID;
      });

      // Adding the new scenario
      if (!data.error) {
        data.scenario.locking = {};
        vm.projects.push(data.scenario);
      }
    });

    function closeWin (project, key) {
      project[key] = false;
    }

    function lockScenario (id, project) {
      vm.progressBar.start();
      LockService.lockScenario(id)
        .then(function (data) {
          project['locking'].created_by = $scope.main.currentUser.username;
          vm.progressBar.complete();
          DataService.success(data);
        }, function () {
          vm.progressBar.reset();
        });
    }

    function unlockScenario (id, project) {
      vm.progressBar.start();
      LockService.removeScenarioLock(id)
        .then(function (data) {
          project['locking'] = {};
          vm.progressBar.complete();
          DataService.success(data);
        }, function () {
          vm.progressBar.reset();
        });
    }

    function openWindow (project, flag) {
      _.map(vm.projects, function (scenario) {
        scenario['isEdited'] = false;
        scenario['isCopied'] = false;
        scenario['isArchived'] = false;
        scenario['isDeleted'] = false;
      });
      project[flag] = true;
    }

    function selectForDeleting (item, list) {
      return list.indexOf(item) > -1;
    }

    function toggleForDeleting (item, list) {
      var idx = list.findIndex(function (i) {
        return i.id === item.id
      });
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(item);
      }
    }

    // Child confirm-dialog directive 'dialogCancel' event handler
    $scope.$on('dialogCancel', function(event, item, title) {
      // The dialog is called for confirming deleting and archiving
      var flag = title.includes('delete') ? 'isDeleted' : 'isArchived';
      item ? item[flag] = false : vm[flag] = false;
    });

    // Child confirm-dialog directive 'dialogConfirm' event handler
    $scope.$on('dialogConfirm', function(event, item, title) {
      // The dialog is called for confirming deleting and archiving
      var process = title.includes('delete') ? 'deleting' : 'archiving',
          flag = process === 'deleting' ? 'isDeleted' : 'isArchived';

      var scenarioIDs = [],
          scenarioNames = [];

      // When deleting/archiving a single scenario using the scenario menu
      if (item) {
        item[flag] = false;
        item.process = process;
        scenarioIDs.push(item.id);
        scenarioNames.push(item.name);
      } else {
        // When deleting/archiving selected scenarios using the filter widget
        vm[flag] = false;
        vm.selectedProjects.forEach(function (project) {
          project.process = process;
          scenarioIDs.push(project.id);
          scenarioNames.push(project.name);
        });
      }

      // Sending data for processing to the server
      process === 'deleting' ?
          ScenarioService.deleteScenario(scenarioIDs, scenarioNames) :
          ArchiveService.archiveScenario(scenarioIDs, scenarioNames);
    });

    // deleteScenarios event handler called after finishing scenarios deleting in the backend
    $rootScope.$on('deleteScenarios', function (ev, data) {
      data.scenarioIDs.forEach(function (scenarioID) {
        if (data.error) {
          // Updating the scenarios in case of error
          _.find(vm.projects, { id: scenarioID }).process = null
        } else {
          // removing the deleted scenarios in other case
          _.remove(vm.projects, function (project) {
            return project.id === scenarioID;
          });
        }
      });
    });

    // markArchivedScenarios event handler called after finishing scenarios archiving in the backend
    $rootScope.$on('markArchivedScenarios', function (ev, data) {
      vm.selectedProjects = [];

      // Marking each archived scenario
      data.scenarios.forEach(function (scenario) {
        var scenarioToMark = _.find(vm.projects, { id: scenario.id });
        scenarioToMark.process = null;
        if (!data.error) Object.assign(scenarioToMark, scenario);
      });
    });

    function closeFilter () {
      vm.isFilterOpen = false;
      clearFilters();
    }

    function clearFilters () {
      vm.filter.name = null;
      vm.filter.tag = null;
      vm.filter.reverseVal = false;
      vm.filter.propertyName = '';
      vm.activeObj.showActive = true;
      vm.activeObj.showArchived = true;
    }

    function openFilter () {
      vm.isFilterOpen = true;
      vm.filter.reverseVal = false;
      vm.filter.propertyName = 'created_at';
    }

    function showView (project) {
      return project.locking &&
             project.locking.created_by &&
             project.locking.created_by !== $scope.main.currentUser.username &&
             $scope.main.currentUser.functions.Sc_Edit;
    }

    function disableArchive (projects) {
      return !projects.length || projects.filter(function (i) {
        return i.status === 'archived'
      }).length;
    }
  }
})();
