var Bluebird = require('bluebird');

var userController = require('../../../../app/controllers/user').getInstance(),
  userService = require('../../../../app/services/user').getInstance(),
  constants = require('../../../../app/common/constants'),
  data = require('./data.js');

describe('User Controller', function () {

  describe('add user', function () {

    it('should successfully add a new user', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.successfulCreate);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          done();
        }
      };
      userController.addUser(data.addUserObject, res);
    });

    it('should throw error with username not found', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.usernameNotFound);
          done();
        }
      };
      userController.addUser(data.addUserObjectWithoutUsername, res);
    });

    it('should throw error with email not found', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.emailNotFound);
          done();
        }
      };
      userController.addUser(data.addUserObjectWithoutEmail, res);
    });

    it('should throw error with invalid email', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.invalidEmail);
          done();
        }
      };
      userController.addUser(data.addUserObjectWithInvalidEmail, res);
    });

    it('should throw error with password not found', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.passwordNotFound);
          done();
        }
      };
      userController.addUser(data.addUserObjectWithoutPassword, res);
    });

    it('should throw error with role not found', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.roleNotFound);
          done();
        }
      };
      userController.addUser(data.addUserObjectWithoutRole, res);
    });

    it('should throw error with user object not found', function (done) {
      spyOn(userService, 'addUser').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.userObjectNotFound);
          done();
        }
      };
      userController.addUser({}, res);
    });
  });

  describe('update user', function () {

    it('should update the user', function (done) {
      spyOn(userService, 'updateUser').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result.message).toEqual(constants.user.updateSuccess);
          done();
        }
      };
      userController.updateUser(data.updateUserObject, res);
    });

    it('should throw error with user object not found', function (done) {
      spyOn(userService, 'updateUser').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.updateObjectNotFound);
          done();
        }
      };
      userController.updateUser({}, res);
    });
  });

  describe('scenario access', function () {

    it('should retrieve list of scenario accesses', function (done) {
      spyOn(userService, 'scenarioAccess').and.callFake(function () {
        return Bluebird.resolve(data.scenarioAccessData);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.scenarioAccessData));
          done();
        }
      };
      userController.scenarioAccess(data.scenarioAccessObject, res);
    });

    it('should throw error with access object not found', function (done) {
      spyOn(userService, 'scenarioAccess').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.accessObjectNotFound);
          done();
        }
      };
      userController.scenarioAccess({}, res);
    });

    it('should throw error with scenario ids not found', function (done) {
      spyOn(userService, 'scenarioAccess').and.callFake(function () {
        return Bluebird.reject();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.user.scenarioIdNotFound);
          done();
        }
      };
      userController.scenarioAccess(data.scenarioAccessObjectWithoutScenarioIds, res);
    });

  });

});
