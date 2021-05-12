"use strict";
var serverConfig = require('config').get('server');
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  http = require('http'),
  logger = require('./logger'),
  socketHandler = require('./socket');

var Routes = require('./middleware/routes'),
  ControllerHelper = require('./common/controllerHelper');

var changeStream = require('./dataAccess/changeStream');

var routes = new Routes();
var server = http.createServer(app);

server.timeout = 0; //set server timeout to infinity.

//to run Tableau extract in http
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

changeStream.watchAppData();

app.use(bodyParser.json({
  limit: '100mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.set('views', './public/views');
app.set('view engine', 'ejs');

app.use("/", routes);

app.use(function (error, req, res, next) {
  //Catch json error
  new ControllerHelper(res).sendErrorResponse(error);
});

server.listen(serverConfig.port, function (err) {
  if (err) {
    logger.fatal('common', 'Error while starting server...', err);
  } else {
    logger.info('common', 'Server started and listening on Port:', serverConfig.port);
    socketHandler.start();
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error('common', 'unhandledRejection....', reason);
});
