(function() {
  'use strict';

  angular
    .module('commonApp')
    .controller('TableauReportsCtrl', TableauReportsCtrl);

  TableauReportsCtrl.$inject = ['$scope', 'TableauService', 'DataService', '$mdDialog', 'tMessages', 'TableService',
    '$templateCache', '$timeout', '$stateParams', 'dragulaService', '$rootScope', 'PowerBiService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TableauReportsCtrl ($scope, TableauService, DataService, $mdDialog, tMessages, TableService, $templateCache,
                               $timeout, $stateParams, dragulaService, $rootScope, PowerBiService) {

   var vm = this;
   vm.invalidFiles = [];
   vm.modelOptions = {};
   vm.patternInput = '.twbx';
   vm.acceptSelectInput = '.twbx';
   vm.reportTypes = {
     tableau: {
       label: 'Tableau',
       value: 'tableau'
     },
     powerbi: {
       label: 'PowerBI',
       value: 'powerbi'
     }
   };

   vm.uploadWorkbook = uploadWorkbook;
   vm.downloadWorkbook = downloadWorkbook;
   vm.addTableau = addTableau;
   vm.editTableau = editTableau;
   vm.deleteTableau = deleteTableau;
   vm.addPowerReport = addPowerReport;
   vm.editPowerReport = editPowerReport;
   vm.deletePowerReport = deletePowerReport;
   vm.progressBar = $rootScope.progressBar;

   var dragulaOptions = {
     moves: function (el, container, handle) {
       return handle.className === 'handle';
     }
   };

    // CALL SERVICE METHOD TO Drag handles float your cruise
    dragulaService.options($scope, 'inputTables-bag', angular.copy(dragulaOptions));
    dragulaService.options($scope, 'outputTables-bag', angular.copy(dragulaOptions));
    dragulaService.options($scope, 'inputPowerReports-bag', angular.copy(dragulaOptions));
    dragulaService.options($scope, 'outputPowerReports-bag', angular.copy(dragulaOptions));

    $scope.$on('inputTables-bag.drop', function (e, el) {
      dropEvent('inputTables', 'tableau');
    });

    $scope.$on('outputTables-bag.drop', function (e, el) {
      dropEvent('outputTables', 'tableau');
    });

    $scope.$on('inputPowerReports-bag.drop', function (e, el) {
      dropEvent('inputPowerReports', 'powerbi');
    });

    $scope.$on('outputPowerReports-bag.drop', function (e, el) {
      dropEvent('outputPowerReports', 'powerbi');
    });

    function dropEvent(tabVariable, type) {
      vm.progressBar.start();
      $timeout(function () {
        angular.forEach($scope.tableauSettingsCtrl[tabVariable], function (value, key) {
          var newIndex = key + 1;
          if (value.order_id !== newIndex) {
            if (type === 'tableau') {
              TableauService.changeOrderId(value.id, newIndex)
                .then(function (data) {
                  value.order_id = newIndex;
                  vm.progressBar.complete();
                });
            }
            if (type === 'powerbi') {
              PowerBiService.changeOrder(value.id, newIndex)
                .then(function (data) {
                  value.order_id = newIndex;
                  vm.progressBar.complete();
                });
            }
          }
        });
      }, 100);
    }

    function addTableau (ev, type) {
      $mdDialog
        .show({
          controller: editTableauController,
          template: $templateCache.get('settings/scenario/edit_tableau.ejs'),
          targetEvent: ev,
          parent: angular.element(document.getElementsByClassName('setting_content')),
          locals: {
            type: type.segment,
            table: {
              id: 0
            }
          }
        })
        .then(function (result) {
          $scope.tableauSettingsCtrl[type.tableName].push(result);
        });
    }

    function editTableau (ev, type, table) {
      $mdDialog
        .show({
          controller: editTableauController,
          template: $templateCache.get('settings/scenario/edit_tableau.ejs'),
          targetEvent: ev,
          parent: angular.element(document.getElementsByClassName('setting_content')),
          locals: {
            type: type,
            table: table
          }
        })
        .then(function (result) {
          table = result;
        });
    }

    function addPowerReport (ev, type) {
      $mdDialog
        .show({
          controller: editPowerBiController,
          template: $templateCache.get('settings/scenario/edit_powerbi.ejs'),
          targetEvent: ev,
          parent: angular.element(document.getElementsByClassName('setting_content')),
          locals: {
            type: type.segment,
            table: {
              id: 0
            }
          }
        })
        .then(function (result) {
          $scope.tableauSettingsCtrl[type.powerReport].push(result);
        });
    }

    function editPowerReport (ev, type, table) {
      $mdDialog
        .show({
          controller: editPowerBiController,
          template: $templateCache.get('settings/scenario/edit_powerbi.ejs'),
          targetEvent: ev,
          parent: angular.element(document.getElementsByClassName('setting_content')),
          locals: {
            type: type,
            table: table
          }
        })
        .then(function (result) {
          table = result;
        });
    }

    function deleteTableau (tableau, ev, tableName) {
      var confirm = $mdDialog.confirm()
        .title(tMessages.getSettings().headerTableauDelete)
        .targetEvent(ev)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {
        TableauService.deleteTableau(tableau.id)
          .then(function() {
            _.remove($scope.tableauSettingsCtrl[tableName], {
              id: tableau.id
            });
          });
      }, function () {});

      ev.stopPropagation();
    }

    function deletePowerReport (report, ev, tableName) {
      var confirm = $mdDialog.confirm()
        .title(tMessages.getSettings().headerTableauDelete)
        .targetEvent(ev)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {
        PowerBiService.deleteReport(report.id)
          .then(function() {
            _.remove($scope.tableauSettingsCtrl[tableName], {
              id: report.id
            });
          });
      }, function () {});

      ev.stopPropagation();
    }

    function uploadWorkbook (ev, file, tabInfo) {
      if (file) {
        vm.progressBar.start();
        TableauService.uploadWorkbook(file,tabInfo.segment)
          .then(function () {
            return TableauService.getAllTableau({
              templateID: $stateParams.templateID
            });
          })
          .then(function (result) {
            $scope.tableauSettingsCtrl[tabInfo.tableName] = result.filter(function(tab) {
              return tab.type === tabInfo.segment;
            });
            vm.progressBar.complete();
            $scope.tableauSettingsCtrl.saveTabVisibility(tabInfo.tabValue,true);
          })
          .catch(function () {
            vm.progressBar.reset();
          });
      }
    }

    function downloadWorkbook () {
      vm.progressBar.start();
      TableauService.downloadWorkbook()
        .then(function(result) {
          // returns a newly created Blob object
          // whose content consists of the concatenation of the array of values given in parameter.
          var blob = new Blob([result], {
            type: 'application/binary'
          });
          // saving file on the client-side
          saveAs(blob, 'workbook.twbx');
          vm.progressBar.complete();
        })
        .catch(function () {
          vm.progressBar.reset();
        });
    }

  }

  function editTableauController (type, table, $scope, $mdDialog, $q, TableauService, DataService, tMessages, $stateParams) {
    $scope.type = type;
    $scope.tableau = _.assign({}, table);
    $scope.cancel = cancel;
    $scope.chooseProject = chooseProject;
    $scope.editTableau = editTableau;
    $scope.filterItems = filterItems;
    $scope.filterWB = filterWB;

    if (table.project) {
      var bookFromList = _.find($scope.projects, {project: table.project});
      $scope.workbooks = !angular.isUndefined(bookFromList) ? bookFromList.workbooks : [table.workbook];
    }

    TableauService.getWorkbooks().then(function(projects) {
      $scope.projects = projects;
    });

    function cancel () {
      $mdDialog.cancel();
    }

    function chooseProject (item) {
      $scope.workbooks = item ? item.workbooks : [];
    }

    function editTableau (form, tabObject) {
      if (form.$invalid || (tabObject.project && !tabObject.workbook)) {
        DataService.error(tMessages.getSettings().tableauFields);
      } else {
        if (table.id) {
          tabObject.scenario_template_id = $stateParams.templateID;
          TableauService.editTableau(tabObject).then(function () {
            _.assign(table, tabObject);
            $mdDialog.hide(tabObject);
          });
        } else {
          tabObject.type = $scope.type;
          tabObject.scenario_template_id = $stateParams.templateID;
          TableauService.addTableau(tabObject).then(function (result) {
            tabObject.id = result.id;
            $mdDialog.hide(tabObject);
          });
        }
      }
    }

    function filterItems (userInput) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = $scope.projects.filter(function(project) {
        return project.project.toLowerCase().indexOf(normalisedInput) === 0;
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }

    function filterWB (userInput) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = $scope.workbooks.filter(function(woorkbook) {
        return woorkbook.toLowerCase().indexOf(normalisedInput) === 0;
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }
  }

  function editPowerBiController (type, table, $scope, $mdDialog, $q, PowerBiService, DataService, tMessages, $stateParams) {
    $scope.type = type;
    $scope.report = _.assign({}, table);
    $scope.cancel = cancel;
    $scope.editReport = editReport;

    function cancel () {
      $mdDialog.cancel();
    }

    function editReport (form, tabObject) {
      if (form.$invalid) {
        DataService.error(tMessages.getSettings().tableauFields);
      } else {
        if (table.id) {
          tabObject.scenario_template_id = $stateParams.templateID;
          PowerBiService.editReport(tabObject).then(function () {
            _.assign(table, tabObject);
            $mdDialog.hide(tabObject);
          });
        } else {
          tabObject.type = $scope.type;
          tabObject.scenario_template_id = $stateParams.templateID;
          PowerBiService.addReport(tabObject).then(function (result) {
            tabObject.id = result.id;
            $mdDialog.hide(tabObject);
          });
        }
      }
    }
  }
})();
