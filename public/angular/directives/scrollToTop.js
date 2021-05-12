(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('scrollToTop', scrollToTop);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  scrollToTop.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function scrollToTop () {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'EA',
      // link option registers DOM listeners as well as updates the DOM
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names 
        // and their corresponding attribute values
      element.bind('click', function (event) {
        if (element[0].classList.contains("collapsed")) {
          $('html,body').animate({scrollTop: element.offset().top}, 800);
        }
      });
    }
  }
})();