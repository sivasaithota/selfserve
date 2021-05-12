(function () {
	'use strict';

	// GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
	angular
		.module('commonApp')
		.factory('ScenarioSetService', ScenarioSetService);

	// RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
	ScenarioSetService.$inject = ['requestService', '$q', 'DataService', 'tMessages'];

	// A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
	function ScenarioSetService(requestService, $q, DataService, tMessages) {
		// the callable members of the service
		return {
			getSettings: getSettings,
			getActions: getActions,
			getTriggers: getTriggers,
			getAppDetails: getAppDetails,
			saveSettings: saveSettings,
			releaseLock: releaseLock,
			lockSwitch: lockSwitch,
			getHelpSettings: getHelpSettings,
			uploadPage: uploadPage,
			getTabView: getTabView,
			updateTabView: updateTabView,
		};

		// $q - a service that helps you run functions asynchronously,
		// and use their return values (or exceptions) when they are done processing.
		// $q.defer() call construction a new instance of deferred
		// .resolve(value) - resolves the derived promise with the value
		// .reject(reason) – rejects the derived promise with the reason
		// .promise - this method returns a new promise which is resolved or rejected

		// Fetching data from setting table
		// Param is comma separated keys of settings
		// If param is not defined, all the settings will be fetched
        function getSettings(params) {
            var deferred = $q.defer();
            requestService.get('./setting?keys=' + params.keys +
                (angular.isDefined(params.templateID) ? '&scenario_template_id=' + params.templateID : '') +
                (params.scenarioID ? '&scenario_id=' + params.scenarioID : ''))
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (error) {
                    DataService.error(error);
                    deferred.reject(error);
                });
            return deferred.promise;
        }

		function getActions() {
			var deferred = $q.defer();
			requestService.get('./actions')
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (error) {
					DataService.error(error);
					deferred.reject(error);
				});
			return deferred.promise;
		}

		function getTriggers() {
			var deferred = $q.defer();
			requestService.get('./actions/triggers')
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (error) {
					DataService.error(error);
					deferred.reject(error);
				});
			return deferred.promise;
		}

		function getAppDetails() {
			var deferred = $q.defer();
			requestService.get('./setting/details')
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (error) {
					DataService.error(error);
					deferred.reject(error);
				});
			return deferred.promise;
		}

		function saveSettings(settings) {
			var deferred = $q.defer();
			requestService.put('./setting', settings)
				.success(function (data) {
					deferred.resolve(data.result);
				})
				.error(function (error) {
					DataService.error(error);
					deferred.reject(error);
				});
			return deferred.promise;
		}

		function releaseLock() {
			var deferred = $q.defer();
			requestService.delete('./locking')
				.success(function (data, status, headers, config) {
					DataService.success(tMessages.getSettings().deleteLocking);
					deferred.resolve();
				})
				.error(function (data, status, headers, config) {
					DataService.error(data);
					deferred.reject(data);
				});
			return deferred.promise;
		}
		function lockSwitch(request) {
			var deferred = $q.defer();
			requestService.put('./locking/switch', request)
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (error) {
					DataService.error(error);
					deferred.reject(error);
				});
			return deferred.promise;
		}

		// Fetching settings table for the passed template ID and help settings not depending on the template
		// (template ID = 0)
		function getHelpSettings(param) {
			var deferred = $q.defer();
			requestService.get('./setting?keys=helpPageStatus,helpPageName' +
					(param.templateID ? '&scenario_template_id=' + '0,' + param.templateID : '') +
					(param.scenarioID ? '&scenario_id=' + param.scenarioID : ''))
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (err) {
					DataService.error(err);
					deferred.reject(err);
				});
			return deferred.promise;
		}

		function uploadPage (file) {
			var deferred = $q.defer();
			var fd = new FormData();
			fd.append('file', file);
			fd.append('type', 'file');
			fd.append('dirName', 'ds');
			requestService.post('./setting/uploadpage', fd, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
				})
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (err) {
					deferred.reject(err);
				});
			return deferred.promise;
		}

		// Fetching tab view
		function getTabView(params) {
			var deferred = $q.defer();
			var url = './setting/tabView?templateID=' + params.templateID;
			if (params.type) url += '&type=' + params.type;

			requestService.get(url).success(function (data) {
				deferred.resolve(data);
			}).error(function (data) {
				DataService.error(data);
				deferred.reject(data);
			});

			return deferred.promise;
		}

		function updateTabView(tabs) {
			var deferred = $q.defer();
			requestService.put('./setting/tabView', tabs)
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (error) {
					DataService.error(error, 'settings');
					deferred.reject(error);
				});
			return deferred.promise;
		}
	}
})();
