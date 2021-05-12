(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridWidget')
    .provider('GridProvider', GridProvider);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  GridProvider.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function GridProvider () {
    var defaults = {
      rowsNumber: 14,
      defaultHeight: 46,
      watchCount: 0,
      colModel: [],
      columnTypes: [],
      displayList: [],
      tablenameServer: '',
      editFunctions: {
        isEdited: false,
        isDeleted: false
      }
    };
    var operations = [{
      operator: '=',
      percentage: false,
      label: 'Equal to'
    }, {
      operator: '+',
      percentage: true,
      label: 'Increase by %'
    }, {
      operator: '-',
      percentage: true,
      label: 'Decrease by %'
    }, {
      operator: '+',
      percentage: false,
      label: 'Increase by Value '
    }, {
      operator: '-',
      percentage: false,
      label: 'Decrease by Value'
    }];
    var filterOperations = [{
      operator: 'cn',
      label: '%'
    }, {
      operator: 'eq',
      label: '=='
    }, {
      operator: 'ge',
      label: '>='
    }, {
      operator: 'le',
      label: '<='
    }, {
      operator: null,
      label: 'Range'
    }, {
      operator: 'eq',
      label: 'boolean'
    }];
    var eqSeparator = ';';

    function removeZone (time) {
      return new Date(time + 'Z').setMilliseconds(0);
    }

    function updateSecs (time, val) {
      var date = new Date(time);
      date.setMilliseconds(val);
      return date != date ? date.toISOString() : date;
    }
    this.$get = function ($q, $filter, $rootScope) {
      return {
        getDefaults: function (newDefaults) {
          return angular.extend({}, defaults, newDefaults);
        },
        getTabOptions: function (tabName, isEditable, type, isScenarioActive, isTableEditable) {
          var currentUser = $rootScope.currentUser;
          return [{
            active: tabName === 'upload',
            name: 'upload',
            visible: type.indexOf('view') < 0 && currentUser.functions.Grid_Upload && isScenarioActive && isTableEditable,
            orderId: 1
          }, {
            active: tabName === 'filter',
            name: 'filter',
            visible: true,
            orderId: 2
          }, {
            active: tabName === 'add',
            name: 'add',
            visible: currentUser.functions.Grid_Add && isScenarioActive && isTableEditable,
            orderId: 3
          }, {
            active: tabName === 'edit',
            name: 'edit',
            visible: isEditable && currentUser.functions.Grid_Edit && isScenarioActive && isTableEditable,
            orderId: 4
          }, {
            active: tabName === 'delete',
            name: 'delete',
            visible: currentUser.functions.Grid_Delete && isScenarioActive && isTableEditable,
            orderId: 5
          }, {
            active: tabName === 'download',
            name: 'download',
            visible: currentUser.functions.Grid_Download,
            orderId: 6
          }, {
            active: tabName === 'macros',
            name: 'macro',
            visible: false,
            orderId: 7
          }];
        },
        getFilterTabOptions: function (isFiltered, isScenarioActive) {
          return [{
            active: !isFiltered,
            icon: !isFiltered ? 'filter' : 'filtered',
            view: 'filter_quick',
            visible: true,
            orderId: 1
          }, {
            active: isFiltered,
            icon: 'filter_fill',
            view: 'filter_fill',
            visible: isFiltered && isScenarioActive,
            orderId: 2
          }, {
            active: false,
            icon: 'delete',
            view: 'filter_delete',
            visible: isFiltered && isScenarioActive,
            orderId: 3
          }, {
            active: false,
            icon: 'download',
            view: 'download',
            visible: isFiltered,
            orderId: 4
          }];
        },
        getConvertedFilterRules: function (models) {
          var rules = [];
          try {
            angular.forEach(models, function (model, index) {
              var filterText = {
                field: model.id,
              },
                label,
                modelUsed = false;
              if (model.selectedFilterOperation &&
                model.selectedFilterOperation.label) {
                label = model.selectedFilterOperation.label;
              }
              if (label === '==' &&
                model.textValue &&
                model.textValue.split(eqSeparator).length > 1) {
                var textValues = model.textValue.split(eqSeparator);
                for (var textValueIndex = 0; textValueIndex < textValues.length; textValueIndex++) {
                  if ((['integer','double precision','bigint','numeric'].includes(model.columnType) &&
                    isNaN(Number(textValues[textValueIndex]))) ||
                    (['date','timestamp'].includes(model.columnType) &&
                    Date.parse(textValues[textValueIndex])) ||
                    (model.columnType === 'time' &&
                    textValues[textValueIndex].match(/^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/g))
                    ) {
                      throw new Error('Value ‘'+
                        textValues[textValueIndex] +
                        '’ for the ‘' +
                        model.displayname +
                        '’ field is invalid')
                  }
                }
                filterText.op = 'in';
                filterText.data = model.textValue.replace(/;/g, "','");
                rules.push(filterText);
                modelUsed = true;
              } else if (['>=','<=','==','%'].includes(label) &&
                model.textValue &&
                model.textValue !== '') {
                if ((['integer','double precision','bigint','numeric'].includes(model.columnType) &&
                  isNaN(Number(model.textValue))) ||
                  (['date','timestamp'].includes(model.columnType) &&
                  Date.parse(model.textValue)) ||
                  (model.columnType === 'time' &&
                  model.textValue.match(/^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/g))
                  ) {
                    throw new Error('Value ‘'+
                      model.textValue +
                      '’ for the ‘' +
                      model.displayname +
                      '’ field is invalid')
                }
                filterText.op = model.selectedFilterOperation.operator;
                filterText.data = model.textValue;
                rules.push(filterText);
                modelUsed = true;
              } else if (label === 'boolean' && model.booleanValue.length === 1) {
                filterText.op = 'eq';
                filterText.data = model.booleanValue[0];
                rules.push(filterText);
                modelUsed = true;
              } else if (label === 'boolean' && model.booleanValue.length === 2) {
                angular.forEach(model.booleanValue, function (val, i) {
                  var filter = angular.copy(filterText);
                  filter.op = 'eq';
                  filter.data = val;
                  if (model.booleanValue.length > 1 && i === model.booleanValue.length - 1) {
                    filter.groupOp = 'OR';
                  }
                  rules.push(filter);
                  modelUsed = true;
                });
              } else if (label === 'Range' &&
                model.edittype !== 'custom') {
                var isMinVal = model.options && (model.minValue !== model.options.floor);
                var isMaxVal = model.options && (model.maxValue !== model.options.ceil);
                if (isMinVal) {
                  var filter = angular.copy(filterText);
                  filter.op = 'ge';
                  filter.data = (model.columnType !== 'date' && model.columnType !== 'timestamp' && model.columnType !== 'time') ?
                    model.minValue :
                    updateSecs(model.minValue, 0);
                  rules.push(filter);
                  modelUsed = true;
                }
                if (isMaxVal) {
                  var filter = angular.copy(filterText);
                  filter.op = 'le';
                  filter.data = (model.columnType !== 'date' && model.columnType !== 'timestamp' && model.columnType !== 'time') ?
                    model.maxValue :
                    updateSecs(model.maxValue, 999)
                  rules.push(filter);
                  modelUsed = true;
                }
                if (model.includeNull && (isMinVal || isMaxVal)) {
                  var filter = angular.copy(filterText);
                  filter.op = 'nu';
                  filter.groupOp = 'OR';
                  rules.push(filter);
                  modelUsed = true;
                } else if (!model.includeNull && !(isMinVal || isMaxVal)) {
                  var filter = angular.copy(filterText);
                  filter.op = 'nn';
                  rules.push(filter);
                  modelUsed = true;
                }
              } else if ((model.textValue && model.textValue !== '') || (model.edittype === 'custom' && model.rowValue)) {
                filterText.op = 'cn';
                if (['integer','double precision','bigint','date','timestamp','numeric','time'].includes(model.columnType)) {
                  filterText.op = 'eq';
                }
                var filterTextData = model.edittype !== 'custom' ?
                  model.textValue :
                  model.rowValue;
                filterText.data = typeof filterTextData === 'number' ?
                  filterTextData :
                  filterTextData.toLowerCase();
                rules.push(filterText);
                modelUsed = true;
              }
              if (model.includeNull &&
                label !== 'Range' &&
                modelUsed) {
                rules.push({
                  field: model.id,
                  op: 'nu',
                  groupOp: 'OR'
                });
              }
            });
            return rules;
          } catch (error) {
            return error;
          }
        },
        // Update model with values from jqgrid for editing form
        generateNewModel: function (models, colData, isEdited) {
          return angular.forEach(models, function (model) {
            var value;
            if (model.parentColumnName) {
              model.parentColumnValue = colData[model.parentColumnName];
            }
            if (!model.hidden && !isEdited) {
              switch (model.columnType) {
                case 'integer':
                case 'double precision':
                case 'bigint':
                case 'numeric':
                  value = colData[model.id] ? Number(colData[model.id].replace(/[^0-9\.-]+/g,"")) : '';
                  break;
                case 'boolean':
                  value = colData[model.id] == 'true' ? true : false;
                  break;
                default:
                  value = colData[model.id];
                  break;
              }
            } else {
              value = colData[model.id];
            }
            model.oldValue = value;
            model.rowValue = value;
          });
        },
        // Range slider config
        setRangeOptions: function (models, rangeValue, floatList) {
          var deferred = $q.defer();
          angular.forEach(models, function (model, index) {
            if (model.id !== 'jqgrid_id') model.includeNull = true;
            var range = {
              minValue: rangeValue[model.id + '_min'],
              maxValue: rangeValue[model.id + '_max']
            };
            if (
              (_.isUndefined(model.minValue) || _.isUndefined(model.maxValue)) &&
              !_.isUndefined(range.minValue) && !_.isUndefined(range.maxValue)
            ) {
              switch(model.columnType) {
                case 'integer':
                case 'bigint':
                case 'double precision':
                case 'numeric':
                  var min = Number(range.minValue);
                  var max = Number(range.maxValue);
                  model.minValue = min;
                  model.maxValue = max;
                  model.options = {
                    floor: min,
                    ceil: max
                  };
                  if (model.columnType === 'double precision' || model.columnType === 'numeric') {
                    model.options.precision = floatList && floatList[model.id] ? floatList[model.id] : 2;
                    model.options.step = (max - min) != 0 ? (max - min) / 100 : 0.1;
                  } else {
                    model.options.step = 1;
                  }
                  model.operator = '=';
                  model.percentage = false;
                  break;
                case 'timestamp':
                case 'date':
                  if (range && range.minValue.length && range.maxValue.length) {
                    var min = model.columnType === 'date' ?
                                new Date(range.minValue).getTime() : removeZone(range.minValue);
                    var max = model.columnType === 'date' ?
                                new Date(range.maxValue).getTime() : removeZone(range.maxValue);
                    model.minValue = min;
                    model.maxValue = max;
                    model.options = {
                      floor: min,
                      ceil: max,
                      step: model.columnType === 'date' ?
                              1000 * 60 * 60 * 24 : // 1 day step
                              1000, // 1 sec step
                      showTicks: false,
                      draggableRange: false,
                      translate: function(date_millis) {
                        if ((date_millis !== null)) {
                          var dateFromMillis = new Date(date_millis);
                          var filterOption = model.columnType === 'date' ? 'MM/dd/yyyy' : 'MM/dd/yyyy HH:mm:ss';
                          return $filter('date')(dateFromMillis, filterOption);
                        }
                        return '';
                      }
                    };
                  }
                  break;
                case 'time':
                  if (range && range.minValue.length && range.maxValue.length) {
                    var minValue = range.minValue.split(':');
                    var maxValue = range.maxValue.split(':');
                    // minutes are worth 60 seconds. Hours are worth 60 minutes.
                    var min = (+minValue[0]) * 60 * 60 + (+minValue[1]) * 60 + (+minValue[2]);
                    var max = (+maxValue[0]) * 60 * 60 + (+maxValue[1]) * 60 + (+maxValue[2]);
                    model.minValue = min;
                    model.maxValue = max;
                    model.options = {
                      floor: min,
                      ceil: max,
                      step: 1,
                      showTicks: false,
                      draggableRange: false,
                      translate: function(date_millis) {
                        if ((date_millis !== null)) {
                          return convertToHHMMSS(date_millis);
                        }
                        return '';
                      }
                    };
                  }
                  break;
                case 'text':
                case 'varchar':
                  model.textValue = model.textValue ? model.textValue : '';
                  break;
              }
            }

            if (index == (models.length - 1)) {
              deferred.resolve(models);
            }
          });
          return deferred.promise;
        },
        // Function to retain the filter values after performing filter action
        updateRangeOptions: function (models, rangeValue) {
          var deferred = $q.defer();
          angular.forEach(models, function (model, index) {
            // Find range value for each field
            var range = {
              minValue: rangeValue[model.id + '_min'],
              maxValue: rangeValue[model.id + '_max']
            };
            switch (model.columnType) {
              case 'text':
              case 'varchar':
                if (model.rowValue && model.textValue) {
                  model.textValue = model.rowValue;
                }
                break;
              case 'integer':
              case 'double precision':
              case 'bigint':
              case 'numeric':
                var min = Number(range.minValue);
                var max = Number(range.maxValue);
                // Update selected range with new values after editing
                if (model.options.floor < min || (model.options.floor > min && model.options.floor < max)) {
                  model.minValue = min;
                } else if (model.options.floor > max) {
                  model.minValue = max;
                }
                if (model.options.ceil > max || (model.options.ceil < max && model.options.ceil > min)) {
                  model.maxValue = max;
                } else if (model.options.ceil < min) {
                  model.maxValue = min;
                }
                model.options.floor = min;
                model.options.ceil = max;
                if (model.columnType == 'double precision' || model.columnType == 'numeric') {
                  model.options.step = (max - min) != 0 ? (max - min) / 100 : 0.1;
                }
                break;
              case 'timestamp':
              case 'date':
              case 'time':
                if (range && range.minValue.length && range.maxValue.length) {
                  var min = model.columnType === 'date' ?
                              new Date(range.minValue).getTime() : removeZone(range.minValue);
                  var max = model.columnType === 'date' ?
                              new Date(range.maxValue).getTime() : removeZone(range.maxValue);
                  // Update selected range with new values after editing
                  if (angular.isUndefined(model.minValue) || model.minValue !== model.minValue || model.minValue < min) {
                    model.minValue = min;
                  } else if (model.minValue > max) {
                    model.minValue = max;
                  }
                  if (angular.isUndefined(model.maxValue) || model.maxValue !== model.maxValue || model.maxValue > max) {
                    model.maxValue = max;
                  } else if (model.maxValue < min) {
                    model.maxValue = min;
                  }
                  if (!model.options) {
                    model.options = {
                      step: model.columnType === 'date' ?
                              1000 * 60 * 60 * 24 : // 1 day step
                              1000, // 1 sec step
                      showTicks: false,
                      draggableRange: true,
                      translate: function(date_millis) {
                        if ((date_millis !== null)) {
                          var dateFromMillis = new Date(date_millis);
                          var filterOption = model.columnType === 'date' ? 'MM/dd/yyyy' : 'MM/dd/yyyy HH:mm:ss'
                          return $filter('date')(dateFromMillis, filterOption);
                        }
                        return '';
                      }
                    };
                  }
                  model.options.floor = min;
                  model.options.ceil = max;
                }
                break;
            }
            if (index == (models.length - 1)) {
              deferred.resolve(models);
            }
          });
          return deferred.promise;
        },
        getFillOperations: function () {
          return operations;
        },
        getFilterOperations: function (models) {
          return angular.forEach(models, function (model) {
            switch (model.columnType) {
              case 'integer':
              case 'double precision':
              case 'bigint':
              case 'timestamp':
              case 'date':
              case 'numeric':
              case 'time':
              model.filterOperations = filterOperations.slice(1, 5);
              break;
              case 'boolean':
              model.filterOperations = filterOperations.slice(5);
              break;
              default:
              model.filterOperations = filterOperations.slice(0,2);
            }
            model.selectedFilterOperation = model.filterOperations[0];
          });
        },
        clearFilters: function (models) {
          var defaultBoolean = [true,false];
          return angular.forEach(models, function (model) {
            if (model.id !== 'jqgrid_id') model.includeNull = true;
            if(model.edittype === 'custom') model.rowValue = '';
            switch (model.columnType) {
              case 'integer':
              case 'double precision':
              case 'bigint':
              case 'timestamp':
              case 'date':
              case 'numeric':
              case 'time':
                if (model.options) {
                  model.minValue = model.options.floor;
                  model.maxValue = model.options.ceil;
                }
                if (model.textValue) {
                  model.textValue = '';
                }
                break;
              case 'boolean':
                model.booleanValue = angular.copy(defaultBoolean);
                break;
              default:
                model.textValue = '';
            }
          });
        },
        toString: function (o) {
          Object.keys(o).forEach(function (k) {
            if (typeof o[k] === 'object') {
              return toString(o[k]);
            }
            o[k] = '' + o[k];
          });
          return o;
        },
        generateQuery: function (data, filteringColumns, url, numberToDisplay) {
          var rules = [];
          angular.forEach(filteringColumns, function (value) {
            if (value.searchText && value.searchText !== '') {
              if (value.lastUsed) {
                rules.push({
                  field: value.id,
                  op: 'sw',
                  data: value.searchText.toString().toLowerCase()
                });
              } else {
                rules.push({
                  field: value.id,
                  op: 'eq',
                  data: value.searchText
                });
              }
            }
          });
          var filter = {
            groupOp: 'AND',
            rules: rules
          };
          var query = url + '&columnName=' + data.id +
            '&limit=' + numberToDisplay + '&page=' + data.page + '&filters=' + JSON.stringify(filter);
          return query;
        }
      };
    };

    function convertToHHMMSS (value) {
      var sec_num = parseInt(value, 10);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours < 10) hours = "0" + hours;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      return hours + ':' + minutes + ':' + seconds;
    }

  }
})();
