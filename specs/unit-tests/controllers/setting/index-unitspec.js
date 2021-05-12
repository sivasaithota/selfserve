var Bluebird = require('bluebird');

var settingController = require('../../../../app/controllers/setting').getInstance(),
  settingService = require('../../../../app/services/setting').getInstance(),
  constants = require('../../../../app/common/constants'),
  data = require('./data.js');

describe('Setting Controller', function () {

  describe('get setting', function () {

    it('should get the setting object and send as success response', function (done) {
      spyOn(settingService, 'getSettings').and.callFake(function () {
        return Bluebird.resolve(data.getSettingObject);
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(data.getSettingObject));
          done();
        }
      };
      settingController.getSettings({}, res);
    });

    it('should throw error with error code and message when failed to get data', function (done) {
      spyOn(settingService, 'getSettings').and.callFake(function () {
        return Bluebird.reject('unable to fetch data');
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.internalServerError);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual('unable to fetch data');
          done();
        }
      };
      settingController.getSettings({}, res);
    });

  });

  describe('save settings', function () {

    it('should save settings and send a success response', function (done) {
      spyOn(settingService, 'saveSettings').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          done();
        }
      };
      settingController.saveSettings(data.validSaveSettingObject, res);
    });
  });

  describe('upload file', function () {

    it('should upload the file and send a success response', function (done) {
      spyOn(settingService, 'upload').and.callFake(function () {
        return Bluebird.resolve();
      });
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.success);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          done();
        }
      };
      settingController.upload(data.uploadObject, res);
    });

    it('should throw error for file not present', function (done) {
      var res = {
        status: function (code) {
          expect(code).toEqual(constants.httpCodes.badRequest);
          return this;
        },
        send: function (result) {
          expect(result).toBeDefined();
          expect(result).toEqual(constants.setting.fileNotFound);
          done();
        }
      };
      settingController.upload(data.uploadObjectWithoutFile, res);
    });

  });

});
