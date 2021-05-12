var Bluebird = require('bluebird');

var executionController = require('../../../../app/controllers/execution').getInstance(),
  executionService = require('../../../../app/services/execution').getInstance(),
  constants = require('../../../../app/common/constants'),
  data = require('./data.js');

describe('execution Controller', function () {
  describe('execute', function () {

    it('should successfully execute script', function (done) {
      spyOn(executionService, 'execute').and.callFake(function () {
        return Bluebird.resolve(data.executionData.rows[0]);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.executionData.rows[0]));
          done();
        }
      };
      executionController.execute(data.executionObject, res);
    });

    it('should throw error with query not found', function (done) {
      spyOn(executionService, 'execute').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.execution.executionTypeNotFound);
          done();
        }
      };
      executionController.execute({}, res);
    });

  });

  describe('history', function () {

    it('should successfully get execute history', function (done) {
      spyOn(executionService, 'executionHistory').and.callFake(function () {
        return Bluebird.resolve(data.historyData.rows);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.historyData.rows));
          done();
        }
      };
      executionController.executionHistory(data.historyObject, res);
    });

  });

  describe('job history', function () {

    it('should successfully get execute job history', function (done) {
      spyOn(executionService, 'executionJobHistory').and.callFake(function () {
        return Bluebird.resolve(data.historyJobData.rows);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.historyJobData.rows));
          done();
        }
      };
      executionController.executionJobHistory(data.historyJobObject, res);
    });

  });

  describe('execution logs', function () {

    it('should successfully get execute logs', function (done) {
      spyOn(executionService, 'executionJobHistory').and.callFake(function () {
        return Bluebird.resolve(data.logsData.rows);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.logsData.rows));
          done();
        }
      };
      executionController.executionJobHistory(data.logsObject, res);
    });

  });
});
