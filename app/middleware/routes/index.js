var express = require('express'),
  router = express.Router();

var commonMiddleware = require('../common'),
  BaseRouter = require('./base');

module.exports = function () {
  // Fetch metdata from mongo and set as req.appData
  router.use('/apps/:appUrl/', commonMiddleware.setAppData);
  // Path for all routes
  router.use('/apps/:appUrl/', new BaseRouter());
  return router;
};
