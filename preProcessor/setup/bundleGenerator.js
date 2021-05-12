var fs = require('fs'),
	path = require('path'),
	Bluebird = require('bluebird');

var logger = require('../../app/logger');

var BundleGenerator = function () {

	var encoding = 'utf-8';

	var readAllFiles = function (filesPath, type) {
		var fileContents = '';
		filesPath.forEach(function (fileInfo) {
			// Retrieve path of one file at a time.
			var filePath = path.resolve(__dirname, fileInfo['file']);
			logger.info('common', 'Reading file...', {
				Filepath: filePath
			});
			// Check if file exists and type of deployment.
			if (fs.existsSync(filePath) && fileInfo[type]) {
				fileContents += '/** ' + filePath + ' **/\n\n';
				fileContents += fs.readFileSync(filePath, encoding) + '\n\n\n'; //Read the file.
				logger.info('common', 'Successfully read file.');
			}
		});
		return fileContents;
	};

	/*****
	Function to write to the bundle file.
	*****/

	var writeToBundle = function (fileContents, bundleFilePath) {
		var destFileName = path.resolve(__dirname, bundleFilePath);
		fs.writeFileSync(destFileName, fileContents, encoding); //Write the contents of the file read.
		logger.info('common', 'Bundle file generated successfully.', {
			FileName: destFileName
		});
	};

	/*****
	Function to bundle all queries.
	*****/

	var bundle = function (sqlFiles, bundleFile, type) {
		return new Bluebird(function (resolve, reject) {
			logger.info('common', 'Reading process started.');
			var fileContents = readAllFiles(sqlFiles, type); //Retrieve contents of the files specified.
			logger.info('common', 'Writing process started...');
			writeToBundle(fileContents, bundleFile); //Call function to write the contents read.
			resolve();
		});
	};

	return {
		bundle: bundle
	};

};

module.exports = BundleGenerator;
