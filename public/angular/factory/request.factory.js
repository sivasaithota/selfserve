(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .factory('requestService', requestService);

  requestService.$inject = ['$http'];

  function requestService ($http) {
    var service = {
      get: getRequest,
      post: postRequest,
      put: putRequest,
      delete: deleteRequest
    };
    return service;

    function getRequest (url, header) {
      return $http.get(url, header);
    }

    function postRequest (url, data, header) {
      return $http.post(url, data, header);
    }

    function putRequest (url, header) {
      return $http.put(url, header);
    }

    function deleteRequest (url) {
      return $http.delete(url);
    }
  }
})();
