var mongoClient = require('../../app/dataAccess/mongo'),
	constants = require('../../app/common/constants'),
	logger = require('../../app/logger');

var MongoUpdator = function () {

	var clearLogs = function (appId) {
		var containerNames = [];
		logger.info('common', 'Fetching Container Names for AppId...' + appId);
		return mongoClient.find(constants.dbConstants.databases.fluentD, 'logStatus', {
				appId: appId
			}, {
				"jobId": 1
			})
			.then(function (logObjects) {
				for (var iLog = 0; iLog < logObjects.length; iLog++) {
					containerNames.push('/' + logObjects[iLog].jobId);
				}
				logger.info('common', 'Removing logs for the containers...', containerNames);
				return mongoClient.deleteMany(constants.dbConstants.databases.fluentD, , 'logs', {
					container_name: {
						$in: containerNames
					}
				});
			})
			.then(function () {
				logger.info('common', 'Removing logstatus for the app...', appId);
				return mongoClient.deleteMany(constants.dbConstants.databases.fluentD, 'logStatus', {
					appId: appId
				});
			});
	};

	return {
		clearLogs: clearLogs
	};
};

module.exports = MongoUpdator;
