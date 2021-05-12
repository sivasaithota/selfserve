var Bluebird = require('bluebird'),
	moment = require('moment');

var scenarioService = require('../../../../app/services/scenario').getInstance(),
	DALMock = require('../../mocks/dalMock'),
	scenarioData = require('./data.js'),
	constants = require('../../../../app/common/constants'),
	Filer = require('../../../../app/common/filer');

describe('Scenario Service', function () {
	var dalMock;

	beforeAll(function () {
		dalMock = new DALMock();
	});

	afterAll(function () {
		dalMock = null;
	});

	describe('get all scenarios', function () {

		it('should fetch all scenario based on role', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.allScenarioData, false);
			scenarioService.getAllScenario({
					role: 'Consultant'
				})
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(2);
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.allScenarioData.rows));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should fetch all scenario based on role business user', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.scenarioData, false);
			scenarioService.getAllScenario({
					role: 'BusinessUser',
					id: 1
				})
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(1);
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.scenarioData.rows));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error if user id not exist on role Analyst_ReadOnly', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'user id not exist', true);
			scenarioService.getAllScenario({
					role: 'Analyst_ReadOnly',
					id: 1
				})
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.toString()).toEqual('Error: user id not exist');
					expect('This should  be reached').toBeTruthy();
					done();
				});
		});

	});

	describe('add scenario', function () {

		it('should add scenario based on scenario object', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.addScenarioData, false);
			return scenarioService.addScenario(scenarioData.addScenarioObject)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(Object.keys(result).length).toEqual(3);
					expect(result.id).toEqual(2);
					expect(result.name).toEqual('Test');
					expect(result.updated_at).toEqual('2017-01-11T05:12:49.292Z');
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error if scenario object is not passed', function (done) {
			scenarioService.addScenario()
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect('This should be reached').toBeTruthy();
					done();
				});
		});

	});

	describe('get scenario', function () {

		it('should return scenario object for the scenario id', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.getScenarioData, false);
			scenarioService.getScenario(1)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.getScenarioData.rows[0]));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error if scenario id is not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id does not exist', true);
			scenarioService.getScenario()
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err.toString()).toEqual('Error: scenario id does not exist');
					expect('This should  be reached').toBeTruthy();
					done();
				});
		});

	});

	describe('update scenario', function () {

		it('should update scenario based on scenario id', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.updateScenarioData, false);
			scenarioService.updateScenario(2, {
					name: 'Tester'
				})
				.then(function () {
					expect('This should be reached').toBeTruthy();
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw database error if scenario id is not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id does not exist', true);
			scenarioService.updateScenario(null, {
					name: 's12'
				})
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toEqual('scenario id does not exist');
					expect('This should not be reached').toBeTruthy();
					done();
				});
		});

		it('should throw  error if scenario id and scenario object to be updated is not passed', function (done) {
			scenarioService.updateScenario()
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect('This should not be reached').toBeTruthy();
					done();
				});
		});

		it('should throw  error if database update is not success', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.updateScenarioData2, false);
			scenarioService.updateScenario(2, {
					name: 's12'
				})
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.code).toEqual(constants.httpCodes.badRequest);
					expect(err.message).toEqual(constants.scenario.scenarioNotFound);
					done();
				});
		});

	});

	describe('copy scenario', function () {

		it('should copy scenario based on scenario id', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.copyScenarioData, false);
			scenarioService.copyScenario('1')
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.copyScenarioData.rows[0]));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw db error if scenario id not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id not exist', true);
			scenarioService.copyScenario()
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err).toEqual('scenario id not exist');
					done();
				});
		});

		it('should throw db error if wrong scenario id is passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id does not exist', true);
			scenarioService.copyScenario('999')
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err).toEqual('scenario id does not exist');
					done();
				});
		});

		it('should throw  error when database execution not success', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, false);
			scenarioService.copyScenario('9')
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.code).toEqual(constants.httpCodes.internalServerError);
					expect(err.message).toEqual(constants.scenario.copyScenarioError);
					done();
				});
		});

	});

	describe('delete scenario', function () {

		it('should delete the scenario based on scenario id', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.deleteScenarioData, false);
			scenarioService.deleteScenario('3')
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});


		});

		it('should throw db error if  scenario id is not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id not found', true);
			scenarioService.deleteScenario()
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err).toEqual('scenario id not found');
					done();
				});
		});

		it('should throw db error if  wrong scenario id is passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id does not exist', true);
			scenarioService.deleteScenario('99')
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err).toEqual('scenario id does not exist');
					done();
				});
		});

	});

	describe('get parameters', function () {

		it('should retreive all parameters for the given scenario id ', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.getParametersData, false);
			scenarioService.getParameters('36')
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(5);
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.getParametersData.rows));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw db error if scenario id not passed ', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'table or view does not exist', true);
			scenarioService.getParameters()
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.toString()).toEqual('Error: table or view does not exist');
					done();
				});
		});

		it('should throw db error if wrong scenario id is passed ', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'table or view does not exist', true);
			scenarioService.getParameters('00')
				.then(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.toString()).toEqual('Error: table or view does not exist');
					done();
				});
		});

	});

	describe('save parameters', function () {

		it('should save parameters based on scenario id and param name and value', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.saveParameterData, false);
			scenarioService.saveParameters('1', scenarioData.parameterObject)
				.then(function (result) {
					expect(result).toBeDefined();
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should not throw error if parameter object passed is empty', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.saveParameterData, false);
			scenarioService.saveParameters('36', [])
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					expect(result).toBeDefined();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

	});

	describe('get tables by type', function () {

		it('should get the table names by scenario id and input type', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.getTablesByTypeData, false);
			scenarioService.getTablesByType('8', 'input')
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(1);
					expect(JSON.stringify(result[0])).toEqual(JSON.stringify(scenarioData.getTablesByTypeData.rows[0]));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should get the table names scenario id for output type', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.emptyTablesData, false);
			scenarioService.getTablesByType('8', 'output')
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(0);
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should not throw error is table type is not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.emptyTablesData, false);
			scenarioService.getTablesByType('8')
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.length).toEqual(0);
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw  db error when scenario id and type not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'scenario id cannot be empty', true);
			scenarioService.getTablesByType()
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.toString()).toEqual('Error: scenario id cannot be empty');
					done();
				});
		});

	});

	describe('Get page info', function () {
		it('should return an array of the 4 pages', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.pageInfoObject, false);
			scenarioService.pageInfo()
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					expect(result).toBeDefined();
					expect(result.length).toEqual(4);
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.pageInfoObject.rows));
					done();
				})
				.catch(function () {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
		});
	});

	describe('Get tableau url', function () {

		it('should be able to get tableau input settings by passing type', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.getTableauInputObject, false);
			scenarioService.tableUrl('input')
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.getTableauInputObject.rows));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached.').not.toBeTruthy();
					done();
				});
		});
		it('should be able to get tableau input settings by passing type', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.getTableauOutputObject, false);
			scenarioService.tableUrl('output')
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.getTableauOutputObject.rows));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached.').not.toBeTruthy();
					done();
				});
		});
		it('should throw error if type does not exist while adding tableau', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Tableau type not passed.', true);
			scenarioService.tableUrl()
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect('This should be reached.').toBeTruthy();
					expect(err.toString()).toEqual('Error: Tableau type not passed.');
					done();
				});
		});

	});

	describe('Edit Grid', function () {

		it('should successfully edit grid data', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.editGridData, false);
			scenarioService.editGridData(scenarioData.editGridInput.scenarioId, scenarioData.editGridInput.tableName, scenarioData.editGridInput.newRow)
				.then(function (result) {
					expect(result).toBeDefined();
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error for empty parameters', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Parameters not passed', true);
			scenarioService.editGridData('', '', {})
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					done();
				})
		});
	});

	describe('Add Grid', function () {

		it('should successfully add a new row to the grid', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.addGridReturnObject1, false);
			scenarioService.addGridData(scenarioData.addGridInput.scenarioId, scenarioData.addGridInput.tableName, scenarioData.addGridInput.newRow)
				.then(function (result) {
					expect('This should be reached').toBeTruthy();
					expect(result).toBeDefined();
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error parameters not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Parameters not passed', true);
			scenarioService.addGridData()
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err.toString()).toEqual('Error: Parameters not passed');
					done();
				})
		});
	});

	describe('Delete Grid', function () {

		it('should successfully delete a row from the grid', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.deleteGridResultObject, false);
			scenarioService.deleteGridData(scenarioData.deleteGridInput.scenarioId, scenarioData.deleteGridInput.tableName, scenarioData.deleteGridInput.rowsId)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.deleteGridResultObject));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error parameters not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Parameters not passed', true);
			scenarioService.deleteGridData(null, null, scenarioData.deleteGridInput.rowsId)
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err.toString()).toEqual('Error: Parameters not passed');
					done();
				})
		});
	});

	describe('Load Grid', function () {
		it('should successfully load the grid', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.loadGridReturnObject1, false);
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.loadGridReturnObject2, false);
			scenarioService.loadGrid(scenarioData.loadGridQueryParams)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.loadGridReturnObject3));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});
	});

	describe('Download Grid', function () {
		it('should successfully download the grid', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.downloadGridReturnObject1, false);
			scenarioService.downloadGridData(scenarioData.downloadGridQueryParams)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.downloadGridReturnObject2));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});
	});

	describe('Update status', function () {
		it('should successfully update after validate', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.updateInputReturnObject, false);
			scenarioService.updateStatus('input_validation', 1, scenarioData.updateInputQueryParams1)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.updateInputReturnObject.rows[0]));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should successfully update after refresh', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, scenarioData.updateTablesReturnObject, false);
			scenarioService.updateStatus('input_refresh', 1, scenarioData.updateInputQueryParams2)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result)).toEqual(JSON.stringify(scenarioData.updateTablesReturnObject.rows[0]));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error parameters not passed', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Parameters not passed', true);
			scenarioService.updateStatus()
				.then(function (result) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err.toString()).toEqual('Error: Parameters not passed');
					done();
				})
		});
	});
});
