(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('autoScroll', autoScroll);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  autoScroll.$inject = ['$rootScope', '$timeout'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function autoScroll ($rootScope, $timeout) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'A',
      // link option registers DOM listeners as well as updates the DOM
      link: link
    };

    return directive;

    function link (scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
        // and their corresponding attribute values

      var lastScrollTop = 0;
      var autoDown = true;
      // Auto Scroll down but stop when user scrolls
      angular.element(element).scroll(function(event){
         var st = $(this).scrollTop();
         if (st <= lastScrollTop){
           autoDown = false;
         } else {
           if (element[0].scrollHeight - element.scrollTop() < element[0].offsetHeight) {
             autoDown = true;
           }
         }
         lastScrollTop = st;
      });
      // listen for the event in the relevant $rootScope
      var logEmit = $rootScope.$on('checkLog', function(ev) {
        $timeout(function() {
          if (autoDown) {
            element[0].scrollTop = element[0].scrollHeight;
          }
        }, 100);
      });

      // stop participating in model change detection and listener notification by invoking
      scope.$on('$destroy', function() {
        logEmit();
      });
    }
  }
})();
