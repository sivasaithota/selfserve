var Bluebird = require('bluebird');
var path = require('path');
var _ = require('lodash');

var CommonServices = require('../commonServices'),
  Filer = require('../../common/filer'),
  logger = require('../../logger'),
  constants = require('../../common/constants'),
  bomConfig = require('config').get('configurationFiles.bomConfig');

var BomManager = function () {

  /*****
  This methods reads the json file from ds folder. It checks if file exist and read
  *****/

  var readAndValidateConfig = function (appId) {
    logger.info(appId, 'Validating BOM config...');
    return new Bluebird(function (resolve, reject) {
      _readBomConfigFile(appId)
        .then(function (bomData) {
          logger.info(appId, 'Successfully read BOM config.');
          return _validateBomConfig(bomData.networkMaster);
        })
        .then(function (result) {
          logger.info(appId, 'Successfully validated BOM config.');
          resolve(result);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  var _readBomConfigFile = function (appId) {
    var _filePath = path.resolve(__dirname, new CommonServices().getScriptUploadDir(appId) + '/' + bomConfig);
    var filer = new Filer();
    return filer.fileExist(_filePath)
      .then(function (result) {
        if (result) {
          logger.info(appId, 'Successfully verified that BOM config exists.');
          return filer.readFile(_filePath);
        } else throw constants.bomVisualization.bomVisNotFound;
      }).then(function (data) {
        try {
          return JSON.parse(data);
        } catch (err) {
          throw err;
        }
      });
  };

  var createProductDependency = function (bomData) {
    return new Bluebird(function (resolve, reject) {
      var dependency = [];
      var nodes = [];
      var id = 1;
      bomData.forEach(function (productDetails) {
        if (productDetails['childNode'] !== productDetails['parentNode']) {
          dependency.push({
            from: productDetails['childNode'],
            to: productDetails['parentNode'],
            arcWeight: productDetails['arcWeight']
          });
        }
        if ((typeof nodes.find(_getNode, {
            name: productDetails['parentNode']
          })) !== 'object') {
          nodes.push({
            product_id: id,
            name: productDetails['parentNode']
          });
          id++;
        }
        if ((typeof nodes.find(_getNode, {
            name: productDetails['childNode']
          })) !== 'object') {
          nodes.push({
            product_id: id,
            name: productDetails['childNode']
          });
          id++;
        }
      });
      partDependency = dependency;
      var data = {
        path: dependency,
        nodes: nodes
      };
      resolve(data);
    });
  };

  var _validateBomConfig = function (bomData) {
    return new Bluebird(function (resolve, reject) {
      if (!bomData || bomData.length === 0) {
        reject(constants.bomVisualization.bomVisNotFound);
      } else {
        var error;
        bomData.forEach(function (value) {
          if (!value && !value['table'] && !value['parentNode'] && !value['childNode'] && !value['arcWeight'] && !value['tab']) {
            error = constants.bomVisualization.bomVisObjectNotFound;
          } else if (!(value &&
              value['table'] &&
              value['parentNode'] &&
              value['childNode'] &&
              value['arcWeight'] &&
              value['tab'] &&
              value['filters'] &&
              Array.isArray(value['filters']) &&
              value['nodeMaster'] &&
              value['nodeMaster']['node'] &&
              value['nodeMaster']['label'] &&
              value['nodeMaster']['info'] &&
              Array.isArray(value['nodeMaster']['info']) &&
              _.compact(value['nodeMaster']['info'].map(val => val.label)).length &&
              _.compact(value['nodeMaster']['info'].map(val => val.column)).length)) {
            error = constants.bomVisualization.bomVisObjectWrong;
          }
        });
        error ? reject(error) : resolve(bomData);
      }
    });
  };

  var _getNode = function (element) {
    return element.name === this.name;
  };

  // Find parent and parent of parent elements for selected item and add them to the array
  var _findParentElem = function (parentElem, allParentElem, paths) {
    return new Bluebird(function (resolve, reject) {
      if (parentElem.length && paths) {
        parentElem.forEach(function (elem, index) {
          var newParent = paths.filter(function (path) {
            return path['parentNode'] === elem['childNode'];
          });
          if (newParent.length > 0) {
            allParentElem = allParentElem.concat(newParent);
            _findParentElem(newParent);
          }
          if (index === parentElem.length - 1) {
            resolve(allParentElem);
          }
        });
      } else {
        resolve(allParentElem);
      }
    });
  };

  // Find daughter and daughter of daughter elements for selected item and add them to the array
  var _findDaughterElem = function (daughterElem, allDaughterElem, paths) {
    return new Bluebird(function (resolve, reject) {
      if (daughterElem.length && paths) {
        daughterElem.forEach(function (elem, index) {
          var newDaughter = paths.filter(function (path) {
            return path['childNode'] === elem['parentNode'];
          });
          if (newDaughter.length > 0) {
            allDaughterElem = allDaughterElem.concat(newDaughter);
            _findDaughterElem(newDaughter);
          }
          if (index === daughterElem.length - 1) {
            resolve(allDaughterElem);
          }
        });
      } else {
        resolve(allDaughterElem);
      }
    });
  };

  // Find all related elements for selected one
  var buildTree = function (bomData, filteredNodes) {
    return new Bluebird(function (resolve, reject) {
      var allNodes = [],
        allDaughterElem = [],
        allParentElem = [];
      var daughterElem = bomData.filter(function (path) {
        return filteredNodes.includes(path['childNode']);
      });
      var parentElem = bomData.filter(function (path) {
        return filteredNodes.includes(path['parentNode']);
      });
      allDaughterElem = allDaughterElem.concat(daughterElem);
      allParentElem = allParentElem.concat(parentElem);
      _findParentElem(parentElem, allParentElem, bomData)
        .then(function (result) {
          allNodes = allNodes.concat(result);
          return _findDaughterElem(daughterElem, allDaughterElem, bomData);
        })
        .then(function (result) {
          allNodes = allNodes.concat(result);
          allNodes = _.uniq(allNodes);
          resolve(allNodes);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  // extend each node data by node name & info for tooltip 
  var extendNodeData = function (pathesAndNodes, nodesData, filteredNodes, info) {
    return new Bluebird(function (resolve, reject) {
      try {
        pathesAndNodes.selected = pathesAndNodes.nodes.filter(function (node) {
          return filteredNodes.includes(node.name);
        })
        pathesAndNodes.nodes = pathesAndNodes.nodes.map(function (node) {
          let nodeData = nodesData.find(function (nodesDataInstance) {
            return nodesDataInstance.node === node.name;
          })
          node.label = nodeData.label;
          let labelsColumn = '<div flex>';
          let dataColumn = '<div flex>';
          let isSomeTooltipData = false;
          for (let index = 0; index < info.length; index++) {
            if (nodeData[info[index].column]) {
              if (isSomeTooltipData) {
                labelsColumn += '<br/>';
                dataColumn += '<br/>';
              }
              labelsColumn += info[index].label + ' ';
              dataColumn += ': ' + nodeData[info[index].column];
              isSomeTooltipData = true;
            }
          }
          labelsColumn += '</div>';
          dataColumn += '</div>';
          if (isSomeTooltipData) {
            node.tooltipHtml = labelsColumn + dataColumn;
          } else {
            node.tooltipHtml = "<div flex>No Available Data</div>"
          }
          return node;
        })
        resolve(pathesAndNodes);
      } catch (error) {
        reject(error);
      }
    });
  }

  return {
    readAndValidateConfig,
    createProductDependency,
    buildTree,
    extendNodeData
  };

};

module.exports = BomManager;
