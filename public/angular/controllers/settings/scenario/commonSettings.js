(function() {
  'use strict';

  angular
    .module('commonApp')
    .controller('CommonSettingsCtrl', CommonSettingsCtrl);

  CommonSettingsCtrl.$inject = ['tabViews', 'ScenarioSetService', 'DataService', '$stateParams', '$rootScope'];

  // Controller for locking switch and btn on the scenario settings page
  function CommonSettingsCtrl (tabViews, ScenarioSetService, DataService, $stateParams, $rootScope) {
    var vm = this;
    var inputObj = tabViews.find(function (tab) {
      return tab.type === 'inputs';
    }),
    outputObj = tabViews.find(function (tab) {
      return tab.type === 'outputs';
    });
    angular.extend(vm, {
      onChangeLock : onChangeLock,
      updateDefaultView: updateDefaultView,
      releaseLock : ScenarioSetService.releaseLock,
      executionUpdateMetaChange : executionUpdateMetaChange,
      toggleHideOutdatedOutputWarning: toggleHideOutdatedOutputWarning,
      tabsList: DataService.getTabs(),
      inputTab: inputObj && inputObj.value ? inputObj.value : null,
      outputTab: outputObj && outputObj.value ? outputObj.value : null,
    });

    ScenarioSetService.getSettings({ keys: 'locking,executionUpdateMetaEnable,hideOutdatedOutputWarning' }).then(function (data) {
      vm.lock = data.locking === "on";
      vm.executionUpdateMetaEnable = data.executionUpdateMetaEnable;
      vm.hideOutdatedOutputWarning = data.hideOutdatedOutputWarning;
    });

    function onChangeLock () {
      var newValue = vm.lock ? 'on' : 'off';
      ScenarioSetService.saveSettings({
        key: 'locking',
        value: newValue,
        scenario_template_id: 0
      }).then(function () {
        $rootScope.$emit('updateLock', newValue);
        DataService.success('Updated successfully');
      });
    }

    function updateDefaultView(value, type) {
      ScenarioSetService.updateTabView({
        value: value,
        type: type,
        templateID: $stateParams.templateID,
      })
        .then(function (data) {
          DataService.success(data);
        });
    }

    function executionUpdateMetaChange() {
      ScenarioSetService.saveSettings({
        key: 'executionUpdateMetaEnable',
        value: vm.executionUpdateMetaEnable,
        scenario_template_id: 0
      }).then(function () {
        DataService.success('Updated successfully');
      });
    }

    function toggleHideOutdatedOutputWarning() {
      ScenarioSetService.saveSettings({
        key: 'hideOutdatedOutputWarning',
        value: vm.hideOutdatedOutputWarning,
        scenario_template_id: 0
      }).then(function () {
        DataService.success('Updated successfully');
      });
    }
  }
})();
