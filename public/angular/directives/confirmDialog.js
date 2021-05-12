(function() {
  'use strict';

  angular
      .module('commonApp')
      .directive('confirmDialog', confirmDialog);

  // Controller for the confirm delete dialog
  // Template views/includes/confirm_dialog.ejs
  function confirmDialog () {
    return {
      restrict: 'E',
      templateUrl: 'includes/confirm_dialog.ejs',
      scope: {
        title: '=',
        message: '=',
        button: '=',
        item: '='
      },

      controller: ['$scope', '$rootScope', function($scope, $rootScope) {
        // Emitting dialogCancel event on clicking the Cancel btn
        $scope.onCancel = function () {
          $rootScope.$broadcast('dialogCancel', $scope.item, $scope.title);
        };

        // Emitting dialogConfirm event on clicking the confirm btn
        $scope.onConfirm = function () {
          $rootScope.$broadcast('dialogConfirm', $scope.item, $scope.title);
        };
      }]
    };
  }
})();
