(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridWidget')
    .controller('jqController', jqController);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqController.$inject = ['$scope', '$q', '$rootScope', 'GridService', 'tMessages', 'DataService',
    'GridProvider', 'ScenarioSetService', 'TableActService', 'ngProgressFactory', '$templateCache'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqController($scope, $q, $rootScope, GridService, tMessages, DataService,
      GridProvider, ScenarioSetService, TableActService, ngProgressFactory, $templateCache) {
    // Limit of getting dropdown values
    var numberToDisplay = 40;

    angular.extend($scope, {
      currentUser : $rootScope.currentUser,
      tableTabs: {},
      isLoadBusy : false,
      position : {
        top: 0,
        middle: 1,
        right: 2
      },
      filterName : filterName,
      loadRow : loadRow,
      clearForm : clearForm,
      saveRow : saveRow,
      openPage : openPage,
      prevRow : prevRow,
      nextRow : nextRow,
      selectedItemChange : selectedItemChange,
      quickFilter : quickFilter,
      querySearch : _.debounce(querySearch, 600, {
        'leading': true,
        'trailing': false
      }),
      loadMore : loadMore,
      resetFilter : resetFilter,
      searchTextChange : searchTextChange,
      filterItems : filterItems,
      openHtml: openHtml,
      progressBar : ngProgressFactory.createInstance(),
  });
    $scope.tableTabs['activeTab' + $scope.jqGridTableNames.displayname] = 0;
    $scope.tableTabs['tabs' + $scope.jqGridTableNames.displayname] = {
      grid: 0,
      row: 1
    };

    function filterItems (userInput, dropdownItems) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = dropdownItems.filter(function(item) {
        if (!angular.isUndefined(item)) {
          return (_.isString(item) ? item.toLowerCase() : item.toString().toLowerCase()).indexOf(normalisedInput) === 0;
        }
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }

    // Load dropdown values during the scrolling
    function loadMore(data) {
      if ($scope.isLoadBusy || ((data.page - 1) * numberToDisplay) >= data.totalrows) return;
      $scope.isLoadBusy = true;
      var query = GridProvider.generateQuery(data, $scope.filteringColumns, $scope.gridConfig.getFilterUrl, numberToDisplay);
      GridService.getData(query)
        .then(function(response) {
          data.records.push.apply(data.records, response.result);
          data.page++;
          $scope.isLoadBusy = false;
        });
    }
    // Load dropdown values after setting focus
    function querySearch(data) {
      if ($scope.isLoadBusy) return;
      data.searchCount++;
      $scope.isLoadBusy = true;
      for (var index = 0; index < $scope.filteringColumns.length; index++) {
        $scope.filteringColumns[index].lastUsed = $scope.filteringColumns[index].id === data.id;
      }
      var query = GridProvider.generateQuery(data, $scope.filteringColumns, $scope.gridConfig.getFilterUrl, numberToDisplay);
      return GridService.getData(query)
        .then(function(response) {
          data.records = response.result;
          data.totalrows = response.totalrows;
          data.page++;
          var test = data.records.find(function (record) {
            return record[data.id].toString() === data.searchText;
          });
          if (test) {
            data.selectedItem = test;
          }
          data.searchCount = 0;
          data.selectCount = 0;
          $scope.isLoadBusy = false;
          return data.records;
        });
    }

    function searchTextChange(data) {
      data.selectCount++;
      if (data.selectCount !== (data.searchCount + 1)) {
        data.dataArray = querySearch(data);
      }
      data.page = 1;
    }

    function selectedItemChange (model) {
      model.textValue = model.selectedItem ? model.selectedItem[model.id] : '';
    }

    function filterName (name) {
      return name.replace(/\s+/g, '_');
    }

    function prevRow () {
      if ($scope.rowInfo.currentPage <= 1) return;
      loadRow($scope.rowInfo.currentPage - 1, function () {
        $scope.rowInfo.currentPage--;
      });
    }

    function nextRow () {
      if ($scope.rowInfo.currentPage >= $scope.jqGridTableNames.total_count) return;
      loadRow($scope.rowInfo.currentPage + 1, function () {
        $scope.rowInfo.currentPage++;
      });
    }

    function loadRow (page, callback) {
      var url;
      if (!($scope.widgetOptions && $scope.widgetOptions.filteringUrl)) {
        url = $scope.gridConfig.getRowValueUrl;
      } else {
        var urlStr = $scope.widgetOptions.filteringUrl,
          position = urlStr.indexOf('?scenarioId');
        url = [urlStr.slice(0, position), 'row', urlStr.slice(position)].join('');
      }
      url += '&rows=1&limit=1&page=' + page + '&countRows=' + $scope.jqGridTableNames.total_count;
      GridService.getData(url)
        .then(function (data) {
          $scope.rowData = GridProvider.toString(data);
          $scope.dataModelKey = GridProvider.generateNewModel(
            angular.copy($scope.dataModelKey),
            $scope.rowData
          );
          $scope.rowViewData = {
            topBarColumns: _.filter($scope.dataModelKey, {columnPosition: $scope.position.top}),
            middleBarColumns: _.filter($scope.dataModelKey, {columnPosition: $scope.position.middle}),
            rightBarColumns: _.filter($scope.dataModelKey, {columnPosition: $scope.position.right})
          };
          callback();
        });
    }

    function clearForm (form, models) {
      form.$setPristine();
      form.$setUntouched();
      for (var group in models) {
        if (models.hasOwnProperty(group)) {
          angular.forEach(models[group], function (model) {
            model.rowValue = model.oldValue ? model.oldValue : null;
          });
        }
      }
    }

    function saveRow (form, models) {
      if (form.$valid) {
        var addData = {};
        angular.forEach($scope.dataModelKey, function (model) {
          if (model.editable || model.name == 'jqgrid_id') {
            addData[model.id] = model.rowValue;
          }
        });
        GridService.postData($scope.gridConfig.editGridUrl, addData)
          .then(function (result) {
            DataService.success(tMessages.getTable().saveSuccess('edit'));
            // Call emit to refresh tableau
            $rootScope.$emit('handleBroadcast', 'input');
            $rootScope.$emit('refreshWidget', {
              url: !$scope.widgetOptions.filteringUrl ? $scope.gridConfig.getGridUrl : $scope.widgetOptions.filteringUrl,
              action: !$scope.widgetOptions.filteringUrl ? '' : 'filtering'
            }, $scope.jqGridTableNames.tablename);
            triggerEditAction();
          }, function (err) {
            DataService.error(err);
          });
      }
    }

    function openPage (keyEvent, page) {
      if (keyEvent.which === 13) {
        loadRow(page, function () {
          $scope.rowInfo.currentPage = page;
        });
      }
    }

    function quickFilter (models) {
      $scope.widgetOptions.filterModel = angular.copy($scope.colModel);
      $scope.widgetOptions.filterModel.forEach(function (model) {
        var currentModel = _.find($scope.filteringColumns, {id: model.id});
        if (!_.isUndefined(currentModel)) {
          model.textValue = currentModel.textValue;
        }
      });
      $scope.progressBar.start();
      var filter = {
        groupOp: 'AND',
        rules: GridProvider.getConvertedFilterRules(models)
      };
      $scope.widgetOptions.filter = filter;

      // stringified filter with masked '&' character
      var stringFilter = JSON.stringify(filter).replace(new RegExp('&', 'g'), '%26');
      $scope.widgetOptions.filteringUrl = $scope.gridConfig.getGridUrl + '&_search=true&filters=' + stringFilter;
      GridService.postData($scope.gridConfig.getGridIdUrl, filter)
        .then(function (result) {
          $scope.progressBar.complete();
          $scope.widgetOptions.filteredIds = result;
          $rootScope.$emit('refreshWidget', {
            url: $scope.widgetOptions.filteringUrl,
            action: 'filtering'
          }, $scope.jqGridTableNames.tablename);
          // After filtering open first row
          if ($scope.tableTabs['activeTab' + $scope.jqGridTableNames.displayname]) $scope.openIndividualRecord();
        }, function () {
          $scope.progressBar.reset();
        });
    }

    // Clean Quick filter and refresh jqgrid table
    function resetFilter () {
      $scope.widgetOptions.filterModel = GridProvider.clearFilters($scope.widgetOptions.filterModel);
      _.map($scope.filteringColumns, function functionName(item) {
        item.textValue = '';
        item.searchText = '';
        item.page = 1;
      });
      $scope.widgetOptions.filteringUrl = '';
      $rootScope.$emit('refreshWidget', {
        url: $scope.gridConfig.getGridUrl,
        action: 'reset_filter'
      }, $scope.jqGridTableNames.tablename);
    }

    function openHtml(html) {
      return $templateCache.get('app/tabs_img/' + html);
    }

    // Trigger table edit action
    function triggerEditAction() {
      if (!$scope.gridConfig.triggers) return;

      $scope.gridConfig.triggers.forEach(function (trigger) {
        if (trigger.isEnabled &&
            trigger.type === 'tableEdit' &&
            trigger.action.segment === $scope.gridConfig.type) {
          $rootScope.$emit('runAction', trigger.actionId, trigger._id);
        }
      });
    }
  }
})();
