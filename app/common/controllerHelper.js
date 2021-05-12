var constants = require('./constants'),
  Filer = require('./filer'),
  logger = require('../logger');

var ControllerHelper = function(res) {

  /********
  sendErrorResponse is used to send the error response message
  ********/

  var sendErrorResponse = function(err) {
    res.status(constants.httpCodeArr.indexOf(err.code) >= 0 ? err.code : constants.httpCodes.internalServerError).send(err.message || err);
  };

  /********
  sendResponse is used to send response and result if available
  ********/

  var sendResponse = function(code, result) {
    res.status(code || constants.httpCodes.success).send(result);
  };

  /********
  download is used to download some file. result will contains only the path
  ********/

  var download = function(result, noDelete) {
    res.download(result, function(err) {
      if (!err && !noDelete) new Filer().deleteFile(result);
    });
  };

  /********
  sendFile send the file along with the object
  ********/

  var sendFile = function(file, path) {
    res.sendFile(file, {
      root: path
    });
  };

  /********
  writeFile is writes the file to be sent
  ********/

  var writeFile = function(file, type) {
    res.write(file, type);
    res.end();
  };

  /********
  setHeader is sets a single header value for implicit headers
  ********/

  var setHeader = function(name, value) {
    res.setHeader(name, value);
  };

  var sendHtml = function(code, result) {
    res.writeHead(code, {
      'Content-Type': 'text/html'
    });
    res.end(result);
  };

  return {
    sendResponse: sendResponse,
    sendErrorResponse: sendErrorResponse,
    download: download,
    sendFile: sendFile,
    writeFile: writeFile,
    setHeader: setHeader,
    sendHtml: sendHtml
  };
};

module.exports = ControllerHelper;