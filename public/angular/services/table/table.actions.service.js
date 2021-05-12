(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('TableActService', TableActService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  TableActService.$inject = ['$mdDialog', '$templateCache', '$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TableActService ($mdDialog, $templateCache, $rootScope) {
    // the callable members of the service
    var service = {
      uploadFile: uploadFile,
      validateInput: validateInput
    };

    return service;

    function uploadFile(ev, file, table, pid, header, type, appendData) {
      return $mdDialog
        .show({
          controller: projectDialogController,
          template: $templateCache.get('app/custom_action.ejs'),
          targetEvent: ev,
          locals: {
            table: table,
            pid: pid,
            file: file,
            header: header,
            type: type,
            appendData: appendData
          }
        })
        .then(function (result) {
          // call method to reload grid
          $rootScope.$emit('handleBroadcast', 'input');
          $('#jqGrid_' + table.tablename.replace(/ /g, '_')).trigger('reloadGrid');
          if (result) {
            table.file_name = result.file_name;
            table.updated_by = result.updated_by;
            table.updated_at = result.updated_at;
            table.status = result.status;
          }
          return result;
        });
    }

    function validateInput(ev, input, jobId, inputValidation, pid) {
      return $mdDialog
        .show({
          controller: validateDialogController,
          template: $templateCache.get('app/custom_action.ejs'),
          targetEvent: ev,
          locals: {
            input: input,
            pid: pid,
            settings: inputValidation,
            jobId: jobId
          }
        });
    }

  }
})();
