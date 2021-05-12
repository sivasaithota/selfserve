(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .provider('ExecutionProvider', ExecutionProvider);

  ExecutionProvider.$inject = [];

  function ExecutionProvider () {
    var status = {
      completedSuccess: 'execution completed',
      success: 'success',
      completedFailure: 'execution failed',
      failure: 'failure',
      cancelled: 'execution cancelled',
      running: 'running',
      queued: 'queued',
      started: 'started',
      cancelling: 'cancelling',
      tableauRunning: 'publishing reports',
      tableauSuccess: 'published reports',
      tableauFailure: 'publish report failed'
    };

    this.$get = function () {
      return {
        getStatus: function () {
          return status;
        }
      };
    };
  }
})();
