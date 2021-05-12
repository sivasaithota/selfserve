var path = require('path');
var fs = require('fs');
var Bluebird = require('bluebird');

var Transformer = require('../../common/converter'),
  constants = require('../../common/constants');

/********
	outpuData() ensures whether the html file exist and return the file path.
********/

var outputData = function(filePath) {
  var html = function(scenarioId) {
    var currentPath = path.resolve(__dirname, filePath);
    return new Bluebird(function(resolve, reject) {
      if (fs.existsSync(currentPath + '/scenario_' + scenarioId + '.html')) {
        resolve(currentPath);
      } else {
        reject({
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.getHtmlError
        });
      }
    });
  };

  /********
  pdf () method is used to transform the htmloutput to pdf and return the pdf file
  it accepts the scenarioid to get the html file
  ********/

  var pdf = function(scenarioId, data) {
    var htmlLink = path.resolve(__dirname, filePath) + '/scenario_' + scenarioId + '.html';
    var pdfLink = path.resolve(__dirname, filePath) + '/scenario_' + scenarioId + '.pdf';
    var transformer = new Transformer();
    return new Bluebird(function(resolve, reject) {
      if (fs.existsSync(pdfLink)) {
        resolve(fs.readFileSync(pdfLink));
      } else if (fs.existsSync(htmlLink)) {
        transformer.convertHtmlToPdf({
          html: htmlLink,
          pdf: pdfLink,
          width: data.width,
          height: data.height,
          delay: data.delay
        })
          .then(function(file) {
            if (file) {
              resolve(file);
            } else {
              reject({
                code: constants.httpCodes.internalServerError,
                message: constants.scenario.getPdfError
              });
            }
          })
          .catch(function(err) {
            reject(err);
          });
      } else {
        reject({
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.getHtmlError
        });
      }
    });
  };

  return {
    html: html,
    pdf: pdf
  };
};

module.exports = outputData;
