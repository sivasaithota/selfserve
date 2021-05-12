(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('powerbiViz', powerbiViz);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  powerbiViz.$inject = ['$rootScope', '$window'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function powerbiViz($rootScope, $window) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'EA',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      // bind data to the directive's scope
      scope: {
        powerbiViz: '=',
        tableList: '=',
        scenarioId: '='
      }
    };

    return directive;

    function link(scope, element, attrs) {
      var embedFilter = {
        $schema: "http://powerbi.com/product/schema#basic",
          target: {
            table: "reports projects",
            column: "id"
          },
          operator: "In",
          values: [Number(scope.scenarioId)],
          filterType: 1, // pbi.models.FilterType.BasicFilter,
          displaySettings: {
            isLockedInViewMode: true
          }
      };
      scope.$watch('powerbiViz', function (report) {
        if (!angular.isUndefined(report)) {
          var models = $window['powerbi-client'].models;
          var embedConfiguration = {
            type: 'report',
            id: report.report_id,
            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=' + report.report_id,
            tokenType: models.TokenType.Embed,
            accessToken: report.token,
            filters: [embedFilter],
          };

          var report = $window['powerbi'].embed(element[0], embedConfiguration);
        }
      });
    }
  }
})();
