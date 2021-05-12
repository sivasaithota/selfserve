(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('tableauViz', tableauViz);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  tableauViz.$inject = ['$rootScope', 'TableauService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function tableauViz($rootScope, TableauService) {
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
        tableauId: '=',
        tableauUrl: '=',
        tableauType: '='
      }
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
      // and their corresponding attribute values
      var viz;
      var refreshViz = $rootScope.$on('handleBroadcast', function (ev, type) {
        if (scope.tableauType === type) {
          viz.refreshDataAsync();
        }
      });

      scope.$on('$destroy', function () {
        refreshViz();
      });

      function generateTableau(url) {
        // configurate tableau settings
        var options = {
          width: '100%',
          height: '100%',
          hideTabs: false,
          hideToolbar: false,
          onFirstInteractive: function () {
            var workbook = viz.getWorkbook();
            var activeSheet = workbook.getActiveSheet();
          }
        };

        // If a viz object exists, delete it.
        if (viz) {
          viz.dispose();
        }

        // Adding scenario ID to the URL
        url += '&scenario_id=' + scope.tableauId;

        
        // Switching off the tableau toolbar according to the fetched setting
        if (!$rootScope.tableauFooter) {
          // 'toolbar' param works only after the 'embed' param
          url = url.replace('&:embed=y', '&:embed=y&:toolbar=n');
        }

        viz = new tableau.Viz(element[0], url, options);
      }

      scope.$watch('tableauUrl', function (url) {
        if (!angular.isUndefined(url)) {
          TableauService.getTableauTicket()
            .then(function (data) {
              if (data.ticket) {
                try {
                  var urlObj = new URL(url);
                  var newUrl = urlObj.origin + '/trusted/' + data.ticket + urlObj.pathname + urlObj.search;
                  generateTableau(newUrl);
                } catch (err) {
                  console.log('Invalid tableau url');
                }
              } else {
                generateTableau(url);
              }
            });
        }
      });
    }
  }
})();