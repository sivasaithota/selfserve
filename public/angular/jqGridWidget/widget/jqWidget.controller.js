(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridWidget')
    .controller('jqWidController', jqWidController);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqWidController.$inject = ['$scope', '$timeout', '$filter', '$rootScope', 'TableActService', 'GridService',
    'GridProvider', 'DataService', 'tMessages', 'ngProgressFactory', 'ScenarioSetService', 'TableService', '$mdDialog',
    '$templateCache'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqWidController($scope, $timeout, $filter, $rootScope, TableActService, GridService, GridProvider,
                           DataService, tMessages, ngProgressFactory, ScenarioSetService, TableService, $mdDialog,
                           $templateCache) {
    var watchCountEdit = 0;
    var watchCountDelete = 0;
    var appInfo = $scope.widgetInfo;
    var isEditable = appInfo.rowsData && appInfo.rowsData.length === 1;
    var defaultBoolean = [true,false];
    angular.extend($scope, {
      invalidSymbols           : /^[^']*$/,
      tabName                  : appInfo.tabName,
      addModels                : angular.copy(appInfo.colModel),
      tabs                     : GridProvider.getTabOptions(appInfo.tabName, isEditable, appInfo.type, appInfo.isScenarioActive, appInfo.table.editable),
      editModels               : isEditable ? GridProvider.generateNewModel(angular.copy(appInfo.colModel), appInfo.colData): [],
      invalidInputFiles        : [],
      modelOptionsInput        : {},
      multipleInput            : true,
      patternInput             : '.csv,.xls,.xlsx',
      filters                  : [''],
      fillOperations           : GridProvider.getFillOperations(),
      fillOperations           : GridProvider.getFillOperations(),
      scrollConfig             : {
        autoHideScrollbar      : true,
        theme                  : 'minimal',
        advanced               : {
          updateOnContentResize: true
        }
      },
      booleanItems             : angular.copy(defaultBoolean),
      selectedBoolean          : angular.copy(defaultBoolean),
      deleteAll                : false,
      dataToDelete             : $scope.widgetInfo.rowsData,
      largeFileWarning         : tMessages.getTable().largeFileWarning.split('.'),
      changeTab                : changeTab,
      uploadFile               : uploadFile,
      clearFilters             : clearFilters,
      filterRows               : filterRows,
      saveRow                  : saveRow,
      getFilter                : getFilter,
      clearForm                : clearForm,
      closeWidget              : closeWidget,
      deleteRow                : deleteRow,
      addFilterColumn          : addFilterColumn,
      deleteFilterColumn       : deleteFilterColumn,
      updateRows               : updateRows,
      opentFilter              : opentFilter,
      updateOperation          : updateOperation,
      updateParentValue        : updateParentValue,
      toggleBoolean            : toggleBoolean,
      existsBoolean            : existsBoolean,
      loadDeleteTemplate       : loadDeleteTemplate,
      selectItemToDelete       : selectItemToDelete,
      downloadTable            : downloadTable,
      selecteBooleanValue      : selecteBooleanValue,
      getFilterOperations      : getFilterOperations,
      refreshSlider            : refreshSlider,
      // Checkboxes models
      checkbox                 : {
        skipHeader: true,
        appendData: false
      },
      progressBar              : ngProgressFactory.createInstance(),
    });
    $scope.newOperations = [$scope.fillOperations[0]];

    // Init filters
    function getFilterOperations(models) {
      models = GridProvider.getFilterOperations(models);
    }

    if (appInfo.tabName === 'filter') getFilter();

    // Watch data for selected row
    $scope.$watch('widgetInfo.colData', function (newVal, oldVal) {
      if (!_.isEmpty(newVal) && watchCountEdit) {
        var deleteTab = _.find($scope.tabs, {name: 'delete'});
        var editTab = _.find($scope.tabs, {name: 'edit'});
        appInfo.tabName = 'edit';
        if (!deleteTab.active) editTab.active = true;
        $scope.isEditable = true;
        $scope.isDeleteable = true;
        $scope.editModels = GridProvider.generateNewModel(angular.copy(appInfo.colModel), newVal);
      }
      watchCountEdit++;
    });

    // Watch data for selected rows
    $scope.$watch('widgetInfo.rowsData', function (newVal, oldVal) {
      if (watchCountDelete) {
        var editTab = _.find($scope.tabs, {name: 'edit'});
        editTab.visible = newVal.length === 1 ? true : false;
        $scope.dataToDelete = newVal;
        loadDeleteTemplate();
      }
      watchCountDelete++;
    });

    // Init sliders
    function refreshSlider () {
      $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
      });
    }

    // Change tab activity by clicking on icon
    function changeTab (tab) {
      $scope.tabName = tab.name;
      tab.active = true;
      if (tab.name === 'filter') {
        getFilter();
      }
      // Hide delete tab if user move from it and selected rows are more than one
      if (tab.name !== 'delete' && appInfo.rowsData.length > 1) {
        $rootScope.$emit('resetRows', appInfo.table.tablename);
      }
      if (tab.name === 'delete') {
        loadDeleteTemplate();
        $rootScope.$emit('enableMultiselect', true, appInfo.table.tablename);
      } else {
        $rootScope.$emit('enableMultiselect', false, appInfo.table.tablename);
      }
    }

    // Upload file for table with new data
    function uploadFile (ev, file) {
      // when function is called after choosing xsl/xslx sheet
      if (!file) {
        processFile(ev, $scope.uploadedFile);
        return;
      }

      $scope.uploadedFile = file;
      // If CSV file is uploaded, processing it immediately
      if (file.name.split('.').pop().toLowerCase() === 'csv') {
        processFile(ev, file);
        return;
      }

      $scope.uploadedFile.sheet = 0;
      // Parsing the xsl/xslx file to get the list of sheets in it
      var reader = new FileReader();
      reader.onload = function(e) {
        var workbook = XLSX.read(e.target.result, {
          type: 'binary'
        });

        // if there are more than 1 sheet, updating the view with options to choose which sheet to upload
        if (workbook.SheetNames.length > 1) {
          $scope.sheets = workbook.SheetNames;
          $scope.$apply(); // explicitly telling Angular to update the view
        } else {
          processFile(ev, $scope.uploadedFile);
        }
      };
      reader.readAsBinaryString(file);
    }

    // Processing the uploaded file
    function processFile(event, file) {
      // Composing the form data with uploaded file to send to the server
      var formData = new FormData();
      formData.append('file', file);
      formData.append('skipHeader', $scope.checkbox.skipHeader);
      formData.append('xlsSheet', file.sheet);
      formData.append('scenarioId', appInfo.pid);
      formData.append('dataTableName', $scope.widgetInfo.table.tablename);
      formData.append('tableType', appInfo.type);
      formData.append('appendData', $scope.checkbox.appendData);

      // Showing modal window for single file upload
      $mdDialog.show({
        template: $templateCache.get('app/single-download-upload.ejs'),
        targetEvent: event,
        controller: singleLoadController,
        locals: {
          scenarioID: appInfo.pid,
          table: $scope.widgetInfo.table,
          uploadDetails: {
            formData: formData,
            fileName: file.name
          },
          downloadDetails: null
        }
      }).then(function (result) {
        if (!result) {
          closeWidget();
          return;
        }

        $scope.widgetInfo.table.updatedBy = result.updated_by;
        $scope.widgetInfo.table.updatedAt = result.updated_at;
        closeWidget($scope.widgetInfo.table, 'upload');
        refreshWidget({ action: 'upload' });
        triggerUploadAction();
      }).catch(function () {
        closeWidget();
      });
    }

    // Trigger table upload action
    function triggerUploadAction() {
      if (!appInfo.triggers) return;
      var triggerToRun;

      appInfo.triggers.forEach(function (trigger) {
        // For each trigger enabled for current segment
        if (!trigger.isEnabled || trigger.action.segment !== appInfo.type) return;

        // Saving trigger if its type is Edit table and trigger of type Upload table is not saved yet,
        // because the Upload table trigger is more specific
        if (trigger.type === 'tableEdit' && !triggerToRun) {
          triggerToRun = trigger;
          return;
        }

        // If trigger type is Upload table and it is configured for the uploaded table and current scenario
        if (trigger.type === 'tableUpload' &&
            trigger.tableName === appInfo.table.tablename &&
            trigger.scenarioId === parseInt(appInfo.pid)) {
          triggerToRun = trigger;
        }
      });

      // Running a trigger action if one is found
      if (triggerToRun) $rootScope.$emit('runAction', triggerToRun.actionId, triggerToRun._id);
    }

    // Trigger table edit action
    function triggerEditAction() {
      if (!appInfo.triggers) return;

      appInfo.triggers.forEach(function (trigger) {
        if (trigger.isEnabled &&
            trigger.type === 'tableEdit' &&
            trigger.action.segment === appInfo.type) {
          $rootScope.$emit('runAction', trigger.actionId, trigger._id);
        }
      });
    }

    // Reset range fields values to defaults
    function clearFilters (models) {
      models = GridProvider.clearFilters(models);
      $scope.widgetInfo.filteringUrl = '';
      $scope.selectedBoolean = angular.copy(defaultBoolean);
      refreshWidget({
        url: appInfo.urls.getGrid,
        action: 'reset_filter'
      });
      $scope.newOperations = [$scope.fillOperations[0]];
      $scope.filters = [''];
    }

    // Generate url with filtered columns values to updating the table
    function filterRows (models) {
      var rules = GridProvider.getConvertedFilterRules(models);
      if (_.isError(rules)) {
        DataService.error(rules.message);
        $scope.progressBar.reset();
      } else {
        var filter = {
          groupOp: 'AND',
          rules: rules
        };
        $scope.widgetInfo.filter = filter;
        $scope.widgetInfo.filteringUrl = appInfo.urls.getGrid + '&_search=true&filters=' + JSON.stringify(filter).replace(new RegExp('&', 'g'), '%26');
        GridService.postData(appInfo.urls.getGridId, filter)
          .then(function (result) {
            $scope.progressBar.complete();
            $scope.widgetInfo.filteredIds = result;
            refreshWidget({
              url: $scope.widgetInfo.filteringUrl,
              action: 'filtering'
            });
          }, function () {
            $scope.progressBar.reset();
          });
      }
    }

    // Add or Edit row
    function saveRow (form, type, models) {
      if (form.$valid) {
        var addData = {};
        angular.forEach(models, function (model) {
          if (model.editable || model.name === 'jqgrid_id' || type === 'add') {
            addData[model.id] = model.rowValue ? model.rowValue : '';
          }
        });
        GridService.postData(
            type === 'add' ? appInfo.urls.addGrid : appInfo.urls.editGrid,
            type === 'add' ? JSON.stringify(addData) : addData
        )
          .then(function (result) {
            DataService.success(tMessages.getTable().saveSuccess(type));
            // Call emit to refresh tableau
            $rootScope.$emit('handleBroadcast', 'input');
            if ($scope.widgetInfo.filteringUrl) {
              $scope.widgetInfo.filteringUrl = '';
              models = GridProvider.clearFilters(models);
            }
            refreshWidget({
              action: type,
              url: appInfo.urls.getGrid
            });
            closeWidget();
            triggerEditAction();
          }, function (err) {
            DataService.error(err);
          });
      }
    }

    // Get range values for each column
    function getFilter () {
      return GridService.getData(appInfo.urls.rangeValue)
        .then(function (data) {
          $scope.rangeValue = data;
          return GridProvider.setRangeOptions($scope.widgetInfo.filterModel, $scope.rangeValue, appInfo.floatList);
        })
        .then(function (result) {
          $scope.widgetInfo.filterModel = result;
          refreshSlider();
        });
    }

    // Reset add / edit form to defaul values
    function clearForm (form, models) {
      form.$setPristine();
      form.$setUntouched();
      angular.forEach(models, function (value) {
        value.rowValue = value.oldValue ? value.oldValue : null;
      });
    }

    // Hide widget window
    function closeWidget (tableInfo, action) {
      $rootScope.$emit('closeWidget', tableInfo, action, appInfo.table.tablename);
    }

    // Delete selected row
    function deleteRow (idsArr) {
      if ((idsArr.length && !$scope.deleteAll) || ($scope.deleteAll && appInfo.totalCount)) {
        $rootScope.$emit('deleteRow', idsArr, appInfo.table.tablename);
      } else {
        DataService.error(tMessages.getTable().deleteError);
      }
    }

    // Refresh jqgrid table
    function refreshWidget (data) {
      $rootScope.$emit('refreshWidget', data, appInfo.table.tablename);
    }

    // Unselect jqgrid rows
    function unselectRows (data) {
      $rootScope.$emit('unselectRows', appInfo.table.tablename);
    }

    // Add column to the list for multiple editing
    function addFilterColumn () {
      $scope.filters.push('');
      $scope.newOperations.push($scope.fillOperations[0]);
    }

    // Delete column to the list for multiple editing
    function deleteFilterColumn (index) {
      $scope.filters.splice(index, 1);
      $scope.newOperations.splice(index, 1);
    }

    // Update columns value for several rows
    function updateRows (form, filters) {
      if (form.$valid) {
        $scope.progressBar.start();
        GridService.postData(appInfo.urls.multiEditGrid, {
          rowsId: $scope.widgetInfo.filteredIds,
          rowsData: filters
        })
          .then(function () {
            // Call emit to refresh tableau
            $rootScope.$emit('handleBroadcast', 'input');
            // Get range values
            return GridService.getData(appInfo.urls.rangeValue);
          })
          .then(function (data) {
            DataService.success(tMessages.getTable().saveSuccess('edit'));
            triggerEditAction();
            $scope.rangeValue = data;
            return GridProvider.updateRangeOptions($scope.widgetInfo.filterModel, $scope.rangeValue);
          })
          .then(function (result) {
            $scope.widgetInfo.filterModel = result;
            refreshSlider();
            return filterRows($scope.widgetInfo.filterModel);
          })
          .then(function () {
            $scope.progressBar.complete();
          })
          .catch(function (err) {
            $scope.progressBar.reset();
            DataService.error(err);
          });
      } else {
        DataService.error('All fields are required!');
      }
    }

    // Open filter tab
    function opentFilter (tab) {
      if (tab.view == 'filter_quick') refreshSlider();
      tab.active = true;
    }

    // Update operator for filter fill
    function updateOperation (operation, model) {
      model.operator = operation.operator;
      model.percentage = operation.percentage;
    }

    // Find dependencies dependent fields and update value for it
    function updateParentValue (parentModel) {
      var daughterModel = _.find($scope.widgetInfo.filterModel, {parentColumnName: parentModel.name});
      if (daughterModel) {
        daughterModel.parentColumnValue = parentModel.textValue;
      }
    }

    function toggleBoolean (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) list.splice(idx, 1);
      else list.push(item);
    }

    function existsBoolean (item, list) {
      return list.indexOf(item) > -1;
    }

    // Set value for deleting template
    function loadDeleteTemplate () {
      $scope.deletedRows = _.map($scope.dataToDelete, function (row) {
        return row.jqgrid_id;
      });
    }

    function selectItemToDelete (isDelete) {
      $scope.deleteAll = isDelete;
      if (isDelete) {
        $rootScope.$emit('resetRows', appInfo.table.tablename);
      } else {
        $rootScope.$emit('activateSelecting', appInfo.table.tablename);
      }
    }

    // Download btn click handler
    function downloadTable(event) {
      // Showing modal window for file download
      $mdDialog.show({
        template: $templateCache.get('app/single-download-upload.ejs'),
        targetEvent: event,
        controller: singleLoadController,
        locals: {
          scenarioID: appInfo.pid,
          table: $scope.widgetInfo.table,
          downloadDetails: {
            scenarioName: appInfo.scenarioName,
            tableType: appInfo.type,
            // With filter data if tab is filter
            filter: $scope.widgetInfo.filter ? JSON.stringify($scope.widgetInfo.filter) : null
          },
          uploadDetails: null
        }
      }).then(function () {
        $scope.closeWidget();
      });
    }

    function selecteBooleanValue () {
      return angular.copy(defaultBoolean);
    }

  }
})();
