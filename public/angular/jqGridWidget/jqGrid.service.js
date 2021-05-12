(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridWidget')
    .factory('GridService', GridService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  GridService.$inject = ['$q', '$http'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function GridService($q, $http) {
    var service = {
      getData: getData,
      postData: postData
    };

    return service;

    function getData(url) {
			var deferred = $q.defer();
			$http.get(url)
				.success(function(data, status, headers, config) {
					deferred.resolve(data);
				})
				.error(function(err) {
					deferred.reject(err);
				});
			return deferred.promise;
		}

    function postData (url, params) {
      var deferred = $q.defer();
      $http.post(url, params)
        .success(function(data, status, headers, config){
          deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
          deferred.reject(data);
        });
      return deferred.promise;
    }

  }
})();
