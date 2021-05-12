var Bluebird = require('bluebird');

var settingService = require('../../../../app/services/setting').getInstance(),
  DALMock = require('../../mocks/dalMock'),
  settingData = require('./data.js'),
  Filer = require('../../../../app/common/filer'),
  constants = require('../../../../app/common/constants');

describe('Setting Service', function () {

  var dalMock;

  beforeAll(function () {
    dalMock = new DALMock();
  });

  afterAll(function () {
    dalMock = null;
  });

  describe('save setting', function () {
    it('should throw error if empty setting object is passed', function (done) {
      settingService.saveSettings()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should be reached').toBeTruthy();
          done();
        });
    });

    it('should update the setting for command to execute', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      settingService.saveSettings(settingData.saveSettingObject)
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should update the setting as well custom action if refresh object exist', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData1, false);
      settingService.saveSettings(settingData.saveSettingObject2)
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should update the setting as well custom action if refresh object and validation object exist', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData1, false);
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      settingService.saveSettings(settingData.saveSettingObject3)
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('get settings', function () {
    it('should return the settings', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getSettingsObject, false);
      settingService.getSettings()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getSettingsObject.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should not return settings if it does not exist', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, false);
      settingService.getSettings()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('Get commands', function () {
    it('Should return an array of commands', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getCommandsObject, false);
      settingService.getCommands()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result.length).toEqual(4);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getCommandsObject.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('Get list of scripts', function () {
    it('Should return an array scripts', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getScriptsObject, false);
      settingService.getScripts()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getScriptsObject.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('upload scripts', function () {
    it('should upload the script file and update database', function (done) {
      spyOn(Filer.prototype, 'copyFile').and.callFake(function () {
        return Bluebird.resolve({});
      });
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.updateUploadSettingsObject, false);
      settingService.upload(settingData.uploadObject)
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should throw error if file does not exist', function (done) {
      spyOn(Filer.prototype, 'copyFile').and.callFake(function () {
        return Bluebird.reject('File not exist');
      });
      settingService.upload(settingData.uploadObject)
        .then(function (result) {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached').toBeTruthy();
          done();
        });
    });
  });

  describe('Get app name', function () {
    it('Should return an array consisting of the app name', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getAppNameReturnObject, false);
      settingService.getAppName()
        .then(function (result) {
          console.log('Result ', result);
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result).toEqual(settingData.getAppNameObject);
          done();
        })
        .catch(function (err) {
          console.log('Error: ', err);
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('Get HTML', function () {
    it('Should return an array consisting of html value', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getHtmlReturnObject, false);
      settingService.html()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result).toEqual(settingData.getHtmlObject);
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('Should return an empty array', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getNoObject, false);
      settingService.getAppName()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('Get Tableau settings', function () {
    it('Get both input and output settings', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getTableauInOutObject, false);
      settingService.getTableau()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result.length).toEqual(2);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getTableauInOutObject.rows));
          done();
        })
        .catch(function (err) {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('Get input settings', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getTableauInputObject, false);
      settingService.getTableau()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result.length).toEqual(1);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getTableauInputObject.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('Get output settings', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getTableauOutputObject, false);
      settingService.getTableau()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          expect(result.length).toEqual(1);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(settingData.getTableauOutputObject.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('Should return an empty array', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.getNoObject, false);
      settingService.getTableau()
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result).toBeDefined();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
  });

  describe('Delete tableau', function () {
    it('Should delete the tableau entry based on id passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      settingService.deleteTableau('1')
        .then(function () {
          expect('This should be reached.').toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('Should throw error for wrong tableau id while deleting', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData1, false);
      settingService.deleteTableau('1')
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached.').toBeTruthy();
          expect(err.message).toEqual('Unable to delete tableau. Please try again.');
          done();
        });
    });
    it('should throw error when user id not passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, 'sql query is wrong', true);
      settingService.deleteTableau()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect(err.toString()).toEqual('sql query is wrong');
          done();
        });
    });
  });

  describe('Edit Tableau', function () {
    it('should update tableau if correct id is passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData, false);
      settingService.editTableau(settingData.validEditTableauObject)
        .then(function () {
          expect('This should be reached').toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });
    it('should throw error if wrong id is passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.saveSettingData1, false);
      settingService.editTableau(settingData.invalidEditTableauObject)
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached').toBeTruthy();
          expect(err.message).toEqual('Tableau setting not found to edit.');
          done();
        });
    });
    it('should throw error if object is passed', function (done) {
      settingService.editTableau()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached').toBeTruthy();
          done();
        });
    });
    it('should throw error if no parameters in object is persent', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, 'Tableau id not found', true);
      settingService.editTableau(settingData.invalidEditTableauObject)
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached').toBeTruthy();
          done();
        });
    });
  });

  describe('Adding Tableau', function () {
    it('should be able to add tableau by passing type', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, settingData.addTableauReturnObject, false);
      settingService.addTableau('input')
        .then(function (result) {
          expect('This should be reached').toBeTruthy();
          expect(result.id).toEqual(1);
          done();
        })
        .catch(function (err) {
          expect('This should not be reached.').not.toBeTruthy();
          done();
        });
    });

    it('should throw error if type does not exist while adding tableau', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, false);
      settingService.addTableau()
        .then(function (result) {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should be reached.').toBeTruthy();
          done();
        });
    });
  });
});
