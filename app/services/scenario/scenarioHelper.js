var util = require('util'),
  Bluebird = require('bluebird');
const GridManager = require('./gridManager');

var dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger');

var ScenarioHelper = function () {
  var attachLocking = function (scenarioObject, lockingRows) {
    var scenarios = [];
    lockingRows.forEach(function (row) {
      if (scenarioObject[row.scenario_id]) scenarioObject[row.scenario_id].locking = row;
    });
    for (var key in scenarioObject) scenarios.push(scenarioObject[key]);
    return scenarios;
  };

  /*
   Always skip header true and append data false 
  */
  var bulkUploadCsv = function (files, uploadObject, filePath, dbConfig, appId) {
    var gridManager = new GridManager(),
      query='',
      promises = [],
      resultObject = [],
      extension = '.csv';

    files.forEach(function (file) {
      if ((file.length - file.toLowerCase().indexOf(extension)) === extension.length) {
        var tableName = file.replace(/.csv/ig, ''), fileObject = {};
        logger.info(appId, 'uploading file!!', file);
        promises.push(
          gridManager.getColumnsFromTable(uploadObject.scenarioId, tableName, uploadObject.tableType, appId)
          .then(function (result) {
            fileObject = {
              columns: result.rows[0].columnlist.replace(/,/g,'","'),
              filePath: filePath + '/' + file,
            };
          })
          .then(function () {
            logger.info(appId, 'uploadObject:',uploadObject);
            query = `TRUNCATE TABLE scenario_${uploadObject.scenarioId}."${tableName}";`;
            return dataAccess.executeQuery(appId, query);
          })
          .then(function () {
            return gridManager.copyCSVtoTable(dbConfig, {...uploadObject, dataTableName: tableName}, fileObject);
          })
          .then(function() {
            logger.info(appId, 'Executing query to upload data...', fileObject.filePath);
            query = util.format(
              queryHelper.uploadGridData,
              uploadObject.scenarioId,
              tableName,
              file,
              uploadObject.username
            );
            return dataAccess.executeQuery(appId, query);
          }).then(function (result) {
            logger.info(appId, 'File uploaded successfully!!', file);
            if (result && result.rows && result.rows.length > 0) {
              resultObject.push(result.rows[0]);
            } else {
              resultObject.push({
                file_name: file,
                error: constants.scenario.errorUpload
              });
            }
          }).catch(function (err) {
            logger.error(appId, 'Error while uploading file:' + file, err);
            resultObject.push({
              file_name: file,
              error: constants.scenario.errorUpload
            });
        }));
      } else {
        resultObject.push({
          file_name: file,
          error: constants.scenario.invalidFileExtension
        });
      }
    });
    return Bluebird.all(promises)
      .then(function () {
        return resultObject;
      });
  };

  return {
    attachLocking: attachLocking,
    bulkUploadCsv: bulkUploadCsv
  };
};
module.exports = ScenarioHelper;
