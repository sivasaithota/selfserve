var Bluebird = require('bluebird'),
  request = require('request');

var Request = function () {

  var makeRequest = function (options) {
    return new Bluebird(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  };
  return {
    makeRequest: makeRequest
  };
};

module.exports = Request;
