'use strict';
var Formidable = require('formidable');

var constants = require('../../common/constants'),
  logger = require('../../logger');

var MultiPartParser = function () {};

/*****
Function to parse the uploaded files.
*****/

MultiPartParser.prototype.parseData = function (req, res, next) {
  var form = new Formidable.IncomingForm();
  form.keepExtensions = true;
  // Allows uploading multiple files
  /*****
  Note:
  If multiple files are uploaded , Its sent as an array. For single file its the same
  *****/
  form.multiples = true;
  form.parse(req, function (err, fields, files) {
    if (err) {
      logger.error(req.appData.appId, 'Error parsing!', err);
      res.status(constants.httpCodes.badRequest).send(constants.multiPartParser.parseError);
    } else {
      _attachObject(req, fields);
      _attachObject(req, files);
      next();
    }
  });
};

var _attachObject = function (req, object) {
  for (var key in object) { // jshint ignore:line
    req.body[key] = object[key];
  }
};

module.exports = MultiPartParser;
