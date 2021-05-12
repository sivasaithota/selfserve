(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('jqGridMain')
    .directive('jqGridTable', jqGridTable);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqGridTable.$inject = ['$timeout', '$rootScope', '$compile', 'FileSaver', 'ngProgressFactory', 'GridProvider',
    'GridService', 'tMessages', 'TableService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqGridTable ($timeout, $rootScope, $compile, FileSaver, ngProgressFactory, GridProvider, GridService,
                        tMessages, TableService) {
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
        jqGridTableNames: '=',
        jqGridConfig: '=',
        jqCallbackFn: '&jqCallbackFn',
        jqErrorFn: '&jqErrorFn'
      },
      replase: true,
      // templateUrl specifies the HTML markup that will be produced
      // when the directive is compiled and linked by Angular
      templateUrl: 'jqGridSimple/index.ejs'
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
        // and their corresponding attribute values

      var uniqueKey,
        tablename,
        editableColums,
        visibleColums,
        jqGridTableCols,
        displayList;
      var _options;

      scope.progressBar = $rootScope.progressBar;

      angular.element(element).css({
        overflow: 'auto'
      });

      $.jgrid.defaults.styleUI = 'Bootstrap';
      $.extend($.jgrid.defaults, {
        ajaxRowOptions: {
          beforeSend: function (jqXHR, settings) {
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
          }
        }
      });
      $.extend($.jgrid.del,{
        ajaxDelOptions: {
          beforeSend: function (jqXHR, settings) {
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
          }
        }
      });

      // jqgrid_id is a custom key column using for add, edit, delete rows
      scope.$watch('jqGridTableNames', function(value) {
        if (!angular.isUndefined(value)) {
          _options = angular.copy(GridProvider.getDefaults(JSON.parse(scope.jqGridConfig)));
          jqGridTableCols = _.map(scope.jqGridTableNames.columnlist.split(","), _.trim);
          uniqueKey = !_.isNull(scope.jqGridTableNames.unique_key) ? scope.jqGridTableNames.unique_key.split(",") : jqGridTableCols;
          editableColums = !_.isNull(scope.jqGridTableNames.editablecolumns) ? scope.jqGridTableNames.editablecolumns.split(",") : [];
          visibleColums = !_.isNull(scope.jqGridTableNames.visiblecolumns) && scope.jqGridTableNames.visiblecolumns.length > 0 ? scope.jqGridTableNames.visiblecolumns.split(",") : [];
          tablename = scope.jqGridTableNames.tablename.replace(/\s+/g, '_');
          _options.tablenameServer = scope.jqGridTableNames.tablename;
          angular.forEach(visibleColums, function(val) {
            _options.displayList.push(scope.jqGridTableNames.displaylist[val]);
          });
          if (!_.isNull(scope.jqGridTableNames.columnlistwithtypes)) {
            var columnListWithTypes = scope.jqGridTableNames.columnlistwithtypes.split(',');
            angular.forEach(columnListWithTypes, function(n) {
              n.replace(/^[\ ]{2,}/,' ');
              n = n.split('" ');
              var columnObject = {};
              columnObject[n[0].replace('"', '')] = n[1];
              _options.columnTypes.push({
                value: n[0].replace('"', ''),
                key: n[1]
              });
            });
          } else {
            _options.columnTypes = _.range(jqGridTableCols.length).map(function () { return 'text'; });
          }

          initModel();
        }
      });

      function initModel() {
        $timeout(function() {
          _options.colModel = [];
          GridService.getEditOptions(_options.getEditTableUrl)
            .then(function(result) {
              _options.colModel.push({
                key: true,
                name: 'jqgrid_id',
                editable: false,
                hidden: true
              });
              angular.forEach(visibleColums, function (value, key) {
                var colum = {
                  name: value,
                  id: value,
                  editable: true
                };
                var editOption = _.find(result, {column_name: value});
                if (!editOption) {
                  if (value == uniqueKey[0]) {
                    colum.editrules = {
                      custom: true,
                      custom_func: function (value, colname) {
                        if (value.match(/,/gmi)) {
                          return [false, "You can't type commas here"];
                        } else {
                          return [true];
                        }
                      }
                    };
                  }
                  // add type of the columns
                  var typeWithValue = _.find(_options.columnTypes, {value: value});
                  switch(typeWithValue ? typeWithValue.key : 'text') {
                    case 'boolean':
                      colum.edittype = 'checkbox';
                      colum.editoptions = {value: "true:false"};
                      break;
                    case 'double precision':
                      colum.sorttype = 'integer';
                      colum.formatter = 'number';
                      colum.formatoptions = {
                        decimalPlaces: 2
                      };
                      colum.cellattr = function (cellvalue) {
                        return 'class="center-text"';
                      };
                      break;
                    case 'integer':
                      colum.sorttype = 'integer';
                      colum.formatter = 'number';
                      colum.formatoptions = {
                        decimalPlaces: 0
                      };
                      break;
                    case 'bigint':
                      colum.sorttype = 'integer';
                      colum.formatter = 'number';
                      colum.formatoptions = {
                        decimalPlaces: 0
                      };
                      break;
                    case 'date':
                      colum.sorttype = _options.columnTypes[key];
                      colum.formatter = _options.columnTypes[key];
                      colum.formatoptions = {
                        srcformat: 'ISO8601Long',
                        newformat: 'm/d/Y'
                      };
                      colum.searchoptions = { sopt: ['eq','lt','le','gt','ge'] };
                      if (editableColums.indexOf(colum.name) >= 0) {
                        colum.editoptions = {
                          dataInit: function(element) {
                            angular.element(element).datetimepicker({
                              format: 'MM/DD/YYYY',
                              widgetPositioning: {
                                vertical: 'bottom'
                              }
                            });
                          }
                        };
                      }
                      break;
                    case 'time':
                      colum.sorttype = 'date';
                      colum.formatter = 'date';
                      colum.formatoptions = {
                        srcformat: 'H:i:s',
                        newformat: 'H:i:s'
                      };
                      colum.searchoptions = { sopt: ['eq','lt','le','gt','ge'] };
                      if (editableColums.indexOf(colum.name) >= 0) {
                        colum.editoptions = {
                          dataInit: function(element) {
                            angular.element(element).datetimepicker({
                              format: 'HH:mm:ss',
                              widgetPositioning: {
                                vertical: 'bottom'
                              }
                            });
                          }
                        };
                      }
                      break;
                    case 'timestamp':
                      colum.sorttype = 'date';
                      colum.formatter = 'date';
                      colum.formatoptions = {
                        srcformat: 'Y/m/d H:i:s',
                        newformat: 'm/d/Y H:i:s'
                      };
                      colum.searchoptions = { sopt: ['eq','lt','le','gt','ge'] };
                      if (editableColums.indexOf(colum.name) >= 0) {
                        colum.editoptions = {
                          dataInit: function(element) {
                            angular.element(element).datetimepicker({
                              format: 'MM/DD/YYYY HH:mm:ss',
                              widgetPositioning: {
                                vertical: 'bottom'
                              }
                            });
                          }
                        };
                      }
                      break;
                    default:
                      colum.sorttype = _options.columnTypes[key];
                  }
                } else {
                  colum.edittype = 'custom';
                  colum.editrules = {
                    required: true,
                    custom: true,
                    custom_func: function (value, colname) {
                      if (!editOption.custom_values) {
                        return editOption.includes(value) ? [true] : [false, tMessages.getTable().requiredItem(colname)];
                      } else {
                        return [true];
                      }
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
                      elemStr += 'filter-list-method="filterItems(userInput, dropdownItems)" '
                      elemStr += '></input-dropdown>';
                      elemStr += '<i class="material-icons search" role="button" tabindex="0">arrow_drop_down</i>';
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
                }
                _options.colModel.push(colum);
              });
              angular.element("#jqGrid_" + tablename).GridUnload("#jqGrid_" + tablename);
              initTable();
            }, function(err) {
              scope.jqErrorFn(err);
            });
        }, 1);
      }

      function initTable () {
        $timeout(function () {
          angular.element("#jqGrid_" + tablename).jqGrid({
            url: _options.getGridUrl,
            mtype: 'GET',
            loadBeforeSend: function (jqXHR) {
              jqXHR.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
            },
            datatype: "json",
            colNames : ['jqgrid_id'].concat(_options.displayList),
            colModel: _options.colModel,
            rowNum : _options.rowsNumber,
            rowList : [_options.rowsNumber, _options.rowsNumber*2, _options.rowsNumber*3],
            pager : '#pager_jqgrid_' + tablename,
            toolbarfilter: true,
            viewrecords : true,
            recordpos: 'left',
            caption : "jqGrid with inline editing",
            multiselect : true,
            multiSort: true,
            loadError: function (resp) {
              DataService.error(resp.responseText);
              element.hide();
              $('#outcollapse_'+scope.jqGridTableNames.id).css({
                'display': 'none'
              });
            },
            gridComplete: function () {
              var gridName = this.id;
              angular.element(element).parent().append('<div id="widthTest_' + tablename +'" style="display:inline-block;overflow: visible;"></div>');
              $('#' + gridName).css('cssText', 'width: inherit !important');
              $('#' + gridName).parent().css('cssText', 'width: inherit !important');
              var columnNames = $("#" + gridName).jqGrid('getGridParam', 'colModel');
              for (var itm = 0, itmCount = columnNames.length; itm < itmCount; itm++) {
                var curObj = $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]');
                var thisCell = $('[id*="' + gridName + '_' + columnNames[itm].name + '"]').find('div');
                $('#widthTest_' + tablename).html(columnNames[itm].name).css({
                  'font-family': thisCell.css('font-family'),
                  'font-size': thisCell.css('font-size'),
                  'font-weight': thisCell.css('font-weight')
                });
                var maxWidth = 150;
                for (var itm2 = 0, itm2Count = curObj.length; itm2 < itm2Count; itm2++) {
                  var smallCell = $(curObj[itm2]);
                  $('#widthTest_' + tablename).html(smallCell.html()).css({
                    'font-family': smallCell.css('font-family'),
                    'font-size': smallCell.css('font-size'),
                    'font-weight': smallCell.css('font-weight')
                  });
                  var thisWidth = $('#widthTest_' + tablename).width() + 15;
                  if (thisWidth > maxWidth) maxWidth = thisWidth;
                }
                $('#' + gridName + ' .jqgfirstrow td:eq(' + itm + ')').css('width', maxWidth);
                $('#' + gridName + ' .jqgfirstrow td:eq(' + itm + ')').css('min-width', maxWidth);
                $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]').css('width', itm !== 2 ? maxWidth : maxWidth);
                $('[aria-describedby="' + gridName + '_' + columnNames[itm].name + '"]').css('min-width', itm !== 2 ? maxWidth : maxWidth);
                $('th[id="' + gridName + '_' + columnNames[itm].name + '"]').css('width', maxWidth);
                $('th[id="' + gridName + '_' + columnNames[itm].name + '"]').css('min-width', maxWidth);
              }
              $('#widthTest_' + tablename).remove();
              var headerHeight = element.find('.ui-jqgrid-htable').actual('height');
              if (headerHeight > _options.defaultHeight) {
                $('div[id^="jqgh_"]').css('height', headerHeight);
              }
            }
          });

          angular.element("#jqGrid_" + tablename).navGrid('#pager_jqgrid_' + tablename, {
            edit: false,
            add: false,
            del: _options.tabFunctions.delete,
            delicon: "fa fa-trash-o",
            search: true,
            searchicon: "table_icon",
            refresh: true,
            refreshicon: "fa fa-refresh",
            view: false,
            position: "right",
            cloneToTop: false,
          }, {}, {}, {
            url: _options.deleteGridUrl,
            afterSubmit: function (response, postdata) {
              $rootScope.$emit('handleBroadcast', 'input');
            },
            errorTextFormat: function (resp) {
              scope.jqErrorFn(resp);
            },
            closeOnEscape: true,
            reloadAfterSubmit: true,
            closeAfterDel: true,
            recreateForm: true,
            left: 450,
            top: 300,
            width: 520
          }, {
            closeOnEscape: true,
            multipleSearch: true,
            closeAfterSearch: true,
            afterRedraw: function (p) {
              var $form = $(this), formId = this.id, // fbox_list
                bindKeydown = function () {
                  $form.find("td.data>.input-elm").keydown(function (e) {
                    if (e.which === 13) {
                      $(e.target).change();
                      $("#" + $.jgrid.jqID(formId) + "_search").click();
                    }
                  });
                },
                oldOnChange = p.onChange,
                myOnChange = function (param) {
                  var $input = $form.find("td.data>.input-elm"), events;
                  oldOnChange.call(this, param);
                  if ($input.length > 0) {
                    events = $._data($input[0], "events");
                    for (var q=0; q < $input.length; q++) {
                      if ($._data($input[q], "events") && !$._data($input[q], "events").keydown) {
                        bindKeydown();
                      }
                    }
                  }
                };
              p.onChange = myOnChange;
              bindKeydown.call(this);
            }
          });

          angular.element("#jqGrid_" + tablename).inlineNav('#pager_jqgrid_' + tablename, {
            edit: _options.tabFunctions.edit,
            editicon: "fa fa-pencil",
            add: _options.tabFunctions.add,
            addicon: "fa fa-plus",
            del: false,
            save: _options.tabFunctions.add || _options.tabFunctions.edit,
            saveicon: "fa fa-save",
            cancel: _options.tabFunctions.add || _options.tabFunctions.edit,
            cancelicon: "fa fa-times",
            editParams: {
              mtype: "POST",
              url: _options.editGridUrl,
              keys: true,
              restoreAfterError: false,
              successfunc: function () {
                $rootScope.$emit('handleBroadcast', 'input');
                initModel();
                scope.jqCallbackFn({event: _options.ev, inputData: scope.jqGridTableNames});
              },
              errorfunc: function(rowId, resp) {
                if (resp.status !== 200) {
                  scope.jqErrorFn(resp);
                }
                var $self = $(this);
                $timeout(function () {
                  $self.trigger("reloadGrid");
                }, 100);
              }
            },
            addParams: {
              addRowParams: {
                mtype: "POST",
                url: _options.addGridUrl,
                keys: true,
                restoreAfterError: false,
                successfunc: function () {
                  var $self = $(this);
                  scope.jqCallbackFn({event: _options.ev, inputData: scope.jqGridTableNames, id: _options.pid});
                  $rootScope.$emit('handleBroadcast', 'input');
                  $timeout(function () {
                    $self.trigger("reloadGrid");
                  }, 100);
                },
                errorfunc: function(row, resp) {
                  if (resp.status !== 200) {
                    scope.jqErrorFn(resp);
                  }
                  var $self = $(this);
                  $timeout(function () {
                    $self.trigger("reloadGrid");
                  }, 100);
                }
              }
            },
            restoreAfterSelect: false
          });

          // Custom button for the control block
          angular.element("#jqGrid_" + tablename).jqGrid('navButtonAdd', '#pager_jqgrid_' + tablename, {
            id: "export_" + tablename,
            caption: "",
            position: "last",
            title: "Export Selected Rows To CSV",
            onClickButton : function(event) {
              exportData(event, "#jqGrid_" + tablename);
            },
            buttonicon: "fa fa-download",
          });

          angular.element("#jqGrid_" + tablename).jqGrid('navButtonAdd', '#pager_jqgrid_' + tablename, {
            id: "export_All" + tablename,
            caption: "",
            position: "last",
            title: "Export All Rows To CSV",
            onClickButton : function(event) {
              scope.progressBar.start();
              GridService.jqDownloadRows(_options.downloadRowsUrl + scope.jqGridTableNames.type)
                .then(function(data) {
                  scope.progressBar.complete();
                  TableService.downloadFile(data, _options.scenarioName + '-' + tablename + '-full.zip');
                }, function(err) {
                  scope.progressBar.reset();
                  scope.jqErrorFn(err);
                });
            },
            buttonicon: "fa fa-cloud-download",
          });

          // Add tooltips
          angular.element('.navtable .ui-pg-button').tooltip({
            container : 'body'
          });

          // On Resize
          // angular.element(window).resize(function(ev) {
          //   if(window.afterResize) {
          //     clearTimeout(window.afterResize);
          //   }
          //   window.afterResize = setTimeout(function() {
          //     angular.element("#jqGrid_" + tablename ).jqGrid('setGridWidth', 500);
          //   }, 500);
          // });

          // remove icons and add new ones
          angular.element(".ui-jqgrid").removeClass("ui-widget ui-widget-content");
          angular.element(".ui-jqgrid-view").children().removeClass("ui-widget-header ui-state-default");
          angular.element(".ui-jqgrid-labels, .ui-search-toolbar").children().removeClass("ui-state-default ui-th-column ui-th-ltr");
          angular.element(".ui-jqgrid-pager").removeClass("ui-state-default");
          angular.element(".ui-jqgrid").removeClass("ui-widget-content");
          angular.element(".ui-jqgrid-htable").addClass("table table-bordered table-hover");
          angular.element( ".ui-icon.ui-icon-seek-prev" ).wrap( "" );
          angular.element(".ui-icon.ui-icon-seek-prev").removeClass().addClass("fa fa-backward");
          angular.element( ".ui-icon.ui-icon-seek-first" ).wrap( "" );
          angular.element(".ui-icon.ui-icon-seek-first").removeClass().addClass("fa fa-fast-backward");
          angular.element( ".ui-icon.ui-icon-seek-next" ).wrap( "" );
          angular.element(".ui-icon.ui-icon-seek-next").removeClass().addClass("fa fa-forward");
          angular.element( ".ui-icon.ui-icon-seek-end" ).wrap( "" );
          angular.element(".ui-icon.ui-icon-seek-end").removeClass().addClass("fa fa-fast-forward");

          angular.element("#jqGrid_" + tablename + "_iledit").click(function (ev) {
           angular.forEach(_.difference(jqGridTableCols, editableColums), function (value) {
             $timeout(function (argument) {
              angular.element("input[name='" + value + "']").attr("disabled", "disabled");
             }, 1);
           });
          });
        }, 1);
      }

      // convert data from choosen rows to the json
      function exportData (event, id) {
        var gridid = angular.element(id).getDataIDs();
        var label = angular.element(id).getRowData(gridid[0]);
        var selRowIds = angular.element(id).jqGrid ('getGridParam', 'selarrrow');
        var page_number = angular.element(id).getGridParam('page');
        var obj = {};
        obj.count = selRowIds.length;

        if (obj.count) {
          obj.items = [];
          _(selRowIds).forEach(function(value, key) {
            obj.items.push(angular.element(id).getRowData(value));
          }).value();
          var newItems = _.map(obj.items, function (value) {
            delete value.jqgrid_id;
            return value;
          });
          var newJson = {
            items: newItems,
            count: obj.count
          };
          JSONToCSVConvertor(JSON.stringify(newJson), page_number, true);
        }
      }

      function JSONToCSVConvertor (JSONData, ReportTitle, ShowLabel) {
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        if (ShowLabel) {
          var row_1 = "";
          for (var index_1 in arrData.items[0]) {
            row_1 += '"' + index_1 + '",';
          }
          row_1 = row_1.slice(0, -1);
          CSV += row_1 + '\r\n';
        }
        for (var i = 0; i < arrData.items.length; i++) {
          var row_2 = "";
          var iKey = 0;
          for (var index_2 in arrData.items[i]) {
            row_2 += '"' + arrData.items[i][index_2] + '"';
            if (Object.keys(arrData.items[i]).length !== (iKey + 1)) {
              row_2 += ',';
            }
            iKey++;
          }
          row_2.slice(0, row_2.length - 1);
          CSV += row_2 + '\r\n';
        }
        if (_.isEmpty(CSV)) {
          return;
        }
        var fileSingle = new Blob([CSV], {type: 'data:application/csv;charset=utf-8'});
        FileSaver.saveAs(fileSingle, tablename + '_' + ReportTitle + '.csv');
      }
    }
  }
})();
