(function() {
  'use strict';

  angular
    .module('commonApp')
    .controller('HelpPageCtrl', HelpPageCtrl);

  HelpPageCtrl.$inject = ['$scope', '$sce'];

  // Controller for locking switch and btn on the scenario settings page
  function HelpPageCtrl ($scope, $sce) {
    var vm = this;
    var pageParts = $scope.main.helpPageDetails.helpPageName.split('.');
    if (pageParts[pageParts.length - 1] === 'pdf') {
      vm.pageUrl = './setting/help';
    } else {
      vm.helpUrl = $sce.trustAsResourceUrl($scope.main.helpPageDetails.helpPageName);
    }
  }
})();
