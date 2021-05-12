'use strict';

// Input/output files bulk download modal window controller
// Template views/app/bulk-download-dialog.ejs
// Called from the controllers/project/table.js
function bulkDownloadController(pid, type, scenarioName, rowsCount, $scope, $mdDialog, tMessages, TableService) {
  $scope.type = type;
  $scope.rowsCount = rowsCount;
  $scope.downloading = false;
  $scope.largeFileWarning = tMessages.getTable().largeFileWarning.split('.');
  $scope.useDisplayName = true;

  // Download btn click handler
  $scope.download = function() {
    $scope.downloading = true;

    // Sending request to the server which returns arraybuffer of the zip file to download
    TableService.downloadTabs(pid, type, $scope.useDisplayName).then(function (data) {
      $scope.closeModal();
      $scope.downloading = false;
      TableService.downloadFile(data, scenarioName+'_'+type+'.zip');
    }, function () {
      $scope.closeModal();
      $scope.downloading = false;
    });
  };

  // Close btn click handler
  $scope.closeModal = function () {
    $mdDialog.hide();
  };
}
