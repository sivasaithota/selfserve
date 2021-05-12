var exec = require('child_process').exec,
  logger = require('../logger'),
  Bluebird = require('bluebird');

var processConfig = require('config').get('childProcess');

var Executor = function () {
  var execute = function (command) {
    return new Bluebird(function (resolve, reject) {
      var execution = exec(command, {
          maxBuffer: processConfig.maxBuffer
        }),
        logData = '';
      execution.stdout.on('data', function (data) {
        logData += data;
      });
      execution.stderr.on('data', function (data) {
        logData += data;
      });
      execution.on('exit', function (code) {
        logger.info('common', 'Executor child process got exited', code);
        code === 0 ? resolve(logData) : reject(logData);
      });
      execution.on('error', function (err) {
        logger.error('common', 'Error in Executor child process', logData);
      });
      execution.on('close', function (code) {
        logger.warning('common', 'Executor child process got closed', logData);
      });
    });
  };

  return {
    execute: execute
  };
};


module.exports = Executor;
