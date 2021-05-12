var Bluebird = require('bluebird'),
  util = require('util'),
  path = require('path'),
  _ = require('lodash');

var dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  logger = require('../../logger'),
  constants = require('../../common/constants'),
  BomManager = require('./bomManager');

var _instance;

// helper function to put info fields (and some another provided) into SQL query
var _addToSelectedInfoFields = function (selectFields, nodeMaster) {
  return new Bluebird(function (resolve, reject) {
    try {
      for (let index = 0; index < nodeMaster.info.length; index++) {
        selectFields.push(nodeMaster.info[index].column);
      }
      selectFields = _.uniq(selectFields);
      selectFields = selectFields.map(field => `,"${field}"`).join('');
      resolve(selectFields)
    } catch (error) {
      reject(error)
    }
  });
};

var Bom = function () {};

/*****
Check if BOMConfig.json file exist.
This is for bom visualization tab on scenario page

{
  "productMaster" : [{
    "table" : "input table name",
    "parentNode" : "col 1",
    "childNode" : "col 2",
    "arcWeight": "col 3",
    "tab": "input"
  }, {
    "table" : "output table name",
    "parentNode" : "col 1",
    "childNode" : "col 2",
    "arcWeight": "col 3",
    "tab": "output"
  }],
  "productLocationMaster": {
    "table" : "table name",
    "network" : "col 1",
    "location" : "col 2",
    "make/source" : "col 3",
    "source" : "col 4"
  }
}

*****/

Bom.prototype.hasBomConfig = function (appId) {
  logger.info(appId, 'Checking if BOM config exists...');
  return new Bluebird(function (resolve, reject) {
    var bomManager = new BomManager();
    bomManager.readAndValidateConfig(appId)
      .then(function (result) {
        logger.info(appId, 'Successfully validated BOM config.');
        resolve({
          hasBomFile: true,
          result: result
        });
      })
      .catch(function (err) {
        logger.error(appId, 'Error while checking bom config file.', err);
        var result = {
          hasBomFile: false
        }
        if (err === constants.bomVisualization.bomVisObjectWrong) {
          result.error = constants.bomVisualization.bomVisObjectWrong
        }
        resolve(result);
      });
  });
};

/*****
Check if BOMConfig.json file exist.
This is for bom visualization tab on scenario page
*****/

Bom.prototype.getBomItems = function (scenarioId, tableName, tabType, appId) {
  logger.info(appId, 'Getting BOM data...');
  return new Bluebird(async function (resolve, reject) {
    try {
      const bomManager = new BomManager();
      let bomConfig = await bomManager.readAndValidateConfig(appId);
      logger.info(appId, 'Successfully validated BOM config.');
      let network = bomConfig.find(function (bom) {
        return (bom.tab == tabType && bom.table == tableName);
      });
      let selectFields = [];
      for (let index1 = 0; index1 < network.filters.length; index1++) {
        selectFields.push(network.filters[index1].column);
      }
      selectFields = await _addToSelectedInfoFields(selectFields, network.nodeMaster);
      let nodesData = await dataAccess.executeQuery(appId, util.format(
        queryHelper.getUniqueItems,
        network.nodeMaster['node'],
        network.nodeMaster['label'],
        selectFields,
        scenarioId,
        network.nodeMaster['table']
      ));
      logger.info(appId, 'Successfully retrieved table.');
      resolve(nodesData.rows)
    } catch (error) {
      logger.error(appId, 'Error while getting data from the table for BOM!', error);
      reject(error);
    }
  });
};

/*****
 Check if BOMConfig.json file exist.
 This is for getting bom values for specific element
 *****/

Bom.prototype.getBomValues = function (scenarioId, tableName, tabType, filteredNodes, appId) {
  logger.info(appId, 'Getting BOM data...');
  return new Bluebird(async function (resolve, reject) {
    try {
      const bomManager = new BomManager();
      filteredNodes = filteredNodes.split(',')
      let bomConfig = await bomManager.readAndValidateConfig(appId);
      logger.info(appId, 'Successfully validated BOM config.');
      const network = bomConfig.find(function (bom) {
        return (bom.tab == tabType && bom.table == tableName);
      });
      let dependencyTableData = await dataAccess.executeQuery(appId, util.format(
        queryHelper.getTableById,
        network['parentNode'],
        network['childNode'],
        network['arcWeight'],
        scenarioId,
        network['table']
      ));
      dependencyTableData = dependencyTableData.rows;
      let tree = await bomManager.buildTree(dependencyTableData, filteredNodes);
      let pathesAndNodes = await bomManager.createProductDependency(tree);
      let selectFields = [];
      selectFields = await _addToSelectedInfoFields(selectFields, network.nodeMaster);
      let nodesData = await dataAccess.executeQuery(appId, util.format(
        queryHelper.getUniqueItemsFiltered,
        network.nodeMaster['node'],
        network.nodeMaster['label'],
        selectFields,
        scenarioId,
        network.nodeMaster['table'],
        network.nodeMaster['node'],
        pathesAndNodes.nodes.map(node => `'${node.name}'`).join(',')
      ));
      nodesData = nodesData.rows;
      pathesAndNodes = await bomManager.extendNodeData(pathesAndNodes, nodesData, filteredNodes, network.nodeMaster.info);
      return resolve(pathesAndNodes);
    } catch (error) {
      logger.error(appId, 'Error while getting data from the table for BOM element!', error);
      reject(error)
    }
  });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Bom();
    }
    return _instance;
  }
};
