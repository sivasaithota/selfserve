var exec = require('child_process').exec,
	Bluebird = require('bluebird');

var processConfig = require('config').get('childProcess');
var logger = require('../../app/logger');

var CommandExecutor = function () {

	/*****
  Function to execute the command passed as parameter.
  *****/

	var execute = function (command) {
		logger.info('common', 'Executing command...', {
			Command: command
		});

		return new Bluebird(function (resolve, reject) {

			var execution = exec(command, {
					maxBuffer: processConfig.maxBuffer
				}),
				hasError = false,
				logData = '';

			execution.stdout.on('data', function (data) {
				logger.info('common', 'Data', {
					Data: data
				});
				logData += data;
			});

			execution.on('exit', function (code) {
				logger.info('common', 'Execution completed.', {
					Code: code
				});
				if (hasError) {
					logger.error('common', 'Error in execution!', {
						err: logData
					});
					reject({
						code: constants.httpCodes.internalServerError,
						message: logData
					})
				} else {
					logger.info('common', 'Successfully executed code.');
					resolve(logData);
				}

			});

			execution.stderr.on('data', function (data) {
				logger.warning('common', 'Warning!', {
					Error: data
				});
				logData += data;
			});
		});
	}
	return {
		execute: execute
	};
};

module.exports = CommandExecutor;
