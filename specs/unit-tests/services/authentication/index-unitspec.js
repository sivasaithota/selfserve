var authService = require('../../../../app/services/authentication').getInstance(),
	DALMock = require('../../mocks/dalMock'),
	authData = require('./data.js'),
	constants = require('../../../../app/common/constants'),
	Hashing = require('../../../../app/common/hashing'),
	systemConfig = require('../../../../app/systemConfig.json'),
	TokenGenerator = require('../../../../app/common/tokenGenerator');

describe('authentication service', function () {
	var dalMock;

	beforeAll(function () {
		dalMock = new DALMock();
	});

	afterAll(function () {
		dalMock = null;
	});

	describe('verify login', function () {

		it('should validate user info and generate token and user object', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, authData.userData, false);
			authService.verifyLogin(authData.userObject)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(JSON.stringify(result.user)).toEqual(JSON.stringify(authData.successLoginReturnObject.user));
					done();
				})
				.catch(function (err) {
					expect('This should not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error for incorrect username and password.', function (done) {
			dalMock.setupMockData(dalMock.mockedFunctions.execute, authData.invalidUserData, false);
			authService.verifyLogin(authData.userObject)
				.then(function (result) {
					expect('This shoud not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect('This should be reached').toBeTruthy();
					expect(err.message).toEqual('Incorrect username or password!');
					done();
				});
		});

	});

	describe('authenticate token', function () {

		it('should validate the token and return the user object', function (done) {
			var hashing = new Hashing(),
				tokenGenerator = new TokenGenerator(),
				hashedPassword = hashing.encrypt(systemConfig.hashing.secretKeys.passwordHashSecret + authData.userObject.username.toLocaleLowerCase(), authData.userObject.password),
				token = tokenGenerator.generateToken({
					uid: 1,
					pwd: hashedPassword
				});
			dalMock.setupMockData(dalMock.mockedFunctions.execute, authData.userData, false);
			authService.authenticateToken(token)
				.then(function (result) {
					expect(result).toBeDefined();
					expect(result.username).toEqual(authData.tokenResultObject.username);
					expect(result.admin).toEqual(authData.tokenResultObject.admin);
					expect(result.role).toEqual(authData.tokenResultObject.role);
					expect(result.home_page).toEqual(authData.tokenResultObject.home_page);
					expect(result.id).toEqual(authData.tokenResultObject.id);
					expect(result.companyName).toEqual(authData.tokenResultObject.companyName);
					expect(result.scenarios).toEqual(authData.tokenResultObject.scenarios);
					expect(JSON.stringify(result.functions)).toEqual(JSON.stringify(authData.tokenResultObject.functions));
					done();
				})
				.catch(function (err) {
					console.log('Error...', err);
					expect('This shoud not be reached').not.toBeTruthy();
					done();
				});
		});

		it('should throw error for expired token', function (done) {
			authService.authenticateToken(authData.expiredToken)
				.then(function () {
					expect('This shoud not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.code).toEqual(constants.httpCodes.unauthorized);
					expect(err.message).toEqual(constants.authentication.tokenExpired);
					done();
				});
		});

		it('should throw error for invalid token', function (done) {
			authService.authenticateToken(authData.invalidToken)
				.then(function () {
					expect('This shoud not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.code).toEqual(constants.httpCodes.unauthorized);
					expect(err.message).toEqual(constants.authentication.inValidToken);
					done();
				});
		});

		it('should validate the token and throw error if user object not found', function (done) {
			var hashing = new Hashing(),
				tokenGenerator = new TokenGenerator(),
				hashedPassword = hashing.encrypt(systemConfig.hashing.secretKeys.passwordHashSecret + authData.userObject.username.toLocaleLowerCase(), authData.userObject.password),
				token = tokenGenerator.generateToken({
					uid: 2,
					pwd: hashedPassword
				});
			dalMock.setupMockData(dalMock.mockedFunctions.execute, authData.invalidUserData, false);
			authService.authenticateToken(token)
				.then(function () {
					expect('This shoud not be reached').not.toBeTruthy();
					done();
				})
				.catch(function (err) {
					expect(err).toBeDefined();
					expect(err.code).toEqual(constants.httpCodes.notFound);
					expect(err.message).toEqual(constants.authentication.userNotFound);
					done();
				});
		});
	});

});
