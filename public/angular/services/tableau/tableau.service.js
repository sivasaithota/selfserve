(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('TableauService', TableauService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  TableauService.$inject = ['requestService', '$q', 'DataService', 'tMessages', 'UserService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TableauService(requestService, $q, DataService, tMessages, UserService) {
    // the callable members of the service
    return {
      getCurrentTableau: getCurrentTableau,
      getAllTableau: getAllTableau,
      deleteTableau: deleteTableau,
      editTableau: editTableau,
      addTableau: addTableau,
      getTableauTicket: getTableauTicket,
      getUsers: getUsers,
      getWorkbooks: getWorkbooks,
      getSettings: getSettings,
      getCredentials: getCredentials,
      saveSettings: saveSettings,
      changeOrderId: changeOrderId,
      getExtracts: getExtracts,
      saveExtract: saveExtract,
      downloadWorkbook: downloadWorkbook,
      uploadWorkbook: uploadWorkbook
    };

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function getCurrentTableau(scenarioId, type) {
      var deferred = $q.defer();
      requestService.get('./scenario/tableau/' + scenarioId + '/' + type + '?userId=' + UserService.getUserInfo().id)
        .success(function (result) {
          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getAllTableau(parameters) {
      var deferred = $q.defer();
      requestService.get('./tableau' +
      (parameters.templateID ? '?scenario_template_id=' + parameters.templateID : '') +
      (parameters.userId ? '?userId=' + parameters.userId : ''))
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function deleteTableau(tableauId) {
      var deferred = $q.defer();
      requestService.delete('./tableau/' + tableauId)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function editTableau(tableau) {
      var deferred = $q.defer();
      requestService.put('./tableau/' + tableau.id, tableau)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function addTableau(tableau) {
      var deferred = $q.defer();
      requestService.post('./tableau', tableau)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getTableauTicket() {
      var deferred = $q.defer();
      requestService.get('./tableau/ticket')
        .success(function (data) {
          if (data.ticket !== '-1') {
            deferred.resolve(data);
          } else {
            DataService.error(tMessages.getTableau().ticket);
            deferred.reject();
          }
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getUsers() {
      var deferred = $q.defer();
      requestService.get('./tableau/users')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getWorkbooks() {
      var deferred = $q.defer();
      requestService.get('./tableau/workbooks')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    // Fetching tableau settings table for the passed template ID and tableau settings not depending on the template
    // (template ID = 0)
    function getSettings(param) {
      var deferred = $q.defer();
      requestService.get('./setting?keys=' + param.keys +
          (param.templateID ? '&scenario_template_id=' + '0,' + param.templateID : '') +
          (param.scenarioID ? '&scenario_id=' + param.scenarioID : ''))
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getCredentials() {
      var deferred = $q.defer();
      requestService.get('./tableau/reportsUser')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function saveSettings(setting) {
      var deferred = $q.defer();
      requestService.put('./setting', setting)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function changeOrderId(tableauId, orderId) {
      var deferred = $q.defer();
      requestService.put('./tableau/changeorder/' + tableauId, {
          orderId: orderId
        })
        .success(function (result) {
          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    // Fetching tableau extract settings from the tableauExtract table in the DB
    function getExtracts(scenarioTemplateId) {
      var deferred = $q.defer();
      requestService.get('./tableau/extract?scenarioTemplateId=' + scenarioTemplateId)
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (err) {
            DataService.error(err);
            deferred.reject(err);
          });
      return deferred.promise;
    }

    // Saving tableau extract setting to the tableauExtract table in the DB
    function saveExtract(extractId, extractValue) {
      var deferred = $q.defer();
      requestService.put('./tableau/extract/' + extractId, { runExtract: extractValue }).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        DataService.error(err);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function downloadWorkbook() {
      var deferred = $q.defer();
      requestService.get('./macro/workbook/download', {responseType: "arraybuffer"})
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        }).error(function (err) {
          var errorString = String.fromCharCode.apply(null, new Uint8Array(err));
          DataService.error(errorString);
          deferred.reject(errorString);
        });
      return deferred.promise;
    }

    function uploadWorkbook(files,tab) {
      var deferred = $q.defer();
      var fd = new FormData();
      fd.append('type', tab);
      fd.append('files', files);
      requestService.post('./macro/workbook/upload', fd, {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        })
        .success(function (data, status, headers, config) {
          DataService.success(data.message);
          deferred.resolve(data.result);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }
  }
})();
