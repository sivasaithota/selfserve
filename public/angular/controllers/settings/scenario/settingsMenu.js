(function() {
    'use strict';

    angular
        .module('commonApp')
        .controller('settingsMenu', settingsMenu);

    settingsMenu.$inject = ['settingsOptions', '$state', '$rootScope'];

    // Left menu on the Scenario settings page
    function settingsMenu (settingsOptions, $state, $rootScope) {
      var vm = this;
      vm.menu = settingsOptions.getMenuOptions($rootScope.currentUser);

      // Figuring out the current active option basing on the state
      vm.activeOption = $state.current.name;
    }
})();
