(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('TableService', TableService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  TableService.$inject = ['requestService', '$q', '$rootScope', '$location', 'UserService', 'DataService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TableService(requestService, $q, $rootScope, $location, UserService, DataService) {
    // the callable members of the service
    return {
      uploadFile: uploadFile,
      getTables: getTables,
      getPDF: getPDF,
      downloadTabs: downloadTabs,
      downloadTable: downloadTable,
      downloadFile: downloadFile,
      getResourceCount: getResourceCount,
    };

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    // Uploading file to the server
    // The 3rd param is the function called on upload progress change
    function uploadFile(data, form, uploadProgressCallback) {
      var deferred = $q.defer();
      var xhr = new XMLHttpRequest();

      // Tracking the upload progress
      xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
          // Progress in %
          uploadProgressCallback(Math.round(event.loaded / event.total * 100));
        }
      });

      // Listener on the upload finish event
      xhr.addEventListener("load", function (event) {
        if (event.target.status === 200) {
          deferred.resolve(JSON.parse(event.target.response));
        } else {
          deferred.reject({
            message: event.target.response,
            status: event.target.status
          });
        }
      });

      // Listener on the upload error event
      xhr.addEventListener("error", function (event) {
        deferred.reject({
          message: event.target.response,
          status: 400
        });
      });

      // Performing a POST request with adding token header
      xhr.open("POST", './scenario/' + data.scenarioID + '/grid/upload/' + (data.zip ? 'zip/' : ''));
      xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
      xhr.send(form);

      return deferred.promise;
    }

    function getTables(type, pid, userId) {
      var deferred = $q.defer();
      requestService.get('./scenario/tables/' + type + '/' + pid + '?userId=' + userId)
        .success(function (data, status, headers, config) {
          angular.forEach(data, function (value, key) {
            if (!_.isNull(value.tag.match(/untagged/i))) {
              value.tag = value.tag.toLowerCase();
            }
          });
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function getResourceCount(pid, userId) {
      var deferred = $q.defer();
      requestService.get('./scenario/count/resource/' + pid + '?userId=' + userId)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function getPDF(pid, pdfWidth, pdfHeight, delay) {
      var deferred = $q.defer();

      requestService.get('./scenario/output/pdf/' + pid +
        '?width=' + pdfWidth + '&height=' + pdfHeight+ '&delay=' + delay, {
        responseType: 'arraybuffer'
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
        DataService.error(decodedString);
        deferred.reject(data);
      });

      return deferred.promise;
    }

    function downloadTabs(pid, type, useDisplayName) {
      var deferred = $q.defer();
      var cookieObject = UserService.getUserInfo();
      requestService.get('./scenario/tables/download/' + type + '/' + pid + '/' + useDisplayName + '?userId=' + cookieObject.id, {
          responseType: "arraybuffer"
        })
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (data) {
          var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
          DataService.error(decodedString);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    // Downloading table from the DB
    function downloadTable(pid, tableName, type, filter) {
      var deferred = $q.defer();
      requestService.get('./scenario/grid/download/?scenarioId=' + pid +
          '&tablename=' + tableName + '&type=' + type + '&filters=' + filter, {responseType: "arraybuffer"})
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (data) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    // This function get the arrayBuffer data and download it directly as whatever the file type we want.
    function downloadFile(data, name, type) {
      if (!type) {
        type = 'application/zip';
      }
      var blob = new Blob([data], {
        type : type
      });
      saveAs(blob, name);
    }
  }
})();
