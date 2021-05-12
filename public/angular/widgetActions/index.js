(function () {
  'use strict';

  angular
    .module('commonApp')
    .directive('actionWidget', actionWidget);

    actionWidget.$inject = ['$timeout'];

    function actionWidget ($timeout) {
      var directive = {
        restrict: 'AE',
        replace: 'true',
        templateUrl: 'widgetActions/index.ejs',
        link: link,
        scope: {
          actions: "=",
          type: "=",
          pid: "="
        },
        controller: controller
      };

      return directive;

      function link (scope, element) {
        $timeout(function () {
          $("#macros_menu_btn--sm").click(function() {
            angular.element(element).css({
              transform: "translateX(0px)"
            });
          });
        }, 1);

        angular.element(element).find("#closeAction").click(function() {
          angular.element(element).css({
            transform: "translateX(615px)"
          });
        });
      }

      function controller ($scope, $interval, $filter, $rootScope, ExecuteService, ExecutionProvider, DataService, tMessages) {
        var isExtract = true,
            execStatus = ExecutionProvider.getStatus(),
            executionTimer = null;

        $scope.currentAction = null;
        $scope.execStatus = execStatus;
        $scope.currentUser = $rootScope.currentUser;

        $scope.executeAction = executeAction;
        $scope.downloadLog = downloadLog;
        $scope.downloadAction = downloadAction;
        $scope.uploadAction = uploadAction;
        $scope.stopAction = stopAction;
        $scope.openNotebook = openNotebook;
        $scope.convertUsername = DataService.convertUsername;

        // Check status of the last refresh execution
        if ($scope.actions && $scope.actions.secondary && $scope.actions.secondary.length) {
          var executionIds = _.map($scope.actions.secondary, "_id").join(',');

          ExecuteService.getHistory($scope.pid, 'secondary', 1, executionIds)
            .then(function (runHistory) {
              runHistory.forEach(function (data) {
                var currentAction = _.find($scope.actions.secondary, { _id: data.actionId });
                currentAction.status = data.status;
                currentAction.startTime = data.startTime;
                currentAction.endTime = data.endTime;
                currentAction.username = data.username;
                currentAction.jobId = data.jobId;
                currentAction.executionTime = data.executionTime;

                var status = data.status.toLowerCase();
                if (status === execStatus.queued ||
                    status === execStatus.started ||
                    status === execStatus.running ||
                    status === execStatus.tableauRunning) {
                  $scope.currentAction = currentAction;
                  $scope.currentAction.isExecuting = true;
                  $rootScope.$emit('startAction', $scope.currentAction.name);
                  $scope.timer = $interval(function () {
                    checkStatus(currentAction.jobId);
                  }, 3000);
                }
              });
            });
        }

        // Executing the action
        function executeAction(action, triggerId) {
          isExtract = true;
          $scope.currentAction = action;
          $scope.currentAction.status = '';
          $scope.currentAction.username = '';
          $scope.currentAction.endTime = '';
          $scope.currentAction.isStop = true;
          $scope.currentAction.isExecuting = true;
          $scope.currentAction.executionTime = 0;

          var details = {
            _id: action._id,
            type: action.type,
            segment: action.segment,
            name: action.name,
            fileName: action.fileName,
            command: action.command,
            version: action.version,
            environment: action.environment,
            options: action.options || "",
            environmentType: action.environmentType,
            registry: action.registry,
          };
          if (triggerId) details.triggerId = triggerId;

          ExecuteService.executeAction($scope.pid, details).then(function (data) {
            $rootScope.$emit('startAction', $scope.currentAction.name);
            $scope.timer = $interval(function () {
                $scope.currentAction.jobId = data.jobId;
                checkStatus(data.jobId);
              }, 3000);
            }, function () {
              $scope.currentAction = null;
              stopRunning();
            });
        }

        // Checking status of the action execution
        function checkStatus(jobId, finalCheck) {
          var lastLogId;
          ExecuteService.getExecutionLogs(jobId, lastLogId, 'businesslog')
            .then(function (data) {
              for (var index = 0; index < $scope.actions.secondary.length; index++) {
                if ($scope.actions.secondary[index].jobId &&
                  $scope.actions.secondary[index].jobId === jobId) {
                    $scope.actions.secondary[index].execLogs = finalCheck ? null : data.logs;
                  }
              }
              var executionStatus = data.status.toLowerCase();
              $scope.currentAction.status = data.status ? data.status : '';
              $scope.currentAction.username = data.username ? data.username : '';
              $scope.currentAction.startTime = data.startTime ? data.startTime : '';
              $scope.currentAction.endTime = data.endTime ? data.endTime : '';

              if (executionStatus === execStatus.started ||
                  executionStatus === execStatus.queued ||
                  executionStatus === execStatus.running ||
                  executionStatus === execStatus.tableauRunning) {
                if (data.startTime && !executionTimer) {
                  $scope.currentAction.executionTime =
                  Math.floor((new Date().getTime() - new Date(data.startTime).getTime()) / 1000) - 1;

                  // Running the execution timer
                  executionTimer = $interval(function incrementExecutionTime() {
                    $scope.currentAction.executionTime++;
                  }, 1000);
                }
              } else {
                // stopping the execution timer
                $interval.cancel(executionTimer);
                $scope.currentAction.executionTime = data.executionTime;
              }

              if ((executionStatus === execStatus.completedSuccess || executionStatus === execStatus.success) && isExtract) {
                isExtract = false;
                $interval.cancel($scope.timer);
                $timeout(function () {
                  checkStatus($scope.currentAction.jobId, true);
                }, 1000);
                $rootScope.$emit('refreshWidget');
              }
              if (finalCheck || executionStatus === execStatus.tableauSuccess) {
                stopRunning();
              }
              if (executionStatus === execStatus.tableauFailure || executionStatus === execStatus.tableauSuccess) {
                isExtract = true;
              }
              if (executionStatus === execStatus.completedFailure ||
                executionStatus === execStatus.failure ||
                executionStatus === execStatus.tableauFailure
              ) {
                stopRunning();
                DataService.error(tMessages.getTable().actionError);
              }
              $rootScope.$emit('checkLog');
            }, function () {
              stopRunning();
            });
        }

        function downloadLog (info) {
          ExecuteService.getExecutionLogs(info.jobId)
            .then(function (data) {
              var logText = '';
              angular.forEach(data.logs, function (value) {
                logText += $filter('date')(value.time, 'MM/dd/yy HH:mm:ss') + ' - ' + value.log + '\r\n';
              });
              var blob = new Blob([logText], {
                type: "application/json"
              });
              saveAs(blob, info.name + '-action.log');
            });
        }

        function downloadAction (action) {
          action.inProgress = true;
          ExecuteService.downloadAction(action._id, $scope.pid)
            .then(function (result) {
              action.inProgress = false;
              var data = new Blob([result]);
              saveAs(data, action.downloadFile);
            }, function () {
              action.inProgress = false;
            });
        }

        function uploadAction (action) {
          if (!action.inputFiles.length) return;
          action.inProgress = true;
          angular.forEach(action.inputFiles, function (file) {
            action.files.push({
              name: file.name,
              inProgress: true
            })
            var currentFile = _.find(action.files, {name: file.name});
            ExecuteService.uploadAction(action._id, $scope.pid, file)
              .then(function (result) {
                action.last_accessed_at = result.lastAccessedAt;
                action.last_accessed_by = result.lastAccessedBy;
                currentFile.inProgress = false;
                currentFile.success = true;
                action.inputFiles = [];
              }, function () {
                currentFile.inProgress = false;
                currentFile.error = true;
                action.inputFiles = [];
              });
          });
        }

        function stopAction (action) {
          action.isStop = false;
          $interval.cancel($scope.timer);
          $interval.cancel(executionTimer);
          executionTimer = null;
          ExecuteService.stopExecution($scope.pid, action.jobId)
            .then(function (data) {
              $scope.currentAction.status = data.status;
              $scope.currentAction = null;
              $rootScope.$emit('stopAction');
            }, function () {
              $scope.timer = $interval(function () {
                checkStatus($scope.currentAction.jobId);
              }, 3000);
            });
        }

        function stopRunning () {
          $interval.cancel($scope.timer);
          $interval.cancel(executionTimer);
          executionTimer = null;
          $scope.currentAction = null;
          $rootScope.$emit('stopAction');
        }

        function openNotebook() {
          var url = window.location.origin.concat(window.location.pathname + '#/jupyter/'+ $scope.pid);
          window.open(url);
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
          if (fromState.name === 'base.project.inputs' || fromState.name === 'base.project.outputs') {
            stopRunning();
          }
        });

        // Running action by the passed ID when runAction event is emitted (e.g. action trigger)
        $rootScope.$on('runAction', function (event, actionId, triggerId) {
          // Finding the action by ID
          var actionToRun = $scope.actions.secondary.find(function (action) {
            return action._id === actionId;
          });

          if (actionToRun) {
            $("#macros_menu_btn--sm").click(); // Opening the widget
            $scope.executeAction(actionToRun, triggerId);
          }
        });
      }
    }
})();
