'use strict';

function projectDialogController(table, pid, file, header, type, appendData, $scope, $mdDialog, $timeout,
                                 TableService, DataService, tMessages) {
  var allowedTabs = {
    csv: 'csv',
    xls: 'xls',
    xlsx: 'xlsx'
  };

  var fd = new FormData();

  $scope.isUploading = true;
  $scope.modalName = table.displayname;

  function showError(err) {
    $scope.isUploading = false;
    DataService.error(err, tMessages.getTable().uploadError);
  }

  var sizeInMB = Number((file.size / (1024 * 1024)).toFixed(2));
  var extension = file.name.split('.');
  extension = extension[extension.length - 1].toLowerCase();

  var isCsv = extension === allowedTabs.csv;
  var isXls = extension === allowedTabs.xls;
  var isXlsx = extension === allowedTabs.xlsx;

  if (isCsv || ((isXls || isXlsx) && sizeInMB <= 40)) {
    fd.append('file', file);
    fd.append('skipHeader', header);
    fd.append('xlsSheet', file.sheet);
    fd.append('scenarioId', pid);
    fd.append('dataTableName', table.tablename);
    fd.append('tableType', type);
    fd.append('appendData', appendData);
    TableService.uploadFile(pid, fd)
      .then(function (data) {
        $scope.isUploading = false;
        DataService.success(tMessages.getTable().uploadSuccess);
        $timeout(function () {
          $mdDialog.hide(data);
        }, 1000);
      }, function (err) {
        showError(err.message);
      });
  } else {
    showError(file.name + tMessages.getTable().fileSize);
  }

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}
