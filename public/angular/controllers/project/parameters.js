(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('parameters', parameters);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  parameters.$inject = ['$scope', 'ParameterService', '$stateParams', '$rootScope', 'DataService', 'ExecuteService',
    '$interval', '$timeout', 'tMessages', '$filter', '$mdDialog', '$templateCache', 'ExecutionProvider'
  ];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function parameters($scope, ParameterService, $stateParams, $rootScope, DataService, ExecuteService, $interval,
    $timeout, tMessages, $filter, $mdDialog, $templateCache, ExecutionProvider) {
    // represent the binding scope
    var vm = this;
    var pid = vm.pid = $stateParams.projId;
    var timer = {};
    var executionTimer;
    vm.executionTime = 0;
    var isExtract = true;
    vm.execStatus = ExecutionProvider.getStatus();
    vm.stopStatus = false;
    vm.runStatus = false;
    vm.isPopup = false;

    vm.primaryAction = $scope.work.actions.find(function (action) {
      return action.type === 'primary';
    });

    ParameterService.getParameters($stateParams.projId)
      .then(function (parameters) {
        vm.parameters = parameters.length ? DataService.convertParametersByRows(parameters) : parameters;
      });

    vm.primaryAction && ExecuteService.getHistory(pid, vm.primaryAction.type, 1)
      .then(function (runHistoryData) {
        vm.runHistory = runHistoryData[0] || {};
        if (vm.runHistory && vm.runHistory.status) {
          var lowerStatus = vm.runHistory.status.toLowerCase();
          var isRunning = lowerStatus === vm.execStatus.running ||
                          lowerStatus === vm.execStatus.started;
          var isFinishing = lowerStatus === vm.execStatus.queued ||
                            lowerStatus === vm.execStatus.tableauRunning;
          var isFinished = lowerStatus === vm.execStatus.success ||
                           lowerStatus === vm.execStatus.completedSuccess ||
                           lowerStatus === vm.execStatus.failure ||
                           lowerStatus === vm.execStatus.completedFailure ||
                           lowerStatus === vm.execStatus.tableauFailure;
          if (isFinishing || isRunning) {
            // Show/Hide run, stop, spinner buttons
            vm.stopStatus = isFinishing ? false : true;
            vm.runStatus = isFinishing ? true : false;
            // Update UI with new data
            vm.runHistory.logData = [];
            vm.isPopup = true;
            var startSeconds = new Date(vm.runHistory.startTime).getTime() / 1000;
            var endSeconds = new Date().getTime() / 1000;
            vm.executionTime = endSeconds - startSeconds;
            executionTimer = $interval(execTimer, 1000);
            timer[vm.runHistory.jobId] = $interval(function () {
              checkStatus(vm.runHistory.jobId, pid);
            }, 3000);
          } else {
            vm.executionTime = vm.runHistory.executionTime;
          }
          if (isFinished) {
            ExecuteService.getExecutionLogs(vm.runHistory.jobId, '', 'businesslog')
              .then(function (data) {
                vm.runHistory.logData = data.logs;
              });
          }
        }
      });

    // defining the functions
    vm.saveParametersAndExecute = saveParametersAndExecute;
    vm.toggle = toggle;
    vm.exists = exists;
    vm.checkNumber = checkNumber;
    vm.downloadLog = downloadLog;
    vm.saveParameters = saveParameters;
    vm.loadParameters = loadParameters;
    vm.stopExecution = stopExecution;
    vm.convertUsername = DataService.convertUsername;

    function executeAction() {
      if (!vm.primaryAction) {
        DataService.error(tMessages.getParameter().primaryActionUndefined);
        return;
      }

      isExtract = true;
      vm.isPopup = true;
      vm.runStatus = true;
      vm.runHistory = {};
      ExecuteService.executeAction(pid, vm.primaryAction)
        .then(function (data) {
          vm.executionTime = 0;
          executionTimer = $interval(execTimer, 1000);
          data.logData = [];
          vm.runHistory = data;
          if (data.status.toLowerCase() === vm.execStatus.running) {
            vm.runStatus = false;
            vm.stopStatus = true;
          }
          timer[data.jobId] = $interval(function () {
            checkStatus(data.jobId, pid);
          }, 3000);
        }, function () {
          vm.runStatus = false;
          vm.stopStatus = false;
        });
    }

    function execTimer() {
      vm.executionTime++;
    }

    function saveParametersAndExecute(exeRun) {
      if (exeRun) {
        var isLocked = $scope.work.projectDetails.locking &&
                       $scope.work.projectDetails.locking.created_by &&
                       $scope.work.projectDetails.locking.created_by !== $scope.main.currentUser.username;
        if (vm.formParameters.$invalid) {
          var message;
          var isPatternError = vm.formParameters.$error && vm.formParameters.$error.pattern;
          var isRequiredError = vm.formParameters.$error && vm.formParameters.$error.required;
          if (isPatternError) {
            message = vm.formParameters.$error.pattern[0].$name + tMessages.getParameter().numericFormat;
          }
          if (isRequiredError) {
            message = vm.formParameters.$error.required[0].$name !== 'datepicker' ?
                      tMessages.getParameter().parametersFields : tMessages.getParameter().dateFormat;
          }
          DataService.error(message);// Showing error toast
        } else if (isLocked) {
            DataService.error('Scenario is locked by user - ' + $scope.work.projectDetails.locking.created_by);
        } else {
          executeAction();
        }
      }
    }

    // add the 'md-checked' css class to the checkbox and set it as checked
    function toggle(index, parentIndex, list) {
      vm.parameters[parentIndex].parameters[index].value = exists(list) ? [] : list.parameter.slice();
    }

    // add the 'md-checked' css class to the checkbox and set it as checked
    function exists(list) {
      return list.value.length === list.parameter.length;
    }

    function checkStatus(jobId, pid, finalCheck) {
      var lastLogId;
      var history = vm.runHistory;
      if (history && history.logData && history.logData.length > 0) {
        lastLogId = history.logData[history.logData.length - 1]._id;
      }
      ExecuteService.getExecutionLogs(jobId, lastLogId, 'businesslog')
        .then(function (data) {
          var lowerStatus = data.status.toLowerCase();
          var isTableauCompleted = lowerStatus === vm.execStatus.tableauFailure ||
                                   lowerStatus === vm.execStatus.tableauSuccess;
          var isStopped = lowerStatus === vm.execStatus.failure ||
                          lowerStatus === vm.execStatus.completedFailure ||
                          lowerStatus === vm.execStatus.cancelled ||
                          isTableauCompleted;
          var isSuccessCompleted = lowerStatus === vm.execStatus.completedSuccess ||
                                   lowerStatus === vm.execStatus.success;
          if (isSuccessCompleted && isExtract) {
            isExtract = false;
            finalCheck = true;
          } else if (isTableauCompleted) {
            isExtract = true;
          }
          // Show/Hide run, stop, spinner buttons
          if (lowerStatus === vm.execStatus.running) {
            vm.runStatus = false;
            vm.stopStatus = true;
          } else if (
            lowerStatus === vm.execStatus.tableauRunning || (isSuccessCompleted && !finalCheck)
          ) {
            vm.runStatus = true;
            vm.stopStatus = false;
          } else if (finalCheck || isStopped) {
            // Show error if execution failure
            if (lowerStatus === vm.execStatus.completedFailure) {
              DataService.error(tMessages.getParameter().executionError);
            }
            // Update UI with new data
            history.endTime = data.endTime;
            // Stop checking status
            if (timer[jobId]) {
              $interval.cancel(timer[jobId]);
              delete timer[jobId];
            }
            if (!(lowerStatus === vm.execStatus.cancelled && !finalCheck)) {
              vm.stopStatus = false;
              vm.runStatus = false;
              vm.showLogs = true;
              $interval.cancel(executionTimer);
            } else {
              // In 10 sec send request for getting laterst status
              vm.runStatus = true;
              vm.stopStatus = false;
              $timeout(function () {
                checkStatus(jobId, pid, true);
              }, 10000);
            }
          }
          // Update UI with new data
          if (data.startTime) history.startTime = data.startTime;
          history.logData = history.logData.concat(data.logs);
          history.status = data.status;
          // Auto scroll history content
          $rootScope.$emit('checkLog');
        }, function () {
          $interval.cancel(timer[jobId]);
          $interval.cancel(executionTimer);
          delete timer[jobId];
          vm.stopStatus = false;
          vm.runStatus = false;
        });
    }

    function checkNumber(parameter) {
      var name = parameter.displayname;
      if (vm.formParameters[name].$error && vm.formParameters[name].$error.pattern) {
        DataService.error(name + tMessages.getParameter().numericFormat);
      } else {
        saveParameters(parameter);
      }
    }

    function downloadLog(history) {
      ExecuteService.getExecutionLogs(history.jobId)
        .then(function (data) {
          var logText = '';
          angular.forEach(data.logs, function (value) {
            logText += $filter('date')(value.time, 'MM/dd/yy HH:mm:ss') + ' - ' + value.log + '\r\n';
          });
          var data = new Blob([logText], {
            type: "application/json"
          });
          saveAs(data, 'execution.log');
        });
    }

    function loadParameters(parameter) {
      if (parameter.dependencyId) {
        ParameterService.loadParameter(pid, parameter)
          .then(function (data) {
            parameter.parameter = data
          });
      }
    }

    function checkAndLoadParam(parameter){
      vm.parameters.every(function(ele) {
        if(ele.group_name === parameter.groupName) {
          ele.parameters.forEach(function(param) {
            if(parameter.type == 4 && parameter.dependentColumnName && param.parentColumnName && parameter.dependentColumnName === param.parentColumnName) {
              param.value = "";
              saveParameters(param)
              loadParameters(param)
              checkAndLoadParam(param)
            }
          });
          return false;
        }
        return true;
      })
    }

    function saveParameters(parameter, type) {
      if ($scope.main.currentUser.functions.Param_Edit) {
        if (!angular.isUndefined(parameter.value) && ((!type && parameter.oldValue !== parameter.value) || (type && !_.isEqual(parameter.oldValue, parameter.value)))) {
          ParameterService.saveParameter(pid, parameter)
            .then(function (data) {
              parameter.isSaved = true;
              $timeout(function (argument) {
                parameter.isSaved = false;
              }, 3000);
              parameter.oldValue = parameter.value;
              checkAndLoadParam(parameter);
            });
        }
      }
    }

    function stopExecution(ev, execStop) {
      if (execStop && !angular.isUndefined(vm.runHistory.jobId)) {
        $mdDialog
          .show({
            controller: function ($scope, $mdDialog) {
              $scope.cancel = function () {
                $mdDialog.cancel();
              };

              $scope.stop = function () {
                $mdDialog.hide(true);
              };
            },
            clickOutsideToClose: true,
            template: $templateCache.get('app/stop_execution.ejs'),
            targetEvent: ev,
            parent: angular.element(document.querySelector('#create_content'))
          })
          .then(function (answer) {
            if (answer) {
              ExecuteService.stopExecution(pid, vm.runHistory.jobId)
                .then(function (data) {
                  if (data.logs) {
                    vm.runHistory.logData = vm.runHistory.logData.concat(data.logs);
                  }
                }, function (result) {
                  vm.stopStatus = false;
                  vm.runStatus = false;
                });
            }
          });
      }
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (fromState.name === 'base.project.parameters') {
        $interval.cancel(timer[vm.runHistory.jobId]);
        $interval.cancel(executionTimer);
      }
   });
  }
})();
