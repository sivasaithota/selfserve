(function() {
  'use strict';

  angular
    .module('commonApp')
    .provider('settingsOptions', settingsOptions);

  function settingsOptions () {

    var contentType = {
      url: 'url',
      pdf: 'pdf'
    };

    // Scenario settings menu model
    function setMenu(currentUser) {
      return [
        {
          name: 'Visualization',
          show: currentUser.functions.Set_Tableau,
          options: [
            {
              name: 'Reports',
              ref: 'base.settings.scenario.visualization-reports',
              show: currentUser.functions.Set_Tableau
            },
            {
              name: 'Report settings',
              ref: 'base.settings.scenario.report-settings',
              show: currentUser.functions.Set_Tableau
            }
          ]
        },
        {
          name: 'General Settings',
          show: currentUser.functions.Set_Script ||
            currentUser.functions.Set_Lock ||
            currentUser.functions.Set_Help,
          options: [
            {
              name: 'Scenario Settings',
              ref: 'base.settings.scenario.common',
              show: currentUser.functions.Set_Lock
            },
            {
              name: 'Help Content',
              ref: 'base.settings.scenario.help',
              show: currentUser.functions.Set_Help
            }
          ]
        }
      ];
    }

    this.$get = function () {
      return {
        getMenuOptions: function (currentUser) {
          return setMenu(currentUser);
        },
        getActionTypes: function (type) {
          return [{
            name: type + '_refresh',
            displayName: 'Run scripts'
          }, {
            name: 'download',
            displayName: 'Download scripts'
          }, {
            name: 'upload',
            displayName: 'Upload files'
          }];
        },
        getHelpContent: function () {
          return [{
            label: 'By Document Upload (PDF Only)',
            value: contentType.pdf,
          }, {
            label: 'By URL ( Opens in New Tab)',
            value: contentType.url,
          }];
        },
        getContentType: function () {
          return contentType;
        }
      };
    };
  }
})();
