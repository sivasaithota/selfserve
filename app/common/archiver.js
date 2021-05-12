var archiver = require('archiver'),
  targz = require('targz'),
  Bluebird = require('bluebird');

var Filer = require('./filer');

var Archiver = function() {

  var archive = archiver('zip', {
    store: true
  });

  var generateZip = function(filePath) {
    return new Bluebird(function(resolve, reject) {
      var output = new Filer().createWriteStream(filePath);
      output.on('close', function() {
        resolve();
      });
      archive.on('error', function(err) {
        reject(err);
      });
      archive.pipe(output);
      archive.finalize();
    });
  };

  var appendFile = function(filepath, fileObject) {
    archive.file(filepath, fileObject);
  };

  var appendDirectory = function(dirpath, newDirpath) {
    archive.directory(dirpath, newDirpath);
  };


  var append = function(content, contentObject) {
    archive.append(content, contentObject)
  };

  var tarCompress = function(source, destination) {
    return new Bluebird(function(resolve, reject) {
      targz.compress({
        src: source,
        dest: destination
      }, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  };

  return {
    generateZip: generateZip,
    appendDirectory: appendDirectory,
    appendFile: appendFile,
    append: append,
    tarCompress: tarCompress
  };
};

module.exports = Archiver;