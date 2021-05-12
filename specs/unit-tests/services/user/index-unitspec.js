var userService = require('../../../../app/services/user').getInstance(),
  DALMock = require('../../mocks/dalMock'),
  userData = require('./data.js');

describe('User Service', function () {

  var dalMock;

  beforeAll(function () {
    dalMock = new DALMock();
    console.log('Before all...');
  });

  afterAll(function () {
    dalMock = null;
    console.log('After all...');
  });

  describe('Adding User', function () {

    it('should be able to add user by passing userobject', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.mockData1, false);
      userService.addUser(userData.userObject)
        .then(function (result) {
          expect(result.id).toEqual(1);
          expect(result.username).toEqual(userData.userObject.username);
          expect(result.email).toEqual(userData.userObject.email);
          expect(result.role).toEqual(userData.userObject.role);
          expect(Object.keys(result).length).toEqual(4);
          done();
        })
        .catch(function (err) {
          expect('this should not be reached.').not.toBeTruthy();
          done();
        });
    });

    it('should throw error if any role object does not exist while adding user', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, false);
      userService.addUser(userData.invalidUserObject)
        .then(function (result) {
          expect('this should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('this should be reached.').toBeTruthy();
          done();
        });
    });

  });

  describe('deleting user', function () {

    it('should delete the user based on user id', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.dbUpdateSuccess, false);
      userService.deleteUser('1')
        .then(function () {
          expect('this should be reached.').toBeTruthy();
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should throw error for wrong user id while deleting', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.dbUpdateFailure, false);

      userService.deleteUser('1')
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('this should be reached.').toBeTruthy();
          expect(err.message).toEqual('Error while deleting user. Please try again.');
          done();
        });
    });

    it('should throw error when user id not passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {
        error: 'sql query is wrong'
      }, true);

      userService.deleteUser()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect(err.error).toEqual('sql query is wrong');
          done();
        });
    });

  });

  describe('get all users', function () {

    it('should return all the users', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.getAllUserObjectData, false);
      userService.getAllUser()
        .then(function (result) {
          expect(result).toBeDefined();
          expect(result.length).toEqual(3);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(userData.getAllUserExpectedResult));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should not return users if not exist', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, false);
      userService.getAllUser()
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

  });

  describe('updating user', function () {
    /** need to address in client side **/
  });

  describe('get user', function () {

    it('should return the user based on user id', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.getUserMockData, false);
      userService.getUser('2')
        .then(function (result) {
          expect(result).toBeDefined();
          expect(result.id).toEqual(2);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(userData.getUserResult));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should throw error when user id is not passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, {}, true);
      userService.getUser()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect(err).toBeDefined();
          expect(err.toString()).toEqual('Error: Error while fetching user');
          done();
        });
    });

  });

  describe('get all roles', function () {

    it('should return all roles', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.rolesMockData, false);
      userService.getAllRoles()
        .then(function (result) {
          expect(result).toBeDefined();
          expect(result.length).toEqual(2);
          expect(result).toEqual(userData.rolesMockData.rows);
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

  });

  describe('user scenario access', function () {

    it('should update scenario access for the user id', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.scenarioAccessData, false);
      userService.scenarioAccess('29', [32, 3, 33])
        .then(function (result) {
          expect(result).toBeDefined();
          expect(result.length).toEqual(3);
          expect(JSON.stringify(result)).toEqual(JSON.stringify(userData.scenarioAccessData.rows));
          done();
        })
        .catch(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        });
    });

    it('should not throw error for empty scenario ids', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, userData.scenarioAccessEmptyData, false);
      userService.scenarioAccess('29')
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

    it('should throw error when user id not passed', function (done) {
      dalMock.setupMockData(dalMock.mockedFunctions.execute, 'User id not found', true);
      userService.scenarioAccess()
        .then(function () {
          expect('This should not be reached').not.toBeTruthy();
          done();
        })
        .catch(function (err) {
          expect('This should not be reached').toBeTruthy();
          expect(err.toString()).toEqual('Error: User id not found');
          done();
        });
    });

  });

});
