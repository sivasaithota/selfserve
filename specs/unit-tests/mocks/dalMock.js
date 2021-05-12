var Bluebird = require('bluebird');

var DAL = require('../../../app/dataAccess/postgres');

function DALMock() {

	var mock, mockedFunctions, mockedData = {};
	var dal = DAL.getInstance();
	mockedFunctions = {
		execute: "executeQuery"
	};

	spyOn(dal, mockedFunctions.execute).and.callFake(function () {
		return promiseMock(mockedFunctions.execute);
	});

	function promiseMock(funcname) {
		var mockData = mockedData[funcname].mockData.shift();
		return new Bluebird(function (resolve, reject) {
			if (mockData.isErrorData) {
				reject(mockData.data);
			} else {
				resolve(mockData.data);
			}

		});
	};

	function setupMockData(funcname, data, isErrorData) {
		mockedData[funcname] = mockedData[funcname] || {
			mockData: []
		};
		mockedData[funcname].mockData.push({
			data: data,
			isErrorData: isErrorData
		});
	};

	return {
		setupMockData: setupMockData,
		mockedFunctions: mockedFunctions
	};
};

module.exports = DALMock;
