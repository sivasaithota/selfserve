'use strict';

describe('Controller: workspaceDetails', function(){
  beforeEach(module('commonApp'));

  var workspaceDetails;

  // Initialize the controller and a mock scope
  beforeEach(function() {
    module(function($provide) {
      $provide.value('slackSettings', {slack: true});
      $provide.value('slackOptions', [{api_token: 'token'}]);
      $provide.value('infoPage', [{
        type: 'inputs',
        visible: true,
        value: 'Inputs'
      }, {
        type: 'outputs',
        visible: true,
        value: 'Outputs'
      }, {
        type: 'parameters',
        visible: true,
        value: 'Parameters'
      }, {
        type: 'executions',
        visible: true,
        value: 'Executions'
      }]);
    });

    inject(function ($controller) {
      workspaceDetails = $controller('workspaceDetails');
    });
  });

  describe('initial status of the controller', function() {
    it('check controller', function() {
      expect(workspaceDetails).toBeDefined();
    });

    it('check variables', function() {
      expect(workspaceDetails.isSlack).toBe(true);
      expect(workspaceDetails.slackOptions).toEqual([{api_token: 'token'}]);
      expect(workspaceDetails.input).toEqual({
        type: 'inputs',
        visible: true,
        value: 'Inputs'
      });
      expect(workspaceDetails.output).toEqual({
        type: 'outputs',
        visible: true,
        value: 'Outputs'
      });
      expect(workspaceDetails.parameter).toEqual({
        type: 'parameters',
        visible: true,
        value: 'Parameters'
      });
      expect(workspaceDetails.execution).toEqual({
        type: 'executions',
        visible: true,
        value: 'Executions'
      });
    });
  });
});