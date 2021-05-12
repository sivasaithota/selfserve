(function() {
    'use strict';

    angular
        .module('commonApp')
        .controller('templatesList', templatesList);

    templatesList.$inject = ['templates', '$state', '$stateParams'];

    // List of templates on the Scenario settings page
    function templatesList (templates, $state, $stateParams) {
        var vm = this;
        vm.templates = templates;

        // Retrieving the current template basing on the current state
        vm.currentTemplate = _.find(vm.templates, {id: +$stateParams.templateID});

        // changing the Scenario template
        vm.changeState = function (templateID) {
          $state.go('base.settings.scenario.' + $state.current.name.split('.').pop(), {templateID: templateID});
        }
    }
})();
