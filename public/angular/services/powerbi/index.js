(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('PowerBiService', PowerBiService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  PowerBiService.$inject = ['requestService', '$q', 'DataService', 'UserService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function PowerBiService(requestService, $q, DataService, UserService) {
    // the callable members of the service
    return {
      getReports: getReports,
      getReportByType: getReportByType,
      addReport: addReport,
      editReport: editReport,
      deleteReport: deleteReport,
      changeOrder: changeOrder,
      getExtracts: getExtracts,
      saveExtract: saveExtract
    };

    function getReports(parameters) {
      var deferred = $q.defer();
      requestService.get('./powerbi' +
        (parameters.templateID ? '?scenarioTemplateId=' + parameters.templateID : '') +
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

    function getReportByType(templateID, type) {
      var deferred = $q.defer();
      requestService.get('./powerbi/embedUrls?projectId=' + templateID + '&type=' + type +
        '&userId=' + UserService.getUserInfo().id
      )
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function addReport(powerbi) {
      var deferred = $q.defer();
      requestService.post('./powerbi', powerbi)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function editReport(powerbi) {
      var deferred = $q.defer();
      requestService.put('./powerbi/' + powerbi.id, powerbi)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function deleteReport(reportId) {
      var deferred = $q.defer();
      requestService.delete('./powerbi/' + reportId)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function changeOrder(reportId, orderId) {
      var deferred = $q.defer();
      requestService.post('./powerbi/' + reportId + '/changeorder', {
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

    function getExtracts(templateID) {
      var deferred = $q.defer();
      requestService.get('./powerbi/imports?scenarioTemplateId=' + templateID)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function saveExtract(extractId, extractValue) {
      var deferred = $q.defer();
      requestService.put('./powerbi/imports/' + extractId, {
          run_import: extractValue
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
  }
})();
