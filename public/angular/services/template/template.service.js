(function () {
  'use strict';

  angular
      .module('commonApp')
      .factory('TemplateService', TemplateService);

  TemplateService.$inject = ['requestService', '$q', 'DataService'];

  function TemplateService(requestService, $q, DataService) {
    // the callable members of the service
    return {
      getTemplates: getTemplates
    };

    // fetching all the templates from lkp_scenario_templates table
    function getTemplates() {
      var deferred = $q.defer();
      requestService.get('./template')
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (error) {
            DataService.error(error);
            deferred.reject(error);
          });
      return deferred.promise;
    }
  }
})();
