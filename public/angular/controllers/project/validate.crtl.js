'use strict';

function validateDialogController($scope, $mdDialog, $interval, ExecuteService, TableService, DataService, tMessages,
                                  ExecutionProvider, input, pid, settings, jobId) {
  var execStatus = ExecutionProvider.getStatus();
  $scope.isUploading = true;
  $scope.modalName = input.displayname;

  if (jobId) {
    $scope.timer = $interval(function () {
      checkStatus(jobId, pid);
    }, 3000);
  } else {
    ExecuteService.validateInput(pid, settings, input)
      .then(function (data) {
        $scope.timer = $interval(function () {
          checkStatus(data.jobId, pid);
        }, 3000);
      }, function (err) {
        errorFun(err);
      });
  }

  function checkStatus(jobId, pid) {
    ExecuteService.getJobHistory(pid, jobId)
      .then(function (data) {
        var executionStatus = data[0].status.toLowerCase();
        if (executionStatus.toLowerCase() === execStatus.completedSuccess || executionStatus.toLowerCase() === execStatus.success) {
          $interval.cancel($scope.timer);
          $scope.isUploading = false;
          DataService.success(tMessages.getTable().validationSuccess);
          $mdDialog.hide(data);
        }
        if (executionStatus.toLowerCase() === execStatus.completedFailure || executionStatus.toLowerCase() === execStatus.failure) {
          $interval.cancel($scope.timer);
          generateLogs(jobId);
        }
      }, function (err) {
        $interval.cancel($scope.timer);
        errorFun(err);
      });
  }

  function generateLogs(jobId) {
    ExecuteService.getExecutionLogs(jobId)
      .then(function (result) {
        var logData = '';
        angular.forEach(_.isArray(result) ? result : result.logs, function (data) {
          logData += data.log + '\n';
        });
        errorFun(logData);
      });
  }

  function errorFun(err) {
    $scope.isUploading = false;
    DataService.error(err, tMessages.getTable().validationError);
  }

  $scope.cancel = function () {
    $mdDialog.hide();
  };
}
