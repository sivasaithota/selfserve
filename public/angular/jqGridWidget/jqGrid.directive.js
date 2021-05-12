(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('jqGridWidget')
    .directive('jqGridTable', jqGridTable);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqGridTable.$inject = ['$document', '$window','$q', '$timeout', '$filter', '$rootScope', '$compile', 'FileSaver',
    'GridProvider', 'GridService', 'DataService', 'tMessages'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqGridTable($document, $window, $q, $timeout, $filter, $rootScope, $compile, FileSaver, GridProvider,
                       GridService, DataService, tMessages) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'EA',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      controller: 'jqController',
      // bind data to the directive's scope
      scope: {
        jqGridActive: '=',
        jqGridTableNames: '=',
        jqGridConfig: '=',
        jqCallbackFn: '&jqCallbackFn',
        jqErrorFn: '=',
        subTabName: '='
      },
      replase: true,
      // templateUrl specifies the HTML markup that will be produced
      // when the directive is compiled and linked by Angular
      templateUrl: 'jqGridWidget/index.ejs'
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
      // and their corresponding attribute values
      var tablename,
        visibleColums,
        jqGridTableCols,
        lastEditedRowId,
        horizontalScrollPosition,
        _options;
      var rowsNumber = 14;

      var highResolution = 1840,
        multiSelectForDelete = false,
        isDeleteActive = false,
        isCellEditActive = false,
        lastEditedCell = {};

      var currentUser = $rootScope.currentUser;
      scope.isFullSize = $rootScope.isFullSize || false;
      scope.metainfoColumnHidden = true;
      scope.progressBar = $rootScope.progressBar;
      angular.element(element).css({
        overflow: 'auto'
      });

      scope.$watch('jqGridActive', function (value) {
        if (value && !scope.isLoaded) {
          tableParse(scope.jqGridTableNames)
        }
        if (scope.isLoaded) closeWidget();
      });

      // jqgrid_id is a custom key column using for add, edit, delete rows
      function tableParse (value) {
        if (!angular.isUndefined(value)) {
          scope.jqGridTableNames.editable = !_.isUndefined(scope.jqGridTableNames.editable)
            ? scope.jqGridTableNames.editable : true;
          scope.gridConfig = JSON.parse(scope.jqGridConfig);
          _options = angular.copy(GridProvider.getDefaults(scope.gridConfig));
          scope.isScenarioActive = _options.scenarioStatus;
          jqGridTableCols = _.map(scope.jqGridTableNames.columnlist.split(","), _.trim);
          _options.editableColums = !_.isNull(scope.jqGridTableNames.editablecolumns) ? scope.jqGridTableNames.editablecolumns.split(",") : [];
          visibleColums = !_.isNull(scope.jqGridTableNames.visiblecolumns) && scope.jqGridTableNames.visiblecolumns.length > 0 ? scope.jqGridTableNames.visiblecolumns.split(",") : [];
          tablename = scope.jqGridTableNames.tablename.replace(/\s+/g, '_');
          _options.tablenameServer = scope.jqGridTableNames.tablename;
          angular.forEach(visibleColums, function (val) {
            _options.displayList.push(scope.jqGridTableNames.displaylist[val]);
          });
          // Generate default model sctructure for the quick filter
          if (scope.jqGridTableNames.filter) {
            scope.filteringColumns = _.map(scope.jqGridTableNames.filter.split(","), function(item, index) {
                return {
                  id: item,
                  searchText: '',
                  page: 1,
                  records: []
                };
            });
          } else {
            scope.filteringColumns = [];
          }
          if (!_.isNull(scope.jqGridTableNames.columnlistwithtypes)) {
            var columnListWithTypes = scope.jqGridTableNames.columnlistwithtypes.split(',');
            angular.forEach(columnListWithTypes, function (n) {
              n.replace(/^[\ ]{2,}/, ' ');
              n = n.split('" ');
              var columnObject = {};
              columnObject[n[0].replace('"', '')] = n[1];
              _options.columnTypes.push({
                value: n[0].replace('"', ''),
                key: n[1]
              });
            });
          } else {
            _options.columnTypes = _.range(jqGridTableCols.length).map(function () {
              return 'text';
            });
          }
          if (scope.jqGridTableNames.filter) {
            scope.filteringColumns.map(function (column) {
              column.columnType = _options.columnTypes
                .find(function (columnType) {
                  return columnType.value === column.id;
                })
                .key;
              return column;
            })
          } else {
            scope.filteringColumns = [];
          }
          scope.editFunctions = _options.editFunctions;
          initModel();
          // Set jqGrid configuration
          $.jgrid.defaults.styleUI = 'Bootstrap';
          $.extend($.jgrid.defaults, {
            ajaxRowOptions: {
              beforeSend: function (jqXHR, settings) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
              }
            },
            ajaxCellOptions: {
              beforeSend: function (jqXHR, settings) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
              }
            }
          });
        }
      };

      function initModel() {
        $timeout(function () {
          scope.tabFunctions = _options.tabFunctions;
          closeWidget();
          // GET edit options information
          GridService.getData(_options.getEditTableUrl)
            .then(function (result) {
              _options.colModel.push({
                key: true,
                id: 'jqgrid_id',
                name: 'jqgrid_id',
                hidden: true,
                editable: false
              });
              angular.forEach(visibleColums, function (value, key) {
                var typeWithValue = _.find(_options.columnTypes, {
                  value: value
                });
                var editedIndex = _options.editableColums.indexOf(value);
                typeWithValue = typeWithValue ? typeWithValue.key : 'text';
                var colum = {
                  name: value,
                  id: value,
                  columnType: typeWithValue,
                  sortable: true,
                  index: value,
                  displayname: scope.jqGridTableNames.displaylist[value],
                  editable: (editedIndex > -1 && scope.jqGridTableNames.editable) ? true : false,
                  columnPosition: scope.jqGridTableNames.column_position ?
                    scope.jqGridTableNames.column_position[value] :
                    null,
                  columnOrder: scope.jqGridTableNames.column_order ?
                    scope.jqGridTableNames.column_order[value] :
                    null
                };
                var editOption = _.find(result, {
                  column_name: value
                });
                if (!editOption) {
                  // add type of the columns
                  switch (typeWithValue) {
                    case 'numeric':
                    case 'double precision':
                      var floatVal = scope.jqGridTableNames.columnfloat ? scope.jqGridTableNames.columnfloat[value] : 0;
                      colum.sorttype = 'integer';
                      colum.formatter = function (cellValue) {
                        return (_.isNull(cellValue) || cellValue === '') ? '' : $filter('number')(cellValue, floatVal ? floatVal : 2);
                      };
                      colum.unformat = function (cellValue) {
                        return cellValue.replace(/,/g,'')
                      };
                      colum.cellattr = function (cellvalue) {
                        return 'class="center-text"';
                      };
                      break;
                    case 'integer':
                    case 'bigint':
                      colum.sorttype = 'integer';
                      colum.formatter = function (cellValue) {
                        return (_.isNull(cellValue) || cellValue === '') ? '' : $filter('number')(cellValue);
                      };
                      colum.unformat = function (cellValue) {
                        return cellValue.replace(/,/g,'')
                      };
                      colum.formatoptions = {
                        decimalPlaces: 0
                      };
                      break;
                    case 'date':
                      colum.sorttype = 'date';
                      colum.formatter = function (cellValue) {
                        return (_.isNull(cellValue) || cellValue === '') ? '' : moment.utc(cellValue).format('MM/DD/YYYY');
                      };
                      colum.unformat = function (cellValue) {
                        return cellValue.replace(/\//g,'-');
                      };
                      colum.formatoptions = {
                        srcformat: 'ISO8601Long',
                        newformat: 'm/d/Y'
                      };
                      colum.searchoptions = {
                        sopt: ['eq', 'lt', 'le', 'gt', 'ge']
                      };
                      break;
                    case 'time':
                      colum.sorttype = 'date';
                      colum.formatoptions = {
                        srcformat: 'H:i:s',
                        newformat: 'H:i:s'
                      };
                      colum.searchoptions = {
                        sopt: ['eq', 'lt', 'le', 'gt', 'ge']
                      };
                      break;
                    case 'timestamp':
                      colum.sorttype = 'date';
                      colum.formatter = function (cellValue) {
                        return (_.isNull(cellValue) || cellValue === '') ? '' : moment.utc(cellValue).format('MM/DD/YYYY HH:mm:ss');
                      };
                      colum.unformat = function (cellValue) {
                        return cellValue.replace(/\//g,'-');
                      };
                      colum.formatoptions = {
                        srcformat: 'Y/m/d H:i:s',
                        newformat: 'm/d/Y H:i:s'
                      };
                      colum.searchoptions = {
                        sopt: ['eq', 'lt', 'le', 'gt', 'ge']
                      };
                      break;
                    default:
                      colum.cellattr = function (cellvalue) {
                        return 'class="center-left"';
                      };
                      colum.sorttype = _options.columnTypes[key];
                  }
                } else {
                  colum.edittype = 'custom';
                  colum.editrules = {
                    required: true,
                    custom: true,
                    custom_func: function (value, colname) {
                      return [true];
                    }
                  };
                  colum.editoptions = {
                    custom_element: function(value, options) {
                      var elemStr = '<input-dropdown input-class-name="md-input" ';
                      elemStr += 'input-placeholder="" ';
                      elemStr += 'input-name="' + options.name + '" ';
                      elemStr += 'input-required="false" ';
                      elemStr += 'selected-item="' + (value ? '\'' + value + '\'' : '\'\'') + '" ';
                      elemStr += 'default-dropdown-items="[]" ';
                      elemStr += 'dropdown-list-url="' + (_options.getEditColumnUrl + options.name) + '" ';
                      elemStr += 'allow-custom-input="' + editOption['custom_values'] + '" ';
                      elemStr += 'filter-list-method="filterItems(userInput, dropdownItems)" ';
                      elemStr += 'emit-name="successEdit" ';
                      elemStr += '></input-dropdown>';
                      elemStr = $compile(elemStr)(scope);
                      scope.$apply();
                      return elemStr;
                    },
                    custom_value: function (elem, operation, value) {
                      if(operation === 'get') {
                        return angular.element(elem).find('input').val();
                      }
                    }
                  };
                  colum.custom_values = editOption['custom_values'];
                  colum.custom_result = [];
                  colum.parentColumnName = editOption['parent_column_name'];
                }
                _options.colModel.push(colum);
              });
              if (scope.jqGridTableNames.meta_info_exists) {
                _options.colModel.push({
                  id:'Meta Info',
                  name: '',
                  displayname : '',
                  width : 20,
                  hidden: false,
                  editable: false,
                  sortable: false,
                  formatter: formatMetaInfo,
                  cellattr: metaInfoCellAttr
                });
              }
              angular.element('#jqGrid_' + tablename).GridUnload('#jqGrid_' + tablename);
              initTable();
            }, function (err) {
              scope.jqErrorFn({
                'responseText': err
              });
            });
        }, 1);
      }

      function initTable() {
        $timeout(function () {
          var rowValue = scope.isFullSize ? rowsNumber + 4 : rowsNumber;
          scope.colModel = _options.colModel;
          scope.widgetOptions = {
            filterTabs: GridProvider.getFilterTabOptions(false, _options.scenarioStatus, scope.jqGridTableNames.editable),
            pid: _options.pid,
            scenarioName: _options.scenarioName,
            type: scope.jqGridTableNames.type,
            table: {
              id: scope.jqGridTableNames.id,
              tablename: scope.jqGridTableNames.tablename,
              editable: scope.jqGridTableNames.editable,
              displayname: scope.jqGridTableNames.displayname,
              updatedBy: scope.jqGridTableNames.updated_by,
              updatedAt: scope.jqGridTableNames.updated_at
            },
            colModel: _options.colModel,
            urls: {
              getGrid: _options.getGridUrl,
              getGridId: _options.getGridIdUrl,
              addGrid: _options.addGridUrl,
              editGrid: _options.editGridUrl,
              editCell: _options.editCellUrl,
              deleteGrid: _options.deleteGridUrl,
              rangeValue: _options.getRangeValueUrl,
              editColumn: _options.getEditColumnUrl,
              multiEditGrid: _options.multiEditGridUrl
            },
            homeTooltips: _options.homeTooltips,
            triggers: _options.triggers,
            isScenarioActive: _options.scenarioStatus,
            totalCount: scope.jqGridTableNames.total_count,
            floatList: scope.jqGridTableNames.columnfloat,
            mainTabs: scope.tabs
          };
          angular.element('#jqGrid_' + tablename).jqGrid({
            url: _options.getGridUrl,
            editurl: _options.editGridUrl,
            cellurl: _options.editCellUrl,
            mtype: 'GET',
            datatype: 'json',
            colNames: ['jqgrid_id'].concat(_options.displayList).concat(scope.jqGridTableNames.meta_info_exists ? '' : []),
            colModel: _options.colModel,
            rowNum: rowValue,
            rowList: [rowValue, rowValue * 2, rowValue * 3],
            pager: '#pager_jqgrid_' + tablename,
            cellsubmit : 'remote',
            toolbarfilter: true,
            viewrecords: true,
            recordpos: 'right',
            caption: 'jqGrid widget',
            multiselect: true,
            errorCell: function(serverresponse, status){
              if(serverresponse.status !== 200)
                DataService.error(serverresponse.responseText || status);
            },

            loadBeforeSend: function (jqXHR) {
              // Saving the horizontal scroll position and adding auth token to the request header
              horizontalScrollPosition = $('.ui-jqgrid-bdiv').scrollLeft();
              jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
            },

            loadError: function (resp) {
              DataService.error(resp.responseText);
            },

            // After grid loaded
            loadComplete: function (data) {
              // Restoring horizontal scroll to the saved position
              $('.ui-jqgrid-bdiv').scrollLeft(horizontalScrollPosition);

              // Updating number of rows in the table list
              scope.isLoaded = true;
              scope.jqGridTableNames.total_count = Number(data.records);
              scope.widgetOptions.totalCount = scope.jqGridTableNames.total_count;
              scope.jqGridTableNames.page = Number(data.page);
              var filterTab = _.find(scope.widgetOptions.filterTabs, {
                view: 'filter_quick'
              });
              var fillTab = _.find(scope.widgetOptions.filterTabs, {
                view: 'filter_fill'
              });
              var deleteTab = _.find(scope.widgetOptions.filterTabs, {
                view: 'filter_delete'
              });
              var downloadTab = _.find(scope.widgetOptions.filterTabs, {
                view: 'download'
              });

              if (scope.isFullSize) angular.element(angular.element.find('.ui-jqgrid-bdiv')).css('min-height', 'calc(100% - 245px)');

              if (_options.tabAction === 'filtering') {
                scope.widgetOptions.isFiltered = true;
                filterTab.icon = 'filtered';
                fillTab.visible = scope.widgetOptions.isFiltered && currentUser.functions.Grid_Edit && _options.scenarioStatus && scope.jqGridTableNames.editable;
                deleteTab.visible = scope.widgetOptions.isFiltered && currentUser.functions.Grid_Delete && _options.scenarioStatus && scope.jqGridTableNames.editable;
                downloadTab.visible = scope.widgetOptions.isFiltered && currentUser.functions.Grid_Download;
              }
              // After adding
              if (_options.tabAction === 'add') {
                scope.jqCallbackFn({
                  event: _options.ev,
                  inputData: scope.jqGridTableNames,
                  id: _options.pid
                });
              }
              // After editing
              if (_options.tabAction === 'edit') {
                scope.jqCallbackFn({
                  event: _options.ev,
                  inputData: scope.jqGridTableNames
                });
              }
              // After reseting filters
              if (_options.tabAction === 'reset_filter' || _options.tabAction === 'add' || _options.tabAction === 'edit') {
                scope.widgetOptions.isFiltered = false;
                filterTab.icon = 'filter';
                fillTab.visible = scope.widgetOptions.isFiltered;
                deleteTab.visible = scope.widgetOptions.isFiltered;
                downloadTab.visible = scope.widgetOptions.isFiltered;
                scope.widgetOptions.filteredIds = [];
              }
              resetSelection();
              if (scope.isFullSize) {
                setMainMenuPosition();
              }
              delete _options.tabAction;
            },

            gridComplete: function (result) {
              $timeout(function () {
                scope.editFunctions.isEdited = false;
                scope.editFunctions.isDeleted = false;
              }, 1);
              var gridName = this.id;
              angular.element(element).parent().append('<div id="widthTest_' + tablename + '" style="display:inline-block;overflow: visible;"></div>');
              $('#' + gridName).css('cssText', 'width: inherit !important');
              $('#' + gridName).parent().css('cssText', 'width: inherit !important');
              var columnNames = $("#" + gridName).jqGrid('getGridParam', 'colModel'),
                tableContainer = angular.element(angular.element.find('.ui-jqgrid-bdiv')).width() * 0.8;
              if (!columnNames) return;
              for (var itm = 0, itmCount = columnNames.length; itm < itmCount; itm++) {
                var curObj = $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]');
                var thisCell = $('[id*="' + gridName + '_' + columnNames[itm].name + '"]').find('div');
                $('#widthTest_' + tablename).html(columnNames[itm].name).css({
                  'font-family': thisCell.css('font-family'),
                  'font-size': thisCell.css('font-size'),
                  'font-weight': thisCell.css('font-weight')
                });
                var maxWidth = 150;
                if (columnNames[itm].name === '') {
                  // set metainfo column width
                  maxWidth = 20;
                } else {
                  for (var itm2 = 0, itm2Count = curObj.length; itm2 < itm2Count; itm2++) {
                    var smallCell = $(curObj[itm2]);
                    $('#widthTest_' + tablename).html(smallCell.html()).css({
                      'font-family': smallCell.css('font-family'),
                      'font-size': smallCell.css('font-size'),
                      'font-weight': smallCell.css('font-weight')
                    });
                    var thisWidth = $('#widthTest_' + tablename).width() + 20;
                    if (thisWidth > maxWidth && tableContainer > thisWidth) {
                      maxWidth = thisWidth;
                    }
                  }
                }
                $('#' + gridName + ' .jqgfirstrow td:eq(' + itm + ')').css('width', maxWidth);
                $('#' + gridName + ' .jqgfirstrow td:eq(' + itm + ')').css('min-width', maxWidth);
                $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]').css('width', maxWidth);
                $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]').css('min-width', maxWidth);
                $('th[id="' + gridName + '_' + columnNames[itm].name + '"]').css('width', maxWidth);
                $('th[id="' + gridName + '_' + columnNames[itm].name + '"]').css('min-width', maxWidth);

                // hide metainfo column by default
                if (columnNames[itm].name === '') {
                  $('#' + gridName + ' .jqgfirstrow td:eq(' + itm + ')').css('display', 'none');
                  $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]').css({
                    display : 'none',
                    padding : '0px'
                  });
                  $('th[id="' + gridName + '_' + columnNames[itm].name + '"]').css('display', 'none');
                }
              }
              // set metainfo column hidden
              scope.metainfoColumnHidden = true;
              $('#widthTest_' + tablename).remove();
              var headerHeight = element.find('.ui-jqgrid-htable').actual('height');
              if (headerHeight > _options.defaultHeight) {
                $('div[id^="jqgh_"]').css('height', headerHeight);
              }

              // create tooltip html and hide it
              var tooltipHtmlContainer = '<div class="grid-tooltip" id="tooltip-container_' + tablename + '"></div>';
              if (!angular.element('#tooltip-container_' + tablename)[0]) {
                angular
                  .element('#jqGrid_' + tablename)
                  .append(tooltipHtmlContainer);
              }
              angular
                .element('#tooltip-container_' + tablename)
                .css({
                  opacity : '0',
                  height : '0px',
                });
              // activation show tooltip
              $('.jq_meta_selector').mouseover(function(e) {
                // clear tooltip div
                angular
                  .element('#tooltip-container_' + tablename)
                  .empty();

                // add new html
                var tooltipHtml = '<div class="tooltip-block-wrapper">' +
                  '<div class="tooltip-header-wrapper">CREATED BY</div>' +
                  '<div class="tooltip-data-wrapper">' + $(this).attr('op_created_by') + '</div>' +
                '</div>' +
                '<div class="tooltip-block-wrapper">' +
                  '<div class="tooltip-header-wrapper">CREATED ON</div>' +
                  '<div class="tooltip-data-wrapper">' + $(this).attr('op_created_at') + '</div>' +
                '</div>' +
                '<div class="tooltip-block-wrapper">' +
                  '<div class="tooltip-header-wrapper">UPDATED BY</div>' +
                  '<div class="tooltip-data-wrapper">' + $(this).attr('op_updated_by') + '</div>' +
                '</div>' +
                '<div class="tooltip-block-wrapper">' +
                  '<div class="tooltip-header-wrapper">UPDATED ON</div>' +
                  '<div class="tooltip-data-wrapper">' + $(this).attr('op_updated_at') + '</div>' +
                '</div>';
                angular
                  .element('#tooltip-container_' + tablename)
                  .append(tooltipHtml);

                // calculate tooltip position
                var topPos = e.pageY -
                  ( ($window.innerHeight - e.pageY) > (scope.isFullSize ? 280 : 180) ? 100 : 280) -
                  (scope.isFullSize ? 0 : 120);
                var leftPos = e.pageX - (scope.isFullSize ? 200 : 490) +
                  (angular.element('#jqGrid_' + tablename).innerWidth() -
                  angular.element('#jqGrid_' + tablename).parent().innerWidth())
                // set tooltip css - size & position
                angular
                  .element('#tooltip-container_' + tablename)
                  .css({
                    opacity : '1',
                    height : 'auto',
                    top : topPos,
                    left : leftPos,
                  });
              });

              // activation hide tooltip
              $('.jq_meta_selector').mouseout(function(e) {
                angular
                  .element('#tooltip-container_' + tablename)
                  .css({
                    opacity : '0',
                    height : '0px',
                  });
              });

              $rootScope.$on('successEdit', cellUpdate);
            },

            beforeSelectRow : function(rowId, e) {
              return !isDeleteActive;
            },

            onSelectRow: onSelectRow,
            ondblClickRow: editCell,
            onCellSelect: onCellSelect,
            afterSaveCell: afterSaveCell,
            afterRestoreCell: afterRestoreCell,
            beforeSaveCell: beforeSaveCell,
            beforeEditCell: beforeEditCell,
          });

          // Add tooltips
          angular.element('.navtable .ui-pg-button').tooltip({
            container: 'body'
          });

          // remove icons and add new ones
          angular.element('.ui-jqgrid').removeClass('ui-widget ui-widget-content');
          angular.element('.ui-jqgrid-view').children().removeClass('ui-widget-header ui-state-default');
          angular.element('.ui-jqgrid-pager').removeClass('ui-state-default');
          angular.element('.ui-jqgrid').removeClass('ui-widget-content');
          angular.element('.ui-jqgrid-htable').addClass('table table-bordered table-hover');
          angular.element('.ui-icon.ui-icon-seek-prev').wrap('');
          angular.element('.ui-icon.ui-icon-seek-prev').removeClass().addClass('fa fa-backward');
          angular.element('.ui-icon.ui-icon-seek-first').wrap('');
          angular.element('.ui-icon.ui-icon-seek-first').removeClass().addClass('fa fa-fast-backward');
          angular.element('.ui-icon.ui-icon-seek-next').wrap('');
          angular.element('.ui-icon.ui-icon-seek-next').removeClass().addClass('fa fa-forward');
          angular.element('.ui-icon.ui-icon-seek-end').wrap('');
          angular.element('.ui-icon.ui-icon-seek-end').removeClass().addClass('fa fa-fast-forward');
        }, 1);
      }

      scope.hideMetainfoColumn = function () {
        scope.metainfoColumnHidden = !scope.metainfoColumnHidden;
        // show / hide metainfo column
        var displayProp = scope.metainfoColumnHidden ? 'none' : 'table-cell';
        $('[aria-describedby="jqGrid_' + tablename + '_"]').css({ 'display' : displayProp });
        $('th[id="jqGrid_' + tablename + '_"]').css({ 'display' : displayProp });
      }

      function cellUpdate (ev, val) {
        var cellToSave = _.cloneDeep(lastEditedCell);
        $timeout(function () {
          var grid = angular.element('#jqGrid_' + tablename);
          var rowData = grid.jqGrid('getRowData', cellToSave.rowId);
          rowData[_options.colModel[cellToSave.iCol-1].id] = val;
          var updateData = {
            oper: 'edit',
            id: rowData.jqgrid_id
          }
          updateData[_options.colModel[cellToSave.iCol-1].id] = val;
          return GridService
            .postData(_options.editCellUrl, updateData)
            .then(function () {
              grid.jqGrid('setCell', cellToSave.rowId, _options.colModel[cellToSave.iCol-1].id, val);
            });
        }, 1)
      }

      function beforeEditCell (rowid, cellname, value, iRow, iCol) {
        isCellEditActive = true;
        var isCellEdit = angular.element('#jqGrid_' + tablename).jqGrid('getGridParam', 'cellEdit');
        if (isCellEdit) {
          return true;
        } else {
          editCell(rowid, iRow, iCol)
        }
      }

      function beforeSaveCell (rowid, cellname, value, iRow, iCol) {
        if (!value.length) value = null;
        // turn of afterCellAction if beforeSaveCell go after beforeEditCell
        isCellEditActive = false;
        // not allow to save custom values for custom edittype if custom_values is false
        var col = _options.colModel[iCol-1];
        if (col.edittype === 'custom' && !col.custom_values) {
          return lastEditedCell.val;
        }
      }

      function afterSaveCell () {
        if (!isCellEditActive) {
          afterCellAction();
          triggerAction();
        }
        isCellEditActive = false;
      }

      function afterRestoreCell () {
        isCellEditActive = false;
        afterCellAction();
      }

      function afterCellAction() {
        var grid = angular.element('#jqGrid_' + tablename);
        grid.jqGrid('setGridParam', {
          cellEdit: false
        });
        angular.element(".edit-cell").removeClass("edit-cell ui-state-highlight");
        grid.jqGrid('resetSelection');
        scope.editFunctions.isEdited = false;
        lastEditedCell = {
          rowId: null,
          iRow: null,
          iCol: null
        }
      }

      function editCell (rowId, iRow,iCol) {
        if (iRow && iCol && _options.colModel[iCol-1].editable) {
          var grid = angular.element('#jqGrid_' + tablename);
          var cellName = _options.colModel[iCol-1].id;
          grid.jqGrid('resetSelection');
          if (lastEditedCell.iRow &&
            lastEditedCell.iCol) {
            grid.jqGrid('restoreCell', lastEditedCell.iRow, lastEditedCell.iCol);
          }
          grid.jqGrid('setGridParam', {
            cellEdit: true
          })
          var rowData = grid.jqGrid('getRowData', rowId);
          if (!angular.element(".edit-cell")[0]) {
            grid.jqGrid('editCell', iRow, iCol, {
              keys: true
            });
          }
          angular.element(".edit-cell").trigger("click");
          $timeout(function () {
            angular.element("input#" + cellName).focus();
          })
          lastEditedCell = {
            rowId: rowId,
            iRow: iRow,
            iCol: iCol,
            val: rowData[cellName]
          }
          setOutsideClickAction()
        }
      }

      function setOutsideClickAction() {
        var cell = angular.element(".edit-cell");
        if (cell &&
          cell[0]) {
          $document.on('click', function (event) {
            if (cell !== event.target &&
              !cell[0].contains(event.target) &&
              lastEditedCell.iRow &&
              lastEditedCell.iCol) {
              angular.element('#jqGrid_' + tablename)
                .jqGrid('restoreCell', lastEditedCell.iRow, lastEditedCell.iCol);
            }
          });
        }
      }

      function onSelectRow(id) {
        $timeout(function () {
          var selRowIds = angular.element('#jqGrid_' + tablename).jqGrid("getGridParam", "selarrrow");
          scope.editedRow = angular.element('#jqGrid_' + tablename).jqGrid("getGridParam", "selrow");
          // Show/hide icons after selecting rows
          scope.editFunctions.isEdited = !scope.isOpenedWidget && selRowIds.length === 1 ? true : false;
          scope.editFunctions.isDeleted = !scope.isOpenedWidget && selRowIds.length ? true : false;
          // if widget is opened
          if (!_.isEmpty(scope.widgetOptions) && scope.widgetOptions.isOpened) {
            // Closing widget if no rows are selected
            if (scope.widgetOptions.tabName == 'edit' && !scope.editedRow) {
              closeWidget();
              resetSelection();
            }
            // Updating models for edit form
            if (scope.editedRow) {
              if (scope.widgetOptions.rowsData.length > 0 && !multiSelectForDelete) {
                angular.element('#jqGrid_' + tablename).jqGrid('resetSelection');
                angular.element('#jqGrid_' + tablename).jqGrid('setSelection', id);
                scope.widgetOptions.rowsData = scope.widgetOptions.rowsData[scope.widgetOptions.rowsData.length - 1];
              } else {
                var selRowIds = angular.element('#jqGrid_' + tablename).jqGrid('getGridParam', 'selarrrow');
                var rowsData = [];
                angular.forEach(selRowIds, function (id) {
                  var rowData = angular.element('#jqGrid_' + tablename).jqGrid('getRowData', id);
                  rowsData.push(rowData);
                });
                scope.widgetOptions.rowsData = rowsData;
              }
              if (!multiSelectForDelete) enableMultiselect(false);
              scope.widgetOptions.colData = angular.element('#jqGrid_' + tablename).getRowData(scope.editedRow);
            }
          } else {
            enableMultiselect(true);
          }
          if (scope.isFullSize) {
            setMainMenuPosition();
          }
        }, 1);
      }

      function onCellSelect(rowid, iRow, iCol, event) {
        if (event.originalEvent, lastEditedCell.iRow, lastEditedCell.iCol) {
          var grid = angular.element('#jqGrid_' + tablename);
          grid.jqGrid('restoreCell', lastEditedCell.iRow, lastEditedCell.iCol);
          grid.jqGrid('setGridParam', {
            cellEdit: false
          });
          angular.element(".edit-cell").removeClass("edit-cell ui-state-highlight");
          grid.jqGrid('resetSelection');
          return onSelectRow(rowid);
        }
      }

      // Change multiselect parameter value
      function enableMultiselect(isEnable) {
        angular.element('#jqGrid_' + tablename).jqGrid('setGridParam', {
          multiselect: isEnable
        });
      }

      function resetSelection() {
        angular.element('#jqGrid_' + tablename).jqGrid('resetSelection');
        scope.editFunctions.isEdited = false;
        scope.editFunctions.isDeleted = false;
      }

      scope.openWidgetMenu = function($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      scope.openWidget = function (type) {
        _options.activeWidgetTab = type;
        if (!scope.isOpenedWidget) {
          // Close inline edit mode
          if (angular.element(angular.element('#jqGrid_' + tablename).jqGrid('getInd', lastEditedRowId, true)).attr("editable") === "1") {
            angular.element('#jqGrid_' + tablename).jqGrid('restoreRow', lastEditedRowId);
          }
          scope.isOpenedWidget = true;
          // open widget after filtering rows
          var _isFiltered = scope.widgetOptions && scope.widgetOptions.isFiltered;
          // Populate data for selected rows
          var selRowIds = angular.element('#jqGrid_' + tablename).jqGrid('getGridParam', 'selarrrow');
          var rowsData = [];
          angular.forEach(selRowIds, function (id) {
            var rowData = angular.element('#jqGrid_' + tablename).jqGrid('getRowData', id);
            rowsData.push(rowData);
          });
          scope.widgetOptions.tabName = type;
          scope.widgetOptions.isFiltered = _isFiltered;
          scope.widgetOptions.filter = _isFiltered ? scope.widgetOptions.filter : null;
          scope.widgetOptions.filterModel = _isFiltered ? scope.widgetOptions.filterModel : angular.copy(_options.colModel);
          scope.widgetOptions.filteredIds = _isFiltered ? scope.widgetOptions.filteredIds : [];
          scope.widgetOptions.rowsData = rowsData;
          scope.widgetOptions.colData = rowsData[0] || [];
          scope.widgetOptions.isOpened = true;
          // Appending widget model into user's element
          var obj = '<jq-widget ';
          if (scope.isFullSize) {
            obj += 'style="top: 0;" '
          }
          obj += 'id="widget" layout="column" ng-model=\"widgetOptions\"></jq-widget>';
          var widget = $compile(obj)(scope);
          angular.element(document.querySelector(_options.mainElem)).append(widget);
          angular.element(angular.element(document.querySelector(_options.mainElem)).children()[0]).css('width', 'calc(100% - 320px)');
          if (scope.isFullSize && scope.subTabName === 'table') {
            setMainMenuPosition();
          }
          if (type === 'delete') {
            multiSelectForDelete = true;
            enableMultiselect(true);
          }
        }
      };

      function closeWidget(tableInfo, action) {
        _options.activeWidgetTab = '';
        isDeleteActive = false;
        scope.editFunctions.isEdited = false;
        scope.editFunctions.isDeleted = false;
        scope.isOpenedWidget = false;
        if (scope.widgetOptions) scope.widgetOptions.isOpened = false;
        if (tableInfo) {
          scope.jqGridTableNames.updated_by = tableInfo.updatedBy;
          scope.jqGridTableNames.updated_at = tableInfo.updatedAt;
        }
        if (action) _options.tabAction = action;
        enableMultiselect(true);
        if (scope.isFullSize && scope.subTabName === 'table') {
          setMainMenuPosition();
        }
        angular.element(document.querySelector(_options.mainElem)).find('jq-widget').remove();
        angular.element(angular.element(document.querySelector(_options.mainElem)).children()[0]).css('width', '100%');
      }

      // Update jqgrid table with new data
      function refreshWidget(newUrl) {
        if (newUrl) {
          angular.element('#jqGrid_' + tablename).jqGrid().setGridParam({
            url: newUrl
          });
        }
        angular.element('#jqGrid_' + tablename).trigger('reloadGrid');
      }

      function deleteRow(ids) {
        scope.progressBar.start();
        return GridService.postData(_options.deleteGridUrl, {
            oper: 'del',
            id: ids.join(',')
          })
          .then(function () {
            if (scope.widgetOptions.filteredIds.length) {
              if (ids.length === scope.widgetOptions.filteredIds.length) {
                _options.tabAction = 'reset_filter';
                angular.element('#jqGrid_' + tablename).jqGrid().setGridParam({
                  url: _options.getGridUrl
                });
              } else {
                _.remove(scope.widgetOptions.filteredIds, function (obj) {
                  return ids.indexOf(obj) > -1;
                });
              }
            }
            angular.element('#jqGrid_' + tablename).trigger('reloadGrid');
            scope.isDeleted = false;
            scope.progressBar.complete();
            DataService.success(tMessages.getTable().deleteSuccess(ids));
            $rootScope.$emit('handleBroadcast', 'input');
            triggerAction(tablename);
          }, function (err) {
            scope.progressBar.reset();
            scope.jqErrorFn({
              responseText: err
            });
          });
      }

      // Running action if appropriate trigger is configured
      function triggerAction() {
        if (!_options.triggers) return;

        _options.triggers.forEach(function (trigger) {
          if (trigger.isEnabled &&
              trigger.type === 'tableEdit' &&
              trigger.action.segment === _options.type) {
            $rootScope.$emit('runAction', trigger.actionId, trigger._id);
          }
        });
      }

      var deleteEmit = $rootScope.$on('deleteRow', function (ev, ids, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) {
          deleteRow(ids)
            .then(function () {
              return closeWidget();
            });
        }
      });

      var unselectEmit = $rootScope.$on('unselectRows', function (ev, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) {
          resetSelection();
          angular.element('#jqGrid_' + tablename).trigger('reloadGrid');
        }
      });

      var closeEmit = $rootScope.$on('closeWidget', function (ev, tableInfo, action, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) {
          closeWidget(tableInfo, action);
          resetSelection();
        }
      });

      var refreshEmit = $rootScope.$on('refreshWidget', function (ev, data, tableName) {
        if (!_.isUndefined(tableName) &&
            scope.jqGridTableNames.tablename === tableName) {
          if (data && data.action) _options.tabAction = data.action;
          refreshWidget(data && data.url ? data.url : '');
        }
      });

      var showFullSize = $rootScope.$on('showFullSize', function (ev, data) {
        var rowsValue = rowsNumber + 4;
        scope.isFullSize = $rootScope.isFullSize;
        if (scope.isOpenedWidget) {
          angular.element(angular.element.find('.widget')).css('top', '0');
        }
        angular.element(angular.element.find('.ui-pg-selbox option')).remove();
        angular.element(angular.element.find('.ui-pg-selbox'))
          .append(
            '<option value="' + rowsValue + '" selected="selected">' + rowsValue + '</option>' +
            '<option value="' + rowsValue * 2 + '">' + rowsValue * 2 + '</option>' +
            '<option value="' + rowsValue * 3 + '">' + rowsValue * 3 + '</option>'
          );
        // Increase number of jqgrid rows
        angular.element('#jqGrid_' + tablename)
          .setGridParam({
            'rowNum': rowsValue
          })
          .trigger('reloadGrid');
      });

      var hideFullSize = $rootScope.$on('hideFullSize', function (ev, data) {
        scope.isFullSize = $rootScope.isFullSize;
        if (scope.widgetOptions) {
          closeWidget();
          angular.element(angular.element.find('.extra_tab > .nav-tabs'))
            .css('right', '');
          angular.element(angular.element.find('.ui-pg-selbox option')).remove();
          angular.element(angular.element.find('.ui-pg-selbox'))
            .append(
              '<option value="' + rowsNumber + '" selected="selected">' + rowsNumber + '</option>' +
              '<option value="' + rowsNumber * 2 + '">' + rowsNumber * 2 + '</option>' +
              '<option value="' + rowsNumber * 3 + '">' + rowsNumber * 3 + '</option>'
            );
          // Return number of jqgrid rows to default
          angular.element('#jqGrid_' + tablename)
            .setGridParam({
              'rowNum': rowsNumber
            })
            .trigger('reloadGrid');
        }
      });

      var enableMultiselectEv = $rootScope.$on('enableMultiselect', function (ev, data, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) {
          multiSelectForDelete = data;
          isDeleteActive = false;
          enableMultiselect(data);
        }
      });

      var resetRows = $rootScope.$on('resetRows', function (ev, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) {
          isDeleteActive = true;
          angular.element('#jqGrid_' + tablename).jqGrid('resetSelection');
          scope.widgetOptions.rowsData = [];
        }
      });

      var activateSelecting = $rootScope.$on('activateSelecting', function (ev, tableName) {
        if (scope.jqGridTableNames.tablename === tableName) isDeleteActive = false;
      });

      // stop participating in model change detection and listener notification by invoking
      scope.$on('$destroy', function () {
        angular.element(element).empty();
        deleteEmit();
        unselectEmit();
        closeEmit();
        refreshEmit();
        showFullSize();
        hideFullSize();
        enableMultiselectEv();
        resetRows();
        activateSelecting();
      });

      function setMainMenuPosition() {
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('right', '120px');
      }

      // Watching clicking on tab menu
      scope.$watch('subTabName', function (value) {
        scope.isFullSize = $rootScope.isFullSize;
        if (value === 'table' && scope.isFullSize) {
          setMainMenuPosition();
        }
        if (scope.isOpenedWidget) {
          closeWidget();
        }
      });

      scope.openIndividualRecord = function (rowId) {
        scope.rowInfo = {};
        var listIds = $('#jqGrid_' + tablename).getDataIDs(),
          rowNum = angular.element('#jqGrid_' + tablename).jqGrid('getGridParam', 'rowNum');
        if (!rowId) {
          rowId = listIds[0];
          scope.rowInfo.currentPage = (scope.jqGridTableNames.page - 1) * rowNum + 1;
        } else {
          scope.rowInfo.currentPage = (scope.jqGridTableNames.page - 1) * rowNum + _.indexOf(listIds, rowId) + 1;
        }
        scope.rowData = $('#jqGrid_' + tablename).jqGrid('getRowData', rowId);
        scope.dataModelKey = GridProvider.generateNewModel(angular.copy(_options.colModel), scope.rowData);
        scope.rowViewData = {
          topBarColumns: _.filter(scope.dataModelKey, {columnPosition: scope.position.top}),
          middleBarColumns: _.filter(scope.dataModelKey, {columnPosition: scope.position.middle}),
          rightBarColumns: _.filter(scope.dataModelKey, {columnPosition: scope.position.right})
        };
        if (_options.activeWidgetTab === 'add' || _options.activeWidgetTab === 'edit') {
          closeWidget();
        }
      };

      //add custom html for info column cells
      function formatMetaInfo (cellValue, options, rowObject) {
        var metaInfoIconHtml = '<i class="material-icons metainfo_icon">info</i>';
        return metaInfoIconHtml;
      }

      //add tooltip for info column cells
      function metaInfoCellAttr (cellValue, options, rowObject) {
        var metaInfoCellTooltipHtml =
        ' class="jq_meta_selector" op_created_by="' + rowObject.op_created_by +
        '" op_created_at="' + moment(rowObject.op_created_at).format("h:mm DD MMMM YYYY") +
        '" op_updated_by="' + rowObject.op_updated_by +
        '" op_updated_at="' + moment(rowObject.op_updated_at).format("h:mm DD MMMM YYYY") + '"';
        return metaInfoCellTooltipHtml;
      }
    }
  }

})();
