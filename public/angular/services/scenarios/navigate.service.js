(function () {
    'use strict';
  
    // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
    angular
      .module('commonApp')
      .factory('NavigateService', NavigateService);
  
    // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
    NavigateService.$inject = ['ScenarioService', '$state'];
  
    // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
    function NavigateService(ScenarioService, $state) {
      // the callable members of the service
      var service = {
        viewProject: viewProject,
      };
  
      return service;

      function viewProject(id, isScView, type) {
        if (isScView) {
          ScenarioService.getInfoPage(id)
            .then(function (data) {
              // try to find default tab
              var defaultTab = data.find(function (dataObj) {
                return dataObj.visible && dataObj.isDefault;
              })
              if (type) {
                $state.go('base.project.' + type, {
                  'projId': id,
                  tab: type === 'outputs' ? 'tableau' : 'table'
                });
              } else if (defaultTab && defaultTab.type) {
                $state.go('base.project.' + defaultTab.type, {
                  'projId': id,
                  tab: 'table'
                });
              } else {
                // get information about tabs' name
                var visibleTab = _.sortByOrder(_.filter(data, {visible: true}), ['id'],['asc']);
                // Redirect if tab is not visible
                if (visibleTab.length && visibleTab[0].type) {
                  $state.go('base.project.' + visibleTab[0].type, {
                    projId: vm.pid,
                    tab: visibleTab[0].type === 'inputs' ? 'table' : 'tableau'
                  });
                } else {
                  $state.go('base.project.inputs', {
                    'projId': id,
                    tab: 'table'
                  });
                }
              }
            })
        }
      }
  
    }
  })();
  