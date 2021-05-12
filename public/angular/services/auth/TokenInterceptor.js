(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('TokenInterceptor', TokenInterceptor);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  TokenInterceptor.$inject = ['$rootScope', '$q', '$injector', '$location', 'localStorageService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TokenInterceptor ($rootScope, $q, $injector, $location, localStorageService) {
    // the callable members of the service
    var service = {
      request: request,
      requestError: requestError,
      response: response,
      responseError: responseError
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
      // .resolve(value) - resolves the derived promise with the value
      // .reject(reason) – rejects the derived promise with the reason
      // .promise - this method returns a new promise which is resolved or rejected

    function request (config) {
      config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
      config.headers = config.headers || {};
      return config;
    }

    function requestError (rejection) {
      return $q.reject(rejection);
    }

    function response (response) {
      return response || $q.when(response);
    }

    function responseError (rejection) {
      var tokenMessage = 'Please login to the application';
      var isTokenError = rejection.status === 403 && rejection.data.indexOf(tokenMessage) >= 0;
      var isInactiveError = rejection.status === 420;
      if (isTokenError || rejection.status === 401) {
        localStorageService.remove($location.absUrl().split('/#')[0]);
        $injector.get('$state').transitionTo('login');
      }
      if (isInactiveError) {
        $rootScope.appName = rejection.data.data.name;
        if ($injector.get('$state').current.name !== 'inactive') $injector.get('$state').transitionTo('inactive');
      }
      return $q.reject(rejection);
    }
  }
})();
