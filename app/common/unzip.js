var extract = require('extract-zip'),
  Bluebird = require('bluebird');

var Unzip = function () {};

Unzip.prototype.run = function (source, destination) {
  return new Bluebird(function (resolve, reject) {
    extract(source, {
      dir: destination
    }, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = Unzip;
