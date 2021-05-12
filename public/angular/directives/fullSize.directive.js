(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('sizeMenu', sizeMenu);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  sizeMenu.$inject = ['$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function sizeMenu ($rootScope) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'AE',
      replace: 'true',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      scope: {
        tables: '=',
        showInfo: '=',
        activeTab: '='
      },
      // templateUrlspecifies the HTML markup that will be produced
      // when the directive is compiled and linked by Angular
      templateUrl: 'app/full-size-menu.ejs'
    };

    return directive;

    function link (scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
        // and their corresponding attribute values

      function findActiveTab () {
        var isOpened = false;
        angular.forEach(scope.tables, function (list) {
          angular.forEach(list.tables, function (table) {
            if (table.active) isOpened = true;
          });
        });
        return isOpened;
      }

      function setActiveTab () {
        scope.showInfo = false;
        scope.tables[0].active = true;
        scope.tables[0].tables[0].active = true;
      }

      function setTableauStyles () {
        angular.element(angular.element.find('.tableau_header'))
          .css('border-bottom', 'solid 1px')
          .css('top', '40px');
        angular.element(angular.element.find('#tableauViz'))
          .css('padding-top', '87px');
        angular.element(angular.element.find('.app_container--tabs'))
          .css('top', '0');
        angular.element(angular.element.find('#tableauViz iframe'))
          .css('height', 'calc(100% - 75px)');
      }

      function showTableauElements () {
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('right', '60px');
        setTableauStyles();
      }

      function hideTableauElements () {
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('right', '');
        angular.element(angular.element.find('.tableau_header'))
          .css('right', '')
          .css('border-bottom', '')
          .css('top', '');
        angular.element(angular.element.find('#tableauViz'))
          .css('padding-top', '');
        angular.element(angular.element.find('.app_container--tabs'))
          .css('top', '');
        angular.element(angular.element.find('#tableauViz iframe'))
          .css('height', '100%');
      }

      scope.showFullSize = function () {
        var isTabTableOpen = findActiveTab();
        if (!isTabTableOpen && scope.tables.length) {
          setActiveTab();
        }
        scope.isFullSize = true;
        $rootScope.isFullSize = true;
        // Elements for tableau tab
        if (scope.activeTab === 'table') {
          $rootScope.$emit('showFullSize');
        } else {
          showTableauElements();
        }
        // Hide left bar, header, list of table and update styles for visible elements
        angular.element(angular.element.find('.full_size_hide'))
          .css('display', 'none');
        angular.element(angular.element.find('.ui-jqgrid-bdiv'))
          .css('min-height', 'calc(100% - 245px)');
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('top', '12px');
        angular.element(angular.element.find('.report_content'))
          .css('padding-top', '50px');
      };

      scope.hideFullSize = function () {
        scope.isFullSize = false;
        $rootScope.isFullSize = false;
        // Show left bar, header, list of table and update styles for visible elements
        angular.element(angular.element.find('.full_size_hide'))
          .css('display', '');
        angular.element(angular.element.find('.ui-jqgrid-bdiv'))
          .css('min-height', '');
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('top', '');
        angular.element(angular.element.find('.extra_tab > .nav-tabs'))
          .css('right', '');
        angular.element(angular.element.find('.report_content'))
          .css('padding-top', '');
        hideTableauElements();
        if (scope.activeTab === 'table') $rootScope.$emit('hideFullSize');
      };

      // Close full size by clicking on ESC button or redirect
      angular.element(document).keyup(function(e) {
        if (e.keyCode === 27 && scope.isFullSize) scope.hideFullSize();
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {
        scope.hideFullSize();
      });

      // Watching clicking on tab menu
      scope.$watch('activeTab', function (value) {
        if (value === 'tableau' || value === 'bom' || value === 'html') {
          angular.element(angular.element.find('.extra_tab > .nav-tabs'))
            .css('right', scope.isFullSize ? '50px' : '');
          if (value === 'tableau' && scope.isFullSize) setTableauStyles();
        }
      });

    };
  }
})();
