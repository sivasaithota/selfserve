var path = require('path');

var Archiver = require('../../common/archiver');

var Archive = function () {
  var download = function (zipFileName, files, dataPath) {
    var pathToZip = path.resolve(__dirname, dataPath + '/' + zipFileName);
    var archiver = new Archiver();
    // Getting rid of the file path, app and scenario IDs for the file name in archive
    files.forEach(function (file) {
      archiver.appendFile(file, {
        name: file.split('-').pop()
      });
    })
    return archiver.generateZip(pathToZip)
      .then(function () {
        return pathToZip;
      }).catch(function (err) {
        throw err;
      });
  };

  return {
    download: download
  };
};

module.exports = Archive;