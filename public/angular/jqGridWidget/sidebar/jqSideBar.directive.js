(function() {
  'use strict';

    // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
    angular
      .module('jqGridWidget')
      .directive('sidebarToggle', sidebarToggle)
      .directive('sidebar', sidebar);

    // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
    sidebarToggle.$inject = ['$timeout'];
    sidebar.$inject = ['$compile'];

    // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
    function sidebarToggle ($timeout) {
      var directive = {
        restrict: 'A',
        link: link
      };
      return directive;

      function link (scope, element, attrs) {
        scope.element = element[0];
        scope.body = document.body;

        function openSideBar () {
          var _element = document.getElementById(attrs.sidebarToggle);
          _element.classList.toggle('sidebar--is-open');

          var _bgSidebar = document.getElementById(attrs.sidebarToggle + '-bg');
          _bgSidebar.classList.toggle('sidebar-bg--is-visible');

          //control body
          if (scope.body.style.overflowY == 'auto') {
            scope.body.style.overflowY = 'hidden';
          } else {
            scope.body.style.overflowY = 'auto';
          }
        }

        function closeSideBar () {
          $timeout(function () {
            scope.body.style.overflowY = 'auto';
            angular.element(angular.element.find('#' + attrs.sidebarToggle)).removeClass('sidebar--is-open');
            angular.element(angular.element.find('#' + attrs.sidebarToggle + '-bg')).removeClass('sidebar-bg--is-visible');
          }, 50);
        }

        scope.element.addEventListener('click', openSideBar);
        angular.element(angular.element.find('.closeMenu')).click(closeSideBar);

      }
    }

    function sidebar ($compile) {
      var directive = {
        restrict: 'E',
        link: link
      };
      return directive;

      function link (scope, element, attrs) {
        scope.body = document.body;
        scope.element = element[0];

        //renderize sidebar
        scope.element.style.display = 'block';

        //add width on sidebar
        function isNumber(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        if (isNumber(attrs.size)) {
          scope.element.style.maxWidth = attrs.size + 'px';
        } else {
          scope.element.style.maxWidth = attrs.size;
        }

        //add class to position on sidebar
        scope.element.classList.add('sidebar--' + attrs.position);

        //renderize bg-sidebar
        var bgSidebar = document.createElement('div');
        bgSidebar.setAttribute('class', 'sidebar-bg');
        bgSidebar.setAttribute('id', attrs.id + '-bg');
        bgSidebar.setAttribute('sidebar-toggle', attrs.id);
        scope.body.appendChild(bgSidebar);

        $compile(bgSidebar)(scope);
      }
    }

})();
