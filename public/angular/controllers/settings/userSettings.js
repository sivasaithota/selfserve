(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('userSettings', userSettings);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  userSettings.$inject = ["$scope", "userRoles", "$mdDialog", "UserSetService", "ScenarioService", "$templateCache",
    "DataService", "tMessages", "$rootScope", "FileSaver", "$q", "TableauService", "PowerBiService", "UserService"];

  // A NAMED FUNCTION DEFINITION AND THE RELEVANT MODULE METHOD
  function userSettings($scope, userRoles, $mdDialog, UserSetService, ScenarioService, $templateCache,
                        DataService, tMessages, $rootScope, FileSaver, $q, TableauService, PowerBiService, UserService) {
    // represent the binding scope
    var vm = this;
    vm.user = '';
    vm.userRole = '';
    vm.userList = [];

    // vm.users = usersList;
    vm.roles = userRoles.list;
    vm.adminOptions = userRoles.list.filter(role => (role.role === 'Consultant'));
    vm.viewerOptions = userRoles.list.filter(role => (role.role !== 'Admin' && role.role !== 'Consultant' && role.role !== 'Moderator'));
    vm.developerEditOptions = userRoles.list.filter(role => (role.role === 'Admin' || role.role === 'Consultant' || role.role === 'Moderator'));
    vm.rolePermissions = userRoles.permissions;

    if ($scope.main.currentUser.functions.User_View) {
      UserSetService.usersList()
        .then(function (data) {
          vm.users = data;
          vm.users.forEach(function (user) {
            managableAccess(user);
          });
        });
      UserSetService.allUsersList()
        .then(function (data) {
          vm.userList = data;
        });
    }

    var getScenarios,
      getTables,
      getTableauReports,
      getPowerBIReports,
      currentUserId = UserService.getUserInfo().id;

    getScenarios = ScenarioService.getAllScenarios();

    getTables = ScenarioService.getAllTables(currentUserId);

    if ($scope.settings.appSettings.inputVizType === 'tableau' || $scope.settings.appSettings.outputVizType === 'tableau') {
      getTableauReports = TableauService.getAllTableau({
        userId: currentUserId,
      });
    }

    if ($scope.settings.appSettings.inputVizType === 'powerbi' || $scope.settings.appSettings.outputVizType === 'powerbi') {
      getPowerBIReports = PowerBiService.getReports({
        userId: currentUserId,
      });
    }

    $q.all([getScenarios, getTables, getTableauReports, getPowerBIReports]).then(function(result) {
      $scope.allAccessData = result;
    });

    // defining if user has managable scenario/table access basing on the user role
    function managableAccess(user) {
      user.managableScenarioAccess = user.role !== 'Consultant';
      user.managableTableAccess = user.role !== 'Consultant';
      user.hasEditAccess = ($scope.main.currentUser.role === 'Moderator'
                          && user.role !== 'Admin'
                          && user.role !== 'Consultant'
                          && user.role !== 'Moderator') || $scope.main.currentUser.role !== 'Moderator';
    }

    // defining the functions
    vm.addUser = addUser;
    vm.findUser = findUser;
    vm.deleteUser = deleteUser;
    vm.editUser = editUser;
    vm.resetData = resetData;
    vm.openAccessManager = openAccessManager;
    vm.openExportPopup = openExportPopup;
    vm.openImportPopup = openImportPopup;
    vm.filterItems = filterItems;

    // clean form for user creation
    function resetData() {
      vm.addUserForm.$setPristine();
      vm.user = '';
      vm.userRole = '';
    }

    function addUser(userAdd) {
      if (userAdd) {
        if (vm.addUserForm.$invalid) {
          var message;
          if (vm.addUserForm.$error.required) {
            message = tMessages.getSettings().userField;
          }
          if (vm.addUserForm.$error.email) {
            message = tMessages.getSettings().invalidEmail;
          }
          DataService.error(message);
        } else {
          vm.user.role = vm.userRole;
          var updateEnframe = true;
          UserSetService.addUser(vm.user, updateEnframe).then(function (data) {
            data.result.id = data.result.userId;
            data.result.table_id = [];
            data.result.scenario_id = [];
            data.result.username = vm.user.email;
            data.result.email = vm.user.email;
            data.result.role = vm.user.role;

            managableAccess(data.result);
            vm.users && vm.users.push(data.result);
            DataService.success(data.message);
            resetData();
          });
        }
      }
    }

    function findUser(user, userView) {
      if (userView) {
        UserSetService.getUserByEmail(user.email).then(function (data) {
          vm.user.enframerole = data.role.name;
        });
      }
    }

    function deleteUser(ev, index, user, userDelete) {
      if (userDelete) {
        if (user.username !== $rootScope.currentUser.username) {
          var confirm = $mdDialog.confirm()
            .title(tMessages.getSettings().headerUserDelete + user.username + '?')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
          $mdDialog.show(confirm).then(function ($ev) {
            UserSetService.deleteUser(user.id).then(function (data) {
              vm.users.splice(index, 1);
            });
          }, function () {});
        }
      }
    }

    function editUser(user, userEdit) {
      if (userEdit) {
        UserSetService.editUser({
            id: user.id,
            role: user.newRole,
            email: user.email,
            updateEnframe: false,
          })
          .then(function () {
            user.role = user.newRole;
            user.editUser = false;
            user.scenario_id.length = 0;
            user.table_id.length = 0;
            user.tableau_id.length = 0;
            user.powerbi_id.length = 0;
            managableAccess(user);
          });
      }
    }

    function openAccessManager (ev, user) {
      $mdDialog.show({
        controller: accessController,
        template: $templateCache.get('settings/manage_access.ejs'),
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          user: user,
          roles: vm.roles,
          appSettings: $scope.settings.appSettings,
          result: $scope.allAccessData,
        }
      });
    }

    function openImportPopup (ev) {
      $mdDialog.show({
        controller: importExportController,
        template: $templateCache.get('settings/manage_import.ejs'),
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      }).then(function (users) {
        vm.users = users;
        vm.users.forEach(function (user) {
          managableAccess(user);
        });
      });
    }

    function openExportPopup (ev) {
      $mdDialog.show({
        controller: importExportController,
        template: $templateCache.get('settings/manage_export.ejs'),
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function filterItems (userInput) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = vm.userList.filter(function(project) {
        return project.username.toLowerCase().includes(normalisedInput) ||
            (project.email && project.email.toLowerCase().includes(normalisedInput));
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }
  }

  function importExportController($scope, $mdDialog, UserSetService, DataService, tMessages, FileSaver) {

    $scope.exportAccess = true;
    $scope.userListPattern = ".json";

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.exportUsersList = function () {
      UserSetService.exportUsers($scope.exportAccess)
        .then(function (json) {
          $mdDialog.cancel();
          var result = new Blob(
            [ JSON.stringify(json) ],
            { type: "data:application/json;charset=utf-8" }
          );
          FileSaver.saveAs(result, "userList.json");
        });
    };

    // upload JSON file with list of user
    $scope.importUsersList = function (file) {
      var reader = new FileReader();
      var parsedJson = {};
      reader.onload = function(e) {
        try {
          parsedJson = JSON.parse(e.target.result);
        } catch (e) {
          $mdDialog.cancel();
          return DataService.error("Wrong JSON file format");
        }
        UserSetService.importUsers(parsedJson)
          .then(function(result) {
            $mdDialog.hide(result);
          })
          .catch(function () {
            $mdDialog.cancel();
          });
      };
      if (file) { reader.readAsBinaryString(file); }
    };
  }

  function accessController($scope, $mdDialog, UserSetService, ScenarioService, ScenarioSetService, DataService,
                            tMessages, user, roles, appSettings, result) {
    $scope.appSettings = appSettings;
    // Deep clone of the user object
    $scope.user = Object.assign({}, user);
    $scope.scenarioIds = Object.assign([], user.scenario_id);
    $scope.tableIds = {
      input: [],
      output: [],
    };
    $scope.tableauIds = {
      input: [],
      output: [],
    };

    $scope.powerIds = {
      input: [],
      output: [],
    };

    $scope.tabs = [{
      segment: 'output'
    }];
    if (user.role !== 'BusinessUser') {
      $scope.tabs.push({
        segment: 'input'
      });
    }

    var tableList = result[1];
    var tableauList = result[2];
    var powerbiList = result[3];
    $scope.scenariosList = result[0].scenarios;
    // Table access tab
    $scope.tablesList = {
      input: _.filter(result[1], {type: 'input'}).concat(_.filter(result[1], {type: 'input_view'})),
      output: _.filter(result[1], {type: 'output'}).concat(_.filter(result[1], {type: 'output_view'}))
    };
    angular.forEach(user.table_id, function (table) {
      var currentTable = _.find(tableList, {id: table.tableId});
      if (currentTable) $scope.tableIds[currentTable.type.split('_')[0]].push(table);
    });
    // Visualization access tab
    $scope.vizList = {
      input: _.filter(tableauList, {type: 'input'}),
      output: _.filter(tableauList, {type: 'output'})
    };
    $scope.powerBIList = {
      input: _.filter(powerbiList, {type: 'input'}),
      output: _.filter(powerbiList, {type: 'output'})
    };
    angular.forEach(user.tableau_id, function (id) {
      var currentTableau = _.find(tableauList, {id: id});
      if (currentTableau) $scope.tableauIds[currentTableau.type].push(id);
    });
    angular.forEach(user.powerbi_id, function (id) {
      var currentPowerBI = _.find(powerbiList, {id: id});
      if (currentPowerBI) $scope.powerIds[currentPowerBI.type].push(id);
    });

    // Sending request to the server to save selected accesses
    $scope.saveAccesses = function (userId) {
      var tableList = $scope.tableIds.input.concat($scope.tableIds.output);
      var tableauList = $scope.tableauIds.input.concat($scope.tableauIds.output);
      var powerList = $scope.powerIds.input.concat($scope.powerIds.output);
      var accessObj = {
        scenarioIds: $scope.scenarioIds,
        tableIds: tableList,
        tableauIds: tableauList,
        powerIds: powerList,
      };
      UserSetService.changeManageAccess(userId, accessObj)
        .then(function () {
          user.scenario_id = _.assign(user.scenario_id, $scope.scenarioIds);
          user.table_id = _.assign(user.table_id, tableList);
          user.tableau_id = _.assign({}, tableauList);
          user.powerbi_id = _.assign({}, powerList);
          $mdDialog.hide();
          DataService.success(tMessages.getSettings().changeAccess);
        });
    };

    // add the 'md-checked' css class to the checkbox and set it as checked
    // when load boxes
    $scope.exists = function (item, list) {
      return list ? list.indexOf(item) > -1 : false;
    };

    $scope.tableExists = function (item, list) {
      return list && !_.isUndefined(_.find(list, {tableId: item}));
    };

    // add the 'md-checked' css class to the checkbox and set it as checked
    // when choose box
    $scope.toggle = function (tableId, list) {
      var currentTable = _.find(list, {tableId: tableId});
      if (!_.isUndefined(currentTable)) {
        _.remove(list, function(value) {
          return value.tableId === tableId;
        });
      } else {
        // Update list of editable table
        list.push({
          tableId: tableId,
          isEditable: true
        });
      }
    };

    // Scenario/Report access checkboxes click handler
    $scope.toggleAccess = function (reportId, list) {
      var index = list.indexOf(reportId);
      if (index > -1) list.splice(index, 1);
      else list.push(reportId);
    };

    $scope.checkSelectExisting = function (checkSelectExisting, selectedList, type) {
      return checkSelectExisting ? selectedList.length === checkSelectExisting.length : false;
    };

    $scope.selectAllScenarios = function () {
      if ($scope.checkSelectExisting($scope.scenariosList, $scope.scenarioIds)) {
        $scope.scenarioIds.splice(0);
      }
      else $scope.scenarioIds = _.map($scope.scenariosList, 'id');
    };

    $scope.selectAllTables = function (type) {
      if ($scope.checkSelectExisting($scope.tablesList[type], $scope.tableIds[type])) {
        $scope.tableIds[type].splice(0);
      }
      else $scope.tableIds[type] = _.map($scope.tablesList[type], function (table) {
        return {
          tableId: table.id,
          isEditable: true
        };
      });
    };

    $scope.selectAllTableau = function (type) {
      if ($scope.checkSelectExisting($scope.vizList[type], $scope.tableauIds[type])) {
        $scope.tableauIds[type].splice(0);
      }
      else $scope.tableauIds[type] = _.map($scope.vizList[type], 'id');
    };

    $scope.selectAllPowerbi = function (type) {
      if ($scope.checkSelectExisting($scope.powerBIList[type], $scope.powerIds[type])) {
        $scope.powerIds[type].splice(0);
      }
      else $scope.powerIds[type] = _.map($scope.powerBIList[type], 'id');
    };

    // Scenario access checkboxes click handler
    $scope.toggleScenario = function (scenarioId) {
      var index = $scope.user.scenario_id.indexOf(scenarioId);
      if (index > -1) $scope.user.scenario_id.splice(index, 1);
      else $scope.user.scenario_id.push(scenarioId);
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.editableModel = function (tableId, list) {
      var currentTable = _.find(list, {tableId: tableId});
      return !_.isUndefined(currentTable) ? currentTable.isEditable : true;
    };

    $scope.setEditable = function (tableId, isEditable, list) {
      var currentTable = _.find(list, {tableId: tableId});
      currentTable.isEditable = isEditable;
    };

    $scope.findRoleName = function (role) {
      return _.find(roles, {role: role}).rolename;
    };
  }
})();
