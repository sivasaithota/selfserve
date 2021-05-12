(function() {
  'use strict';

  angular
    .module('commonApp')
    .controller('HelpSettingsCtrl', HelpSettingsCtrl);

  HelpSettingsCtrl.$inject = ['$scope', '$stateParams', '$timeout', 'ScenarioSetService', '$rootScope', 'settingsOptions'];

  // Controller for locking switch and btn on the scenario settings page
  function HelpSettingsCtrl ($scope, $stateParams, $timeout, ScenarioSetService, $rootScope, settingsOptions) {
    var vm = this;

    vm.isHelpSaved = false;
    vm.invalidInputFiles = [];
    vm.modelOptionsInput = {};
    vm.multipleInput = true;
    vm.patternInput = '.pdf';
    vm.acceptSelectInput = '.pdf';
    vm.isSuccessUploaded = false;
    vm.isErrorUploaded = false;
    vm.isUploading = false;
    vm.isUrlSaved = false;
    vm.helpContent = settingsOptions.getHelpContent();
    vm.contentType = settingsOptions.getContentType();
    vm.urlPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
    vm.progressBar = $rootScope.progressBar;

      // Fetching help page settings
    ScenarioSetService.getHelpSettings({templateID: $stateParams.templateID})
      .then(function(data) {
        var ext = data.helpPageName.split('.').reverse()[0];
        vm.helpUrl = ext !== vm.contentType.pdf ? data.helpPageName : null;
        vm.helpFile = ext === vm.contentType.pdf ? data.helpPageName : null;
        vm.type = (ext === vm.contentType.pdf || !ext) ? vm.contentType.pdf : vm.contentType.url;
      });

    vm.hideHelpPage = hideHelpPage;
    vm.uploadFile = uploadFile;
    vm.isUploadSuccess = isUploadSuccess;
    vm.saveHelpUrl = saveHelpUrl;

    function hideHelpPage () {
      var setting = {
        key: 'helpPageName',
        value: '',
        scenario_template_id: 0
      };
      ScenarioSetService.saveSettings(setting)
        .then(function () {
          $scope.main.helpPageDetails.helpPageName = null;
          vm.helpUrl = null;
          vm.helpFile = null;
        });
    }

    function uploadFile (ev, file) {
      if (file) {
        vm.progressBar.start();
        vm.isErrorUploaded = false;
        vm.isSuccessUploaded = false;
        vm.isUploading = true;
        ScenarioSetService.uploadPage(file)
          .then(function () {
            vm.settings.helpFile = file.name;
            vm.helpUrl = null;
            vm.isErrorUploaded = false;
            vm.isUploading = false;
            vm.isSuccessUploaded = true;
            $scope.main.helpPageDetails.helpPageName = file.name;
            vm.progressBar.complete();
          }, function () {
            vm.settings.helpFile = file.name;
            vm.isSuccessUploaded = false;
            vm.isUploading = false;
            vm.isErrorUploaded = true;
            vm.progressBar.reset();
          });
      }
    }

    function isUploadSuccess () {
      return vm.helpFile && ((vm.isSuccessUploaded && !vm.isUploading) || (!vm.isErrorUploaded && !vm.isUploading));
    }

    function saveHelpUrl () {
      var setting = {
        key: 'helpPageName',
        value: vm.helpUrl,
        scenario_template_id: 0
      };
      ScenarioSetService.saveSettings(setting)
        .then(function () {
          $scope.main.helpPageDetails.helpPageName = vm.helpUrl;
          vm.helpFile = null;
          vm.isUrlSaved = true;
          $timeout(function (argument) {
            vm.isUrlSaved = false;
          }, 3000);
        });
    }
  }
})();
