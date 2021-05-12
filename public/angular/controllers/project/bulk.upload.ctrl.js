'use strict';

// Input/output files bulk upload modal window controller
// Template views/app/bulk-upload-dialog.ejs
// Called from the controllers/project/table.js
function bulkUploadController(pid, tables, type, $scope, $mdDialog, TableService, tMessages) {
  $scope.type = type;
  $scope.zipFileDetails = {};
  var uploadedTables = [];

  // Folder upload handler
  $scope.inputsFolderUploaded = function (files) {
    $scope.files = {
      success: [],
      error: [],
      unsupported: []
    };
    $scope.zipFileDetails.error = null;

    validateFiles(Array.from(files));
  };

  // Upload zip file handler
  $scope.uploadZip = function (event, file) {
    if (!file) return;

    // Combining form data to send to the server
    var form = new FormData();
    form.append('file', file);
    form.append('tableType', type);

    $scope.files = {
      success: [],
      error: [],
      unsupported: []
    };
    $scope.zipFileDetails = {
      fileName: file.name,
      uploadProgress: 0,
      loading: true,
      error: null,
    };

    // Sending data to the server
    TableService.uploadFile({ scenarioID: pid, zip: true }, form, function (uploadProgress) {
      // This function is called on upload progress change
      $scope.zipFileDetails.uploadProgress = uploadProgress;
      $scope.$apply();
    }).then(function (res) {
      $scope.zipFileDetails.loading = false;

      // Iterating through each processed file
      res.forEach(function (file) {
        file.name = file.file_name;

        if (file.error) {
          if (file.error === tMessages.getTable().bulkUploadInvalidExtension) $scope.files.unsupported.push(file);
          else $scope.files.error.push(file);

          // Reformatting SQL errors
          if (file.error.messagePrimary) file.error = file.error.messagePrimary;
        } else {
          $scope.files.success.push(file);

          // Finding the uploaded table
          var table = tables.find(function (table) {
            return table.file_name === file.file_name || table.tablename + '.csv' === file.file_name;
          });

          if (table) {
            file.displayName = table.displayname;
            uploadedTables.push(table);
          }
        }
      });
    }).catch(function (err) {
      $scope.zipFileDetails.loading = false;
      $scope.zipFileDetails.error = err.message;
    });
  };

  // Close btn click handler
  $scope.closeModal = function () {
    $mdDialog.hide(uploadedTables);
  };

  // Sending file to the server
  function sendFile(file, table) {
    // Combining form data to send to the server
    var form = new FormData();
    form.append('file', file);
    form.append('skipHeader', true); // Skipping header by default
    form.append('scenarioId', pid);
    form.append('dataTableName', table.tablename);
    form.append('tableType', type);
    form.append('appendData', false); // By default appendData should be false

    file.isLoading = true;
    var fileIndex = $scope.files.success.push(file) - 1;

    // Sending
    TableService.uploadFile({ scenarioID: pid }, form, function (uploadProgress) {
      // This function is called on upload progress change
      file.uploadProgress = uploadProgress;
      $scope.$apply();
    }).then(function () {
      uploadedTables.push(table);
      file.isLoading = false;
      file.displayName = table.displayname;
    }, function (err) {
      $scope.files.success.splice(fileIndex, 1);
      $scope.files.error.push(file);
      // Formatting the returned error to show only error text, without the context
      file.error = err.message.split('\n')[0].replace('ERROR:  ', '');
    });
  }

  // Checking the uploaded files
  function validateFiles(files) {
    files.forEach(function (file) {
      // Checking the file extension
      var extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'csv') {
        file.error = tMessages.getTable().bulkUploadInvalidExtension;
        $scope.files.unsupported.push(file);
        return;
      }

      // Checking if table exists in the DB
      var table = tables.find(function (table) {
        // first comparing the tablename field with the file name without extension
        // as extra criteria comparing the file_name field with the file name with extension
        return table.tablename === file.name.replace('.' + extension, '') ||
          table.file_name === file.name;
      });

      if (!table) {
        file.error = tMessages.getTable().bulkUploadInvalidTable;
        $scope.files.error.push(file);
        return;
      }

      sendFile(file, table);
    });
  }
}
