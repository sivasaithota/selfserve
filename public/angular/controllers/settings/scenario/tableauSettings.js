(function() {
  'use strict';

  angular
    .module('commonApp')
    .controller('TableauSettingsCtrl', TableauSettingsCtrl);

  TableauSettingsCtrl.$inject = ['allTableau', 'powerReports', 'TableauService', '$timeout', '$q',
    '$stateParams', 'PowerBiService', 'DataService'];

  function TableauSettingsCtrl (allTableau, powerReports, TableauService, $timeout, $q,
    $stateParams, PowerBiService, DataService) {
    // represent the binding scope
    var vm = this;

    // Model for displaying the icon after successfully saving the setting
    vm.isSaved = {
      tableauFooter: false,
      tableauUsername: false,
      outputViz: false,
      inputViz: false
    };
    vm.incorrectUser = false;

    vm.inputTables = _.filter(allTableau, {type: 'input'});
    vm.outputTables = _.filter(allTableau, {type: 'output'});
    vm.inputPowerReports = _.filter(powerReports, {type: 'input'});
    vm.outputPowerReports = _.filter(powerReports, {type: 'output'});

    // visualization extracts models
    vm.tableauExtracts = DataService.getExtractStructure();
    vm.powerbiExtracts = DataService.getExtractStructure();

    // db credentials
    vm.dbCredentials;
    vm.saveSettings = saveSettings;
    vm.switchAuthenticationOff = switchAuthenticationOff;
    vm.switchFooter = switchFooter;
    vm.switchTableauExtract= switchTableauExtract;
    vm.switchPowerbiExtract= switchPowerbiExtract;
    vm.filterItems = filterItems;
    vm.selectUser = selectUser;
    vm.saveTabVisibility = saveTabVisibility;
    vm.updateVizType = updateVizType;

    // Fetching tableau users
    TableauService.getUsers().then(function (data) {
      vm.users = data.users;
    });

    // Fetching tableau settings
    TableauService.getSettings({
      templateID: $stateParams.templateID,
      keys: 'inputVizType,outputVizType,inputViz,outputViz,tableauTrusted,tableauUsername,tableauFooter'
    }).then(function(data) {
      vm.settings = data;
      vm.tabs = {
        input: {
          segment: 'input',
          inputViz: data.inputViz,
          inputVizType: data.inputVizType,
          tabValue: 'inputViz',
          vizType: 'inputVizType',
          tableName: 'inputTables',
          powerReport: 'inputPowerReports'
        },
        output: {
          segment: 'output',
          outputViz: data.outputViz,
          outputVizType: data.outputVizType,
          vizType: 'outputVizType',
          tabValue: 'outputViz',
          tableName: 'outputTables',
          powerReport: 'outputPowerReports'
        }
      };
    });

    // Fetching tableau settings
    TableauService.getCredentials().then(function(data) {
      vm.dbCredentials = data;
    });


    // Fetching tableau extracts details
    TableauService.getExtracts($stateParams.templateID).then(function(extracts) {
      // Reformatting the fetched data separating it by type and segment
      extracts.forEach(function (extract) {
        if (extract.typeName !== 'validate') {
          extract.saved = false;
          if (extract.segment) {
            vm.tableauExtracts[extract.type][extract.segment].push(extract);
          } else {
            vm.tableauExtracts[extract.type].push(extract);
          }
        }
      });
    });

    // Fetching tableau extracts details
    PowerBiService.getExtracts($stateParams.templateID).then(function(extracts) {
      // Reformatting the fetched data separating it by type and segment
      extracts.forEach(function (extract) {
        if (extract.type_name !== 'validate') {
          extract.saved = false;
          if (extract.segment) {
            vm.powerbiExtracts[extract.type][extract.segment].push(extract);
          } else {
            vm.powerbiExtracts[extract.type].push(extract);
          }
        }
      });
    });

    // Sending tableau settings to the server
    function saveSettings(key, templateId) {
      return TableauService.saveSettings({
        key: key,
        value: vm.settings[key],
        scenario_template_id: !templateId ? 0 : templateId
      });
    }

    // Save tab visiblity
    function saveTabVisibility (key, upload) {
        // Enable tableau reports when tableau workbook uploaded
      if(upload) vm.settings[key] = true;
      saveSettings(key, $stateParams.templateID)
        .then(function () {
          showSuccessIcon(vm.isSaved, 'tableauOutput');
        });
    };

    function updateVizType(key, value) {
      vm.settings[key] = value;
      saveSettings(key, $stateParams.templateID);
    }

    // Saving Tableau Trusted and Tableau Username settings
    function saveTrustedSettings(username) {
      vm.settings.tableauUsername = username;
      saveSettings('tableauTrusted').then(function () {
        return saveSettings('tableauUsername');
      }).then(function () {
        showSuccessIcon(vm.isSaved, 'tableauUsername');
      })
    }

    // Listener on the Trusted Authentication switch
    function switchAuthenticationOff() {
      if (!vm.settings.tableauTrusted) {
        saveTrustedSettings('');
      }
    }

    // Listener on the Tableau Footer switch
    function switchFooter() {
      saveSettings('tableauFooter').then(function () {
        showSuccessIcon(vm.isSaved, 'tableauFooter');
      });
    }

    // Sending changed tableau extract setting to the server
    function switchTableauExtract(extract) {
      TableauService.saveExtract(extract.id, extract.runExtract).then(function () {
        showSuccessIcon(extract, 'saved');
      }).catch(function () {
        extract.runExtract = !extract.runExtract;
      })
    }

    // Sending changed powerbi extract setting to the server
    function switchPowerbiExtract(extract) {
      PowerBiService.saveExtract(extract.id, extract.run_import).then(function () {
        showSuccessIcon(extract, 'saved');
      }).catch(function () {
        extract.run_import = !extract.run_import;
      })
    }

    // Filtering items in the tableau users select
    function filterItems (userInput) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = vm.users.filter(function(user) {
        return user.toLowerCase().indexOf(normalisedInput) === 0;
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }

    // Listener on the tableau users select
    function selectUser (userName) {
      if (userName) {
        // Checking if selected user is one of the available users
        if (vm.users.indexOf(userName) === -1) {
          vm.incorrectUser = true;
        } else {
          vm.incorrectUser = false;
          saveTrustedSettings(userName);
        }
      }
    }

    // Displaying the success icon for 1 sec
    function showSuccessIcon(model, property) {
      model[property] = true;
      $timeout(function () {
        model[property] = false;
      }, 1000);
    }
  }

})();
