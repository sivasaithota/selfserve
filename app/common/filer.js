var fs = require('fs-extra'),
  Bluebird = require('bluebird'),
  logger = require('../logger');

var Filer = function () {};

/********
readFile is used to read data from the filePath
********/

Filer.prototype.readFile = function (filePath) {
  return new Bluebird(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/********
writeToFile is used to write data  to the filePath
********/

Filer.prototype.writeToFile = function (filePath, data) {
  return new Bluebird(function (resolve, reject) {
    fs.writeFile(filePath, data, 'utf-8', function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/********
copyFile is used to copy file from source to destination
********/

Filer.prototype.copyFile = function (sourcePath, destPath) {
  return new Bluebird(function (resolve, reject) {
    fs.copy(sourcePath, destPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/********
fileExist is used to check whether the file exist for the given filepath
********/

Filer.prototype.fileExist = function (filePath, throwException = true) {
  return new Bluebird(function (resolve, reject) {
    fs.stat(filePath, function (err, stat) {
      if (err) {
        if (throwException) {
          reject(false);
        } else {
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  });
};

Filer.prototype.deleteFile = function (filePath) {
  return new Bluebird(function (resolve, reject) {
    fs.unlink(filePath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


/*****
Used to create write stream for writing files.
*****/

Filer.prototype.createWriteStream = function (filePath) {
  return fs.createWriteStream(filePath);
};

/*****
Used to check file exist in sync approach
*****/

Filer.prototype.fileExistSync = function (filePath) {
  return fs.existsSync(filePath);
};

/*****
used to create read stream to read file  chunk of lines at a time, not altogether
*****/

Filer.prototype.createReadStream = function (filePath) {
  return fs.createReadStream(filePath);
};


/*****
Function to make a directory.
*****/
Filer.prototype.makeDirectory = function (path, permissions) {
  return new Bluebird(function (resolve, reject) {
    fs.mkdir(path, { recursive: true, mode: permissions }, function (err, stst) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/*****
Used to get all files from  a given path
*****/

Filer.prototype.getAllFiles = function (filepath) {
  return this.getAll(filepath)
    .then(function (files) {
      var fileArr = [];
      files.forEach(function (file) {
        if (!fs.lstatSync(filepath + '/' + file).isDirectory()) {
          fileArr.push(file);
        }
      })
      return (fileArr);
    });
};

/*****
Used to get all dirs from  a given path
*****/

Filer.prototype.getAllDirs = function (dirpath) {
  return this.getAll(dirpath)
    .then(function (dirs) {
      var dirArr = [];
      dirs.forEach(function (dir) {
        if (fs.lstatSync(dirpath + '/' + dir).isDirectory()) {
          dirArr.push(dir);
        }
      })
      return dirArr;
    });
};

Filer.prototype.getAll = function (dirpath) {
  return new Bluebird(function (resolve, reject) {
    fs.readdir(dirpath, function (err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

/*****
Used to delete a folder
*****/

Filer.prototype.deleteFolder = function (folderPath) {
  return new Bluebird(function (resolve, reject) {
    fs.remove(folderPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

Filer.prototype.deleteFileIfExist = function (filePath) {
  return new Bluebird(function (resolve, reject) {
    if (this.fileExistSync(filePath)) {
      fs.unlink(filePath, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  }.bind(this));
};

module.exports = Filer;
