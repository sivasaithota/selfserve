var xlsx = require('xlsx'),
  fs = require('fs'),
  html2pdf = require('phantom-html2pdf'),
  Bluebird = require('bluebird');

var Filer = require('./filer');

var Transformer = function () {};

/********
	convertXLSXToCSV is used to convert xls or xlsx file to csv.
  Currently, the code can handle max of 40mb xlsx or xls file.
********/

Transformer.prototype.convertXLSXToCSV = function (fileObject, destFilePath) {
  var workbook = xlsx.readFile(fileObject.file.path);
  var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[fileObject.xlsSheet]]);
  return new Filer().writeToFile(destFilePath, csv);
};

/********
	convertHtmlToPdf is used to convert html  to pdf
	it recives html file path and conver to pdf in pdflink path
********/

Transformer.prototype.convertHtmlToPdf = function (convertData) {
  return new Bluebird(function (resolve, reject) {
    var options = {
      "html": convertData.html,
      "paperSize": {
        width: convertData.width + 'mm',
        height: convertData.height + 'mm',
        border: '5mm',
        delay: convertData.delay // delay for downloading images from the HTML document
      },
      "deleteOnAction": true
    };
    html2pdf.convert(options, function (err, result) {
      if (err) {
        reject(err);
      } else {
        result.toBuffer(function (returnedBuffer) {
          resolve(returnedBuffer);
        });
      }
    });
  });

};

module.exports = Transformer;
