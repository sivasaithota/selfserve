(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('tabCtrl', tabCtrl);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  tabCtrl.$inject = ['typeTab', '$scope', '$mdDialog', '$rootScope',
    '$templateCache', 'TableService', '$stateParams', 'DataService', 'ScenarioSetService',
    '$timeout', '$state', 'ExecutionProvider', '$sce', 'tMessages', '$filter',
    'uploadedTables', 'TableActService', '$q', 'ScenarioService', 'TableauService', 'PowerBiService', '$cookies'
  ];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function tabCtrl(typeTab, $scope, $mdDialog, $rootScope, $templateCache,
    TableService, $stateParams, DataService, ScenarioSetService, $timeout, $state,
    ExecutionProvider, $sce, tMessages, $filter, uploadedTables, TableActService,
    $q, ScenarioService, TableauService, PowerBiService, $cookies) {

    var appURL = DataService.getLocation();
    // represent the binding scope
    var vm = this,
      pid = vm.pid = $stateParams.projId,
      currentState = $state.current.name,
      scenarioTab = currentState.substring(currentState.lastIndexOf('.') + 1, currentState.length),
      htmlLink = './scenario/output/html/';
    vm.loadingTableCounts = true;
    vm.currentTab = {};
    vm.typeTab = typeTab;
    vm.dbuploadlist = DataService.convertTab(uploadedTables);
    vm.uploadedTables = uploadedTables;
    vm.tabsList = DataService.getTabs(vm.dbuploadlist.length);
    vm.reportTypes = {
      powerBI: 'powerbi',
      tableAU: 'tableau',
    };
    vm.progressBar = $rootScope.progressBar;
    vm.triggers = $scope.work.triggers;

    vm.actions = $scope.work.actions.filter(function (action) {
      return action.type !== 'primary' && action.segment === typeTab;
    });
    vm.actions = _.groupBy(vm.actions, 'type');

    // Output PDF sizes stored in local storage
    vm.outputPdfDetails = {
      isDefaultSize: true,
      width: parseInt(localStorage[appURL + '/outputPdfWidth']),
      height: parseInt(localStorage[appURL + '/outputPdfHeight'])
    };
    vm.dbuploadlist = DataService.convertTab(uploadedTables);
    vm.loadingTableCounts = false;

    // Fetching scenario settings
    var getSettings = ScenarioSetService.getSettings({
      keys: 'html,tableauExtract,inputViz,outputViz,inputVizType,outputVizType,tableauTrusted,tableauUsername,tableauFooter',
      scenarioID: $stateParams.projId,
      templateID: 0,
    }).then(function(data) {
      return data;
    });

    // Fetching bom data
    var getBom = ScenarioService.getBom().then(function(data) {
      return data;
    });

    // Fetching tableau reports
    var getTableauURL = TableauService.getCurrentTableau($stateParams.projId, typeTab)
      .then(function(data) {
        return data;
      });

    // Fetching powerBI reports
    var getPowerBI = PowerBiService.getReportByType($stateParams.projId, typeTab)
      .then(function (data) {
        return data;
      });

    // Fetching default tab value
    var getDefaultTab = ScenarioSetService.getTabView({
        templateID: $scope.work.projectDetails.scenario_template_id,
        type: scenarioTab,
      }).then(function (data) {
        return data;
      });

    // Fetching data from the server
    $q.all([getSettings, getBom, getTableauURL, getPowerBI, getDefaultTab]).then(function(result) {
      var tabNames = DataService.getTabName();
      var settingData = result[0];
      var bomData = result[1];
      vm[typeTab + 'VizType'] = settingData[typeTab + 'VizType'];
      // Besed on visualization type show tableau or powerbi reports
      vm.reportArr = settingData[typeTab + 'VizType'] === vm.reportTypes.tableAU ? result[2] : result[3];
      var defaultTab = result[4] && result[4][0] && result[4][0].value ? result[4][0].value : null;
      vm['current' + typeTab] = angular.copy(vm.reportArr.length > 0 ? vm.reportArr[0].id : '');

      vm['show' + typeTab] = settingData[typeTab + 'Viz'];

      // Update tableau tab visibility
      vm.tabsList[1].isVisible = vm['show' + vm.typeTab] && vm.reportArr.length > 0;

      if (typeTab === 'output') {
        // Increasing the HTML output element height for iOS devices because scrolling inside the embedded shinyR apps
        // works not correctly fur such devices
        if ((!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) ||
            (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)) {
          document.getElementById('html-output').style.height = '150%';
        }

        // HTML output processing
        // false - html output is disabled
        // true - default html output from file
        // string - html from url
        if (settingData.html) {
          // need to mark the url as trusted one
          if (settingData.html === true) {
            vm.outputHtml = htmlLink + vm.pid;
          } else {
            // need to mark the url as trusted one
            vm.outputHtml = $sce.trustAsResourceUrl(settingData.html);
          }
          // Update html tab visibility
          vm.tabsList[2].isVisible = true;
        }
      }

      // BOM processing
      vm[typeTab + 'Bom'] = _.filter(bomData.result, {tab: typeTab});
      vm[typeTab + 'CurrentBom'] = angular.copy(vm[typeTab + 'Bom'].length > 0 ? vm[typeTab + 'Bom'][0] : '');
      // Update bom tab visibility
      vm.tabsList[3].isVisible = bomData.hasBomFile && vm[typeTab + 'Bom'].length > 0;

      // Find active tab
      if (defaultTab === tabNames.table) {
        vm.activeTab = vm.tabsList[0].id;
      } else if (defaultTab === tabNames.tableau && vm.tabsList[1].isVisible) {
        vm.activeTab = vm.tabsList[1].id;
      } else if (defaultTab === tabNames.html && vm.tabsList[2].isVisible) {
        vm.activeTab = vm.tabsList[2].id;
      } else if (defaultTab === tabNames.bom && vm.tabsList[3].isVisible) {
        vm.activeTab = vm.tabsList[3].id;
      } else {
        vm.activeTab = vm.tabsList[0].id;
      }

      // set active tab to html report if tableau/powerbi reports are empty
      if(typeTab === 'output' && result[2].length === 0 && result[3].length === 0 && result[0].html){
        vm.activeTab = vm.tabsList[2].id;
      }

      // set tableauFooter
      $rootScope.tableauFooter = settingData.tableauFooter;
    });

    // allow user to work with rows in the jqgrid tables
    vm.tabFunctions = {
      add: $rootScope.currentUser.functions.Grid_Add,
      edit: $rootScope.currentUser.functions.Grid_Edit,
      delete: $rootScope.currentUser.functions.Grid_Delete
    };
    if (typeTab === 'input') {
      vm.showInfo = $scope.work.showInput;
      vm.showUpload = true;
    }
    if (typeTab === 'output') {
      vm.showInfo = $scope.work.showOutput;
      vm.showUpload = false;
    }

    // defining the functions

    vm.changeTable = changeTable;
    vm.getPDF = getPDF;
    vm.findLabel = findLabel;
    vm.showErrorMsg = showErrorMsg;
    vm.generateConfiguration = generateConfiguration;
    vm.bulkDownload = bulkDownload;
    vm.bulkUpload = bulkUpload;
    vm.checkTagVisibility = checkTagVisibility;
    vm.findBomSettings = findBomSettings;
    vm.openHtml = openHtml;
    vm.checkTabsVisibility = checkTabsVisibility;
    vm.passActiveReport = passActiveReport;

    function changeTable(pindex, index) {
      vm.showInfo = false;
      if (typeTab === 'input') $scope.work.showInput = false;
      if (typeTab === 'output') $scope.work.showOutput = false;
      angular.forEach(vm.dbuploadlist, function (value, pkey) {
        angular.forEach(value.tables, function (list, key) {
          if (list.active === true) {
            list.active = false;
          }
          if (pindex === pkey && index === key) {
            list.active = true;
          }
        });
        value.active = angular.isUndefined(_.find(value.tables, {
          active: true
        })) ? false : true;
      });
    }

    // Downloading output HTML as PDF
    function getPDF() {
      // Default A4 format values
      var pdfHeight = 297,
          pdfWidth = 210;

      // PDF page size validation
      if (!vm.outputPdfDetails.isDefaultSize &&
          (!vm.outputPdfDetails.width || !vm.outputPdfDetails.height)) {
        DataService.error('Incorrect PDF page size');
        return;
      }

      // Saving specified values to the local storage if not default
      if (!vm.outputPdfDetails.isDefaultSize) {
        pdfWidth = localStorage[appURL + '/outputPdfWidth'] = vm.outputPdfDetails.width;
        pdfHeight = localStorage[appURL + '/outputPdfHeight'] = vm.outputPdfDetails.height;
      }

      // Sending request to the server
      vm.progressBar.start();
      TableService.getPDF(vm.pid, pdfWidth, pdfHeight, 5000)
        .then(function (result) {
          vm.progressBar.complete();
          // returns a newly created Blob object
          // whose content consists of the concatenation of the array of values given in parameter.
          var blob = new Blob([result], {
            type: 'application/pdf'
          });
          // saving file on the client-side
          saveAs(blob, 'scenario_' + pid + '.pdf');
        }, function () {
          vm.progressBar.reset();
        });
    }

    // Download inputs(outputs) btn click handler
    function bulkDownload(event) {
      // Calculating the total number of rows in all the tables
      var rowsCount = 0;
      vm.dbuploadlist.forEach(function (tag) {
        tag.tables.forEach(function (table) {
          if (table.type === typeTab) rowsCount += parseInt(table.total_count) || 0;
        });
      });

      // Showing the bulk download modal window
      $mdDialog.show({
        template: $templateCache.get('app/bulk-download-dialog.ejs'),
        targetEvent: event,
        controller: bulkDownloadController,
        locals: {
          pid: pid,
          type: typeTab,
          scenarioName: $scope.work.projectDetails.name,
          rowsCount: rowsCount
        }
      });
    }

    // Upload inputs(outputs) btn click handler
    function bulkUpload(event) {
      if ($scope.work.projectDetails.locking &&
        $scope.work.projectDetails.locking.created_by &&
        $scope.work.projectDetails.locking.created_by !== $scope.main.currentUser.username
      ) {
        DataService.error('Scenario is locked by user - ' + $scope.work.projectDetails.locking.created_by);
        return;
      }
      // Array of all the input tables
      var tables = [];
      vm.dbuploadlist.forEach(function (value) {
        tables = tables.concat(value.tables);
      });

      // Showing the bulk upload modal window
      $mdDialog.show({
        template: $templateCache.get('app/bulk-upload-dialog.ejs'),
        targetEvent: event,
        controller: bulkUploadController,
        locals: {
          pid: pid,
          tables: tables,
          type: typeTab
        }
      }).then(function (uploadedTables) {
        // Updating data in tables after closing the modal window
        tables.forEach(function (table) {
          angular.element('#jqGrid_' + table.tablename).trigger('reloadGrid');
        });

        // Checking if at least one table was uploaded
        if (uploadedTables.length) {
          var triggerToRun;

          vm.triggers.forEach(function (trigger) {
            // For each trigger enabled for current segment
            if (!trigger.isEnabled || typeTab !== trigger.action.segment) return;

            // Saving trigger if its type is Edit table and trigger of type Upload table is not saved yet,
            // because the Upload table trigger is more specific
            if (trigger.type === 'tableEdit' && !triggerToRun) {
              triggerToRun = trigger;
              return;
            }

            // If trigger type is Upload table and it is configured for the current scenario
            if (trigger.type === 'tableUpload' && trigger.scenarioId === parseInt(pid)) {
              // Checking if trigger is configured for one of the uploaded tables
              var uploadedTable = uploadedTables.find(function (table) {
                return table.tablename === trigger.tableName;
              });

              if (uploadedTable) triggerToRun = trigger;
            }
          });

          // Running a trigger action if one is found
          if (triggerToRun) $rootScope.$emit('runAction', triggerToRun.actionId, triggerToRun._id);
        }
      });
    }

    function findLabel(list, table) {
      return _.find(list, {
        table: table
      }).labelName || 'List';
    }

    function findBomSettings(list, table) {
      return list.find(function (listItem) {
        return listItem.table === table;
      })
    }

    function showErrorMsg(error) {
      DataService.error(error && error.responseText ? error.responseText : tMessages.getTable().unknowenMsg);
    }

    function generateConfiguration(ev, list) {
      var config = {
        type: typeTab,
        pid: pid,
        ev: ev,
        tabFunctions: vm.tabFunctions,
        scenarioName: $scope.work.projectDetails.name,
        homeTooltips: $scope.main.homeTooltips,
        getRangeValueUrl: './scenario/' + pid + '/grid/filter/range?tableName=' + list.tablename + '&type=' + typeTab,
        getEditTableUrl: './scenario/' + pid + '/grid/edit/table?tableName=' + list.tablename + '&type=' + typeTab,
        getEditColumnUrl: './scenario/' + pid + '/grid/edit/column?tableName=' + list.tablename + '&type=' + typeTab + '&columnName=',
        downloadRowsUrl: './scenario/grid/download/?scenarioId=' + pid + '&tablename=' + list.tablename + '&type=',
        getGridUrl: 'scenario/grid/?scenarioId=' + pid + '&tablename=' + list.tablename + '&metaInfo=' + list.meta_info_exists,
        getGridIdUrl: 'scenario/grid/id/?scenarioId=' + pid + '&tablename=' + list.tablename,
        deleteGridUrl: 'scenario/grid/delete/?scenarioId=' + pid + '&type=' + typeTab + '&tableName=' + list.tablename,
        editGridUrl: 'scenario/grid/edit/?scenarioId=' + pid + '&type=' + typeTab + '&tableName=' + list.tablename,
        editCellUrl: 'scenario/grid/cell/edit/?scenarioId=' + pid + '&type=' + typeTab + '&tableName=' + list.tablename,
        addGridUrl: 'scenario/grid/add/?scenarioId=' + pid + '&type=' + typeTab + '&tableName=' + list.tablename,
        multiEditGridUrl: 'scenario/grid/multiedit/?scenarioId=' + pid + '&type=' + typeTab + '&tableName=' + list.tablename,
        getRowValueUrl: './scenario/grid/row?scenarioId=' + pid + '&tablename=' + list.tablename + '&metaInfo=' + list.meta_info_exists,
        getFilterUrl: 'scenario/grid/filter?scenarioId=' + pid + '&tablename=' + list.tablename + '&metaInfo=' + list.meta_info_exists,
        mainElem: '#extraTab',
        showUpload: vm.showUpload && $scope.main.currentUser.functions.Grid_Upload,
        execStatus: ExecutionProvider.getStatus(),
        scenarioStatus: $scope.work.projectDetails.status === 'active',
        triggers: vm.triggers
      };
      return JSON.stringify(config);
    }

    function checkTagVisibility (models) {
      var visibleArr = _.filter(models, {visible: true});
      return visibleArr && visibleArr.length ? true : false;
    }

    $rootScope.$on('startAction', function (ev, name) {
      vm.currentAction = name;
    });

    $rootScope.$on('stopAction', function () {
      vm.currentAction = '';
    });

    function openHtml(html) {
      return $templateCache.get('app/tabs_img/' + html);
    }

    function checkTabsVisibility() {
      return _.filter(vm.tabsList, {'isVisible': true}).length > 1 ? true : false;
    }

    function passActiveReport(reportType) {
      var curretReport = _.find(vm.reportArr, { id: vm['current' + typeTab] });
      return curretReport && reportType === vm.reportTypes.tableAU ? curretReport.url : curretReport;
    }
  }

})();
