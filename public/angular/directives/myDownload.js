(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('myDownload', myDownload);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  myDownload.$inject = ['$compile'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function myDownload ($compile) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'E',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      // bind data to the directive's scope
      scope: {
        getData:'='
      }
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names 
        // and their corresponding attribute values
      var newBlob = {
        scenario: scope.getData.scenario,
        status: scope.getData.status,
        user: scope.getData.user,
        start_time: scope.getData.start_time,
        end_time: scope.getData.end_time,
        run_time: scope.getData.run_time,
        logs: scope.getData.logs
      };
      // returns a newly created Blob object
      // whose content consists of the concatenation of the array of values given in parameter.
      var url = URL.createObjectURL(
        new Blob([JSON.stringify(newBlob, null, '\t')],
        {type: "application/json"})
      );
      element.append($compile(
        '<a download="execution.log"' +
          'href="' + url + '">' +
          '<div class="exec_download">' +
          '<i class="fa fa-download"></i>' +
          '<span>Download log</span>' +
          '</div>' +
        '</a>'
      )(scope));
    }
  }
})();