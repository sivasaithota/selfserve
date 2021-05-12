var Bluebird = require('bluebird');

var authController = require('../../../../app/controllers/authentication').getInstance(),
  authService = require('../../../../app/services/authentication').getInstance(),
  constants = require('../../../../app/common/constants'),
  data = require('./data');


describe('Authentication Controller', function () {

  describe('login', function () {

    it('should login and return user object', function (done) {
      spyOn(authService, 'verifyLogin').and.callFake(function () {
        return Bluebird.resolve(data.userResult);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.userResult));
          done();
        }
      };
      authController.login(data.userObject, res);
    });

    it('should throw error when username and password is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.authentication.userObjectNotFound);
          done();
        }
      };
      authController.login({}, res);
    });

    it('should throw error when  username is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.authentication.usernameNotFound);
          done();
        }
      };
      authController.login(data.userObject2, res);
    });

    it('should throw error when  password is not passed', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.authentication.passwordNotFound);
          done();
        }
      };
      authController.login(data.userObject3, res);
    });

  });

  describe('authenticate', function () {

    it('should return the user object is token is valid', function (done) {
      spyOn(authService, 'authenticateToken').and.callFake(function () {
        return Bluebird.resolve(data.tokenResultObject);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect('This should be reached').toBeTruthy();
          done();
        }
      };
      authController.authenticate(data.tokenObject, res);
    });

    it('should return bad request when token is not passed ', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.authentication.tokenNotFound);
          done();
        }
      };
      authController.authenticate({}, res);
    });

  });

});
