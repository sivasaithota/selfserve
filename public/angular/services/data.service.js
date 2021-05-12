(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('DataService', DataService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  DataService.$inject = ['toastr', '$location'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function DataService(toastr, $location) {
    // the callable members of the service
    return {
      hideToken: hideToken,
      generatePassword: generatePassword,
      addTypes: addTypes,
      convertTab: convertTab,
      error: error,
      success: success,
      convertRoles: convertRoles,
      converstParameters: converstParameters,
      convertParameterValue: convertParameterValue,
      convertParametersByRows: convertParametersByRows,
      getLocation: getLocation,
      getTabs: getTabs,
      getExtractStructure: getExtractStructure,
      getTabName: getTabName,
      convertUsername: convertUsername,
    };

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function hideToken(token) {
      return token.replace(/[a-z,A-Z,0-9]/gi, 'X')
    }


    // Generates a random password
    // param numLc Number of lowercase letters to be used (default 1)
    // param numUc Number of uppercase letters to be used (default 1)
    // param numDigits Number of digits to be used (default 1)
    // param numSpecial Number of special characters to be used (default 1)
    // returns {*|string|String}
    function generatePassword(numLc, numUc, numDigits, numSpecial) {
      numLc = numLc || 1;
      numUc = numUc || 1;
      numDigits = numDigits || 1;
      numSpecial = numSpecial || 1;


      var lcLetters = 'abcdefghijklmnopqrstuvwxyz';
      var ucLetters = lcLetters.toUpperCase();
      var numbers = '0123456789';
      var special = '!?=#*$@+-._';

      var getRand = function(values) {
        return values.charAt(Math.floor(Math.random() * values.length));
      }

      function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
      };

      var pass = [];
      for(var i = 0; i < numLc; ++i) { pass.push(getRand(lcLetters)) }
      for(var i = 0; i < numUc; ++i) { pass.push(getRand(ucLetters)) }
      for(var i = 0; i < numDigits; ++i) { pass.push(getRand(numbers)) }
      for(var i = 0; i < numSpecial; ++i) { pass.push(getRand(special)) }

      return shuffle(pass).join('');
    }

    function addTypes(columnlist) {
      // set types for columns, default is 'text'
      var columnTypes = '';
      angular.forEach(columnlist.split(','), function (value, key) {
        columnTypes += '"' + value + '"' + ' text,';
      });
      columnTypes = columnTypes.substring(0, columnTypes.length - 1);
      return columnTypes;
    }

    function convertTab(data) {
      var dbuploadlist = [];
      angular.forEach(_.groupBy(data, 'tag'), function (value, key) {
        var listObject = {
          tagName: key
        };
        listObject.tables = value;
        dbuploadlist.push(listObject);
      });
      return dbuploadlist;
    }

    // Showing error toast
    function error(err, title) {
      toastr.error(
        err.message || err,
        title || 'Error',
        { timeOut: 10000 }
      );
    }

    // Showing success toast
    function success(msg, title) {
      toastr.success(
        msg,
        title|| 'Success',
        { timeOut: 5000 }
      );
    }

    function convertRoles(data) {
      var list = [];
      var permissions = [];
      angular.forEach(_.groupBy(data, 'category'), function (value, key) {
        var functionOpt = [];
        angular.forEach(value, function (valueCat, keyCat) {
          functionOpt.push(valueCat.function);
        });
        functionOpt = _.uniq(functionOpt);
        angular.forEach(functionOpt, function (val, k) {
          var pushObj = {};
          pushObj.function = val;
          pushObj.category = key;
          angular.forEach(value, function (valueNew, keyNew) {
            if (valueNew.function == val) {
              pushObj[valueNew.role] = valueNew.applicable;
            }
          });
          permissions.push(pushObj);
        });
      });
      angular.forEach(data, function (value, key) {
        var role = {
          role: value.role,
          rolename: value.rolename
        };
        list.push(role);
      });
      list = _.uniq(list, 'role');
      return {
        list: list,
        permissions: permissions
      };
    }

    function converstParameters(data) {
      var parameters = [];
      angular.forEach(_.groupBy(data, 'group_name'), function (value, key) {
        var parameter = {
          group_name: key,
          parameters: []
        };
        angular.forEach(value, function (param) {
          if (param.type === '1' && param.validation === 'date' && param.value) {
            param.value = new Date(param.value);
          }
          if (param.type === '3') {
            // type is checkbox
            if (_.isNull(param.value)) {
              param.value = [];
            }
            if (_.isString(param.value) && param.value.length > 0) {
              param.value = param.value.split(",");
            }
          }
          if (param.type === '3' || param.type === '4' || param.type === '6') {
            // type is checkbox or radio
            param.parameter = param.parameter.split(",");
          }
          if (param.type === '5') {
            // type is switch
            if (_.isNull(param.value)) {
              param.value = false;
            } else {
              if (param.value === 'true') {
                param.value = Boolean(true);
              }
              if (param.value === 'false') {
                param.value = Boolean(false);
              }
            }
          }
          parameter.parameters.push({
            id: param.id,
            displayname: param.displayname,
            parameter: param.parameter,
            tooltip: param.tooltip,
            type: param.type,
            value: param.value,
            oldValue: angular.copy(param.value),
            validation: param.validation,
            groupName: param.group_name,
            dependencyId: param.dependency_id,
            parentColumnName: param.parent_column_name,
            dependentColumnName: param.dependent_column_name,
            isSaved: false
          });
        });
        parameters.push(parameter);
      });
      return parameters;
    }

    function convertParameterValue(parameters) {
      return angular.forEach(parameters, function (value, key) {
        if (_.isArray(value.parameter)) {
          value.parameter = value.parameter.join();
        }
        if (_.isArray(value.value)) {
          value.value = value.value.join();
        }
      });
    }

    function convertParametersByRows(parameters) {
      var rows = [];
      for (var index = 0; index <= parameters.length; index++) {
        var parameter = parameters[index];
        if (index === 0) {
          rows[0] = parameter.parameters;
        } else {
          if (index === parameters.length) {
            if (!parameters[index - 1].class) parameters[index - 1].class = 'content--4';
            return parameters;
          } else {
            var lastRowIndex = rows.length - 1;
            var lastRow = rows[lastRowIndex];
            var lastRowLength = lastRow.length;
            var currentRowLength = parameter.parameters.length;
            var nextRowLength = parameters[index + 1] ? parameters[index + 1].parameters.length : 0;
            //Previous row
            switch (lastRowLength) {
              case 1:
                if (currentRowLength == 1) {
                  if (nextRowLength > 2 || nextRowLength == 0) {
                    parameter.class = 'content--3 content_last';
                  } else {
                    parameter.class = 'content--1';
                  }
                  parameters[index - 1].class = 'content--1';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength == 2) {
                  if (nextRowLength > 1 || nextRowLength == 0) {
                    parameter.class = 'content--3 content_last';
                  } else {
                    parameter.class = 'content--2';
                  }
                  parameters[index - 1].class = 'content--1';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength == 3) {
                  parameter.class = 'content--3 content_last';
                  parameters[index - 1].class = 'content--1';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength >= 4) {
                  parameters[index - 1].class = 'content--4';
                  rows.push(parameter.parameters);
                }
                break;

              case 2:
                if (currentRowLength == 1) {
                  if (nextRowLength > 2 || nextRowLength == 0) {
                    parameter.class = 'content--2 content_last';
                  } else {
                    parameter.class = 'content--1';
                  }
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--2';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength == 2) {
                  parameter.class = 'content--2 content_last';
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--2';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength == 3) {
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--4';
                  rows.push(parameter.parameters);
                }
                if (currentRowLength >= 4) {
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--4';
                  rows.push(parameter.parameters);
                }
                break;

              case 3:
                if (currentRowLength == 1) {
                  parameter.class = 'content--1 content_last';
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--3';
                  rows[lastRowIndex] = lastRow.concat(parameter.parameters);
                }
                if (currentRowLength == 2 || currentRowLength == 3 || currentRowLength >= 4) {
                  if (!parameters[index - 1].class) parameters[index - 1].class = 'content--4';
                  rows.push(parameter.parameters);
                }
                break;

              default:
                if (!parameters[index - 1].class) parameters[index - 1].class = 'content--4';
                rows.push(parameter.parameters);
                break;
            }
          }
        }
      }
    }

    function getLocation() {
      return $location.absUrl().split('/#')[0];
    }

    function getTabs (gridLength) {
      var listName = getTabName();
      return [{
        id: 0,
        name: listName.table,
        displayName: 'Data Grid',
        icon: 'grid-view.ejs',
        isVisible: !!gridLength
      }, {
        id: 1,
        name: listName.tableau,
        displayName: 'Visualization',
        icon: 'tableau-view.ejs',
        isVisible: false
      }, {
        id: 2,
        name: listName.html,
        displayName: 'HTML Reports',
        icon: 'html-view.ejs',
        isVisible: false
      }, {
        id: 3,
        name: listName.bom,
        displayName: 'BOM Viz',
        icon: 'bom-view.ejs',
        isVisible: false
      }];
    }

    function getExtractStructure() {
      return {
        script: [],
        scenario: [],
        data: {
          input: [],
          output: []
        },
        action: {
          input: [],
          output: []
        }
      };
    }

    function getTabName() {
      return {
        table: 'table',
        tableau: 'tableau',
        html: 'html',
        bom: 'bom',
      };
    }

    function convertUsername(username) {
      var arrName = username.split('@');
      return arrName[0].replace(/\./g , ' ');
    }
  }
})();
