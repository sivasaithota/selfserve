'use strict';

// Single file download/upload modal window controller
// Template views/app/single-download-upload.ejs
// Called from the jqGridWidget/widget/jqWidget.controller.js
function singleLoadController(scenarioID, table, uploadDetails, downloadDetails, $scope, $mdDialog, TableService) {
  $scope.table = table;
  $scope.fileName = uploadDetails ? uploadDetails.fileName : '';
  $scope.loadType = uploadDetails ? 'upload' : 'download';
  $scope.uploadProgress = 0;
  $scope.uploadStatus = '';
  $scope.uploadError = '';
  $scope.uploadResult = '';

  if ($scope.loadType === 'upload') {
    // Uploading file to the server
    $scope.uploadStatus = 'loading';

    TableService.uploadFile({ scenarioID: scenarioID }, uploadDetails.formData, function (uploadProgress) {
      // This function is called on upload progress change
      $scope.uploadProgress = uploadProgress;
      $scope.$apply();
    }).then(function (result) {
      $scope.uploadResult = result;
      $scope.uploadStatus = 'success';
    }, function (err) {
      $scope.uploadStatus = 'error';
      // Formatting the returned error to show only error text, without the context
      $scope.uploadError = err.message.split('\n')[0].replace('ERROR:  ', '');
    });
  } else {
    // Requesting path to the file to download from the server
    TableService.downloadTable(
      scenarioID,
      table.tablename,
      downloadDetails.tableType,
      downloadDetails.filter
    ).then(function (data) {
      TableService.downloadFile(data, table.tablename +'_scenario_'+scenarioID+'.zip');
        $mdDialog.hide();
      });
    }

  // Close btn click handler
  $scope.closeModal = function () {
    $mdDialog.hide($scope.uploadResult);
  };
}
