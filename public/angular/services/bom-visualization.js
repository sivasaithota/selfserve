(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('VisualService', VisualService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  VisualService.$inject = ['$q'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function VisualService($q) {
    // the callable members of the service
    var service = {
      hexToRgbA             : hexToRgbA,
      findNodesWithoutParent: findNodesWithoutParent,
      generateTree          : generateTree,
      reduceArray           : reduceArray,
      getLinksData          : getLinksData,
      childCount            : childCount,
      rgbTohex              : rgbTohex
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function _checkExist (element) {
      return element.name === this.name;
    };

    function _comparer (otherArray) {
      return function(current){
        return otherArray.filter(function(other){
          return other.product_id == current.product_id && other.name == current.name
        }).length == 0;
      }
    };

    function hexToRgbA (hex, opacity) {
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c= hex.substring(1).split('');
        if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + Math.abs(opacity) + ')';
      }
    }

    function rgbTohex(rgb){
     rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
     return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }

    function findNodesWithoutParent (pathsToNodes, allElements) {
      var deferred = $q.defer();
      var childrenArray = [];
      for (var i in pathsToNodes) {
        var path = pathsToNodes[i];
        var nodeToPush = allElements.find(_checkExist, {
          name: path.from
        });
        childrenArray.push(nodeToPush);
      }
      var uniq = new Set(childrenArray.map(function(e) {
        return JSON.stringify(e);
      }));
      var res = Array.from(uniq).map(function(e) {
        return JSON.parse(e);
      });
      var onlyInRes = res.filter(_comparer(allElements));
      var onlyInNodes = allElements.filter(_comparer(res));
      deferred.resolve(onlyInRes.concat(onlyInNodes));
      return deferred.promise;
    }

    function reduceArray (arr) {
      return arr.reduce(function (map, item) {
        map[item.product_id] = item;
        return map;
      }, {});
    }

    function generateTree (realData) {
      var data = JSON.parse(JSON.stringify(realData)),
        dataMap = reduceArray(data),
        treeData = [];
      //Adding data-target attribute with id's of targets of every node
      angular.forEach(data, function (node, index) {
        node.index = index;
        if (node.parents_id) {
          var parentLength = node.parents_id.length;
          angular.forEach(node.parents_id, function (parentItem, index) {
            var parent = dataMap[parentItem.id];
            if (index != parentLength - 1) {
              if (!parent.data_targets_id) {
                parent.data_targets_id = [{
                  id: node.product_id
                }];
              } else {
                parent.data_targets_id.push({
                  id: node.product_id
                });
              }
              return;
            }
            parent.children = parent.children || [];
            parent.children.push(node);
          });
        } else {
          treeData.push(node);
        }
      });
      return treeData[0];
    }

    function getLinksData (paths, linksData, nodes, selectedNodes) {
      var deferred = $q.defer();
      selectedNodes = selectedNodes.map(function (node) {
        return node.name;
      })
      angular.forEach(paths, function(newPath, index) {
        var nodeToPush = nodes.find(_checkExist, {
          name: newPath.from
        });
        var nodeToUpdate = linksData.find(_checkExist, {
          name: newPath.from
        });
        var parentNode = nodes.find(_checkExist, {
          name: newPath.to
        });
        if (typeof nodeToUpdate === "undefined") {
          var currentNodes = _.filter(paths, function (p) {
            return p.to == nodeToPush.name;
          });
          nodeToPush.maxArcWeight = _.isNumber(newPath.arcWeight) ? Math.max.apply(
            Math, currentNodes.map(function(n) {
              return Number(n.arcWeight);
            })
          ) : newPath.arcWeight;
          nodeToPush.parents_id = [];
          nodeToPush.class = selectedNodes.includes(nodeToPush.name) ? 'selected-item' : '';
          nodeToPush.parents_id.push({
            id: parentNode.product_id,
            arcWeight: newPath.arcWeight
          });
          linksData.push(nodeToPush);
        } else {
          nodeToUpdate.class = selectedNodes.includes(nodeToUpdate.name) ? 'selected-item' : '';
          nodeToUpdate.parents_id.push({
            id: parentNode.product_id,
            arcWeight: newPath.arcWeight
          });
          nodeToUpdate.parents_id = _.uniq(nodeToUpdate.parents_id);
        }
        if (index === paths.length - 1) {
          deferred.resolve(linksData);
        }
      });
      return deferred.promise;
    }

    // compute the new height
    function childCount (level, n, levelWidth) {
      var deferred = $q.defer();
      if(n.children && n.children.length > 0) {
        if(levelWidth.length <= level + 1) levelWidth.push(0);
        levelWidth[level+1] += n.children.length;
        angular.forEach(n.children, function(d, index) {
          childCount(level + 1, d, levelWidth);
          if (index == n.children.length - 1) {
            deferred.resolve(levelWidth);
          }
        });
      } else {
        deferred.resolve(levelWidth);
      }
      return deferred.promise;
    }

  }
})();
