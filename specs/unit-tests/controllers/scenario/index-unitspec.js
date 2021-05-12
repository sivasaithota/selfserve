var Bluebird = require('bluebird');

var scenarioController = require('../../../../app/controllers/scenario').getInstance(),
  scenarioService = require('../../../../app/services/scenario').getInstance(),
  constants = require('../../../../app/common/constants'),
  data = require('./data.js');

describe('scenario Controller', function () {

  describe('add scenario', function () {

    it('should successfully add a scenario', function (done) {
      spyOn(scenarioService, 'addScenario').and.callFake(function () {
        return Bluebird.resolve(data.scenarioData.rows[0]);

      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.successfulCreate);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.scenarioData.rows[0]));
          done();
        }
      };
      scenarioController.addScenario(data.addScenarioObject, res);
    });

    it('should throw error with scenario object not found', function (done) {
      spyOn(scenarioService, 'addScenario').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioObjectEmpty);
          done();
        }
      };
      scenarioController.addScenario({}, res);
    });

    it('should throw error with scenario name not found', function (done) {
      spyOn(scenarioService, 'addScenario').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioNameNotFound);
          done();
        }
      };
      scenarioController.addScenario(data.addScenarioObjectWithoutName, res);
    });

  });

  describe('update scenario', function () {

    it('should successfully update scenario', function (done) {
      spyOn(scenarioService, 'updateScenario').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result.message).toEqual(constants.scenario.updateSuccess);
          done();
        }
      };
      scenarioController.updateScenario(data.updateScenarioObject, res);
    });

    it('should return bad request when scenario object not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioObjectEmpty);
          done();
        }
      };
      scenarioController.updateScenario({}, res);
    });

    it('should return bad request when scenario name is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioNameNotFound);
          done();
        }
      };
      scenarioController.updateScenario(data.invalidScenarioObject, res);
    });

  });

  describe('save parameters', function () {

    it('should return bad request if save parameter object is empty', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.saveParameterObjectNotFound);
          done();
        }
      };
      scenarioController.saveParameters({}, res);
    });

    it('should save parameters and send success status', function (done) {
      spyOn(scenarioService, 'saveParameters').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result.status).toEqual(constants.scenario.parameterSuccess);
          done();
        }
      };
      scenarioController.saveParameters(data.saveParameterObject, res);
    });

    it('should return bad request if save parameter object is empty', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.saveParameterObjectNotFound);
          done();
        }
      };
      scenarioController.saveParameters({}, res);
    });

    it('should return bad request if scenario id is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioIdNotFound);
          done();
        }
      };
      scenarioController.saveParameters({
        body: {}
      }, res);
    });

    it('should return bad request if parameter to save is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.paramNotFound);
          done();
        }
      };
      scenarioController.saveParameters(data.invalidParameterObject, res);
    });

    it('should return bad request if parameter id is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.paramIdNotFound);
          done();
        }
      };
      scenarioController.saveParameters(data.invalidParameterObject2, res);
    });

    it('should return bad request if parameter type is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.paramTypeNotFound);
          done();
        }
      };
      scenarioController.saveParameters(data.invalidParameterObject3, res);
    });

    it('should return bad request if parameter name is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.paramNameNotFound);
          done();
        }
      };
      scenarioController.saveParameters(data.invalidParameterObject4, res);
    });

    it('should return bad request if parameter displayname is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.paramDisplayNameNotFound);
          done();
        }
      };
      scenarioController.saveParameters(data.invalidParameterObject5, res);
    });

  });

  describe('get parameters', function () {

    it('should successfully retrieve parameters', function (done) {
      spyOn(scenarioService, 'getParameters').and.callFake(function () {
        return Bluebird.resolve(data.getParametersData.rows);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return res;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.getParametersData.rows));
          done();
        }
      };
      scenarioController.getParameters(data.getParametersObject, res);
    });

    it('should throw error no query string', function (done) {
      spyOn(scenarioService, 'getParameters').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioIdNotFound);
          done();
        }
      };
      scenarioController.getParameters({}, res);
    });

    it('should throw error no query string', function (done) {
      spyOn(scenarioService, 'getParameters').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.scenario.scenarioIdNotFound);
          done();
        }
      };
      scenarioController.getParameters(data.getParametersObjectWithoutScenarioId, res);
    });
  });
});
