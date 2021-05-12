'use strict';

describe('Controller: slackCtrl', function(){
  var slackCtrl,
    scope,
    toastr,
    $q,
    $mdDialog,
    SlackService,
    addSlackDeferred,
    editSlackDeferred,
    getChannelsDeferred,
    createChannelDeferred,
    changeStateDeferred;

  beforeEach(module('commonApp'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('slackSettings', {slack: true});
      $provide.value('slackOptions', [{api_token: 'token'}]);
    });

    inject(function ($controller, _$rootScope_, _$q_, _toastr_, _SlackService_, _$mdDialog_) {
      scope = _$rootScope_.$new();
      toastr = _toastr_;
      $q = _$q_;
      $mdDialog = _$mdDialog_;
      SlackService = _SlackService_;
      addSlackDeferred = _$q_.defer();
      spyOn(SlackService, 'addSlack').and.returnValue(addSlackDeferred.promise);
      editSlackDeferred = _$q_.defer();
      spyOn(SlackService, 'editSlack').and.returnValue(editSlackDeferred.promise);
      getChannelsDeferred = _$q_.defer();
      spyOn(SlackService, 'getChannelsList').and.returnValue(getChannelsDeferred.promise);
      createChannelDeferred = _$q_.defer();
      spyOn(SlackService, 'createChannel').and.returnValue(createChannelDeferred.promise);
      changeStateDeferred = _$q_.defer();
      spyOn(SlackService, 'changeSlackState').and.returnValue(changeStateDeferred.promise);
      slackCtrl = $controller('slackCtrl', {
        $scope: scope,
        toastr: toastr,
        SlackService: SlackService,
        $mdDialog: $mdDialog
      });
    });

  });

  describe('initial status of the controller', function() {
    it('check controller', function() {
      expect(slackCtrl).toBeDefined();
    });
  });

  describe('check functions', function () {
    it('should add new slack type', function() {
      slackCtrl.slackSettings = [];
      slackCtrl.addNewSlack();
      expect(slackCtrl.slackSettings).toEqual([{
        color: '#455A64',
        edit: true,
        open: true,
        id: 0,
        createChannel: jasmine.any(Function)
      }]);
    });

    describe('save slack type', function () {
      it('should not save slack type if fields are empty', function() {
        spyOn(toastr, 'error');
        var slack = {
          isRun: false
        };
        slackCtrl.saveSlack(slack);
        expect(toastr.error).toHaveBeenCalledWith('<div>All fields are mandatory!</div><i class="material-icons md-30">report_problem</i>', 'Error notification');
        expect(slack.isRun).toBe(false);
      });

      it('should save new slack type', function() {
        var slack = {
          isRun: false,
          id: 0,
          newColor: '#455A64',
          newApiToken: 'token',
          newBoxHeader: 'Please contact admin if you have a question',
          newChannelId: 'C49UDL36Y',
          newType: 'Support'
        };
        slackCtrl.saveSlack(slack);
        addSlackDeferred.resolve({
          id: 1
        });
        scope.$digest();
        expect(SlackService.addSlack).toHaveBeenCalled();
        expect(SlackService.addSlack).toHaveBeenCalledWith({
          type: 'Support',
          color: '#455A64',
          api_token: 'token',
          channel_id: 'C49UDL36Y',
          bot_username: 'Bot user',
          support_name: 'Default user',
          box_header: 'Please contact admin if you have a question'
        });
        expect(SlackService.addSlack.calls.count()).toBe(1);
        expect(slack.id).toBe(1);
        expect(slack.edit).toBe(false);
        expect(slack.type).toBe(slack.newType);
        expect(slack.color).toBe(slack.newColor);
        expect(slack.api_token).toBe(slack.newApiToken);
        expect(slack.channel_id).toBe(slack.newChannelId);
        expect(slack.box_header).toBe(slack.newBoxHeader);
      });

      it('should edit slack type', function() {
        var slack = {
          isRun: false,
          id: 2,
          newColor: '#455A64',
          newApiToken: 'token',
          newBoxHeader: 'Please contact admin if you have a question',
          newChannelId: 'C49UDL36Y',
          newType: 'Support'
        };
        slackCtrl.saveSlack(slack);
        editSlackDeferred.resolve();
        scope.$digest();
        expect(SlackService.editSlack).toHaveBeenCalled();
        expect(SlackService.editSlack).toHaveBeenCalledWith(2, {
          type: 'Support',
          color: '#455A64',
          api_token: 'token',
          channel_id: 'C49UDL36Y',
          bot_username: 'Bot user',
          support_name: 'Default user',
          box_header: 'Please contact admin if you have a question'
        });
        expect(SlackService.editSlack.calls.count()).toBe(1);
        expect(slack.edit).toBe(false);
        expect(slack.type).toBe(slack.newType);
        expect(slack.color).toBe(slack.newColor);
        expect(slack.api_token).toBe(slack.newApiToken);
        expect(slack.channel_id).toBe(slack.newChannelId);
        expect(slack.box_header).toBe(slack.newBoxHeader);
      });
    });

    it('should delete slack type', function() {
      var deferred = $q.defer();
      $mdDialog.show = jasmine.createSpy().and.callFake(function() {
        return deferred.promise;
      });
      scope.$digest();
      slackCtrl.deleteSlack($.event, 1);
      expect($mdDialog.show).toHaveBeenCalled();
    });

    it('should get channels', function() {
      var slack = {
        newApiToken: 'token',
        api_token: ''
      };
      slackCtrl.getChannels(slack);
      var channels = [{
        id: 'C4C77FRNY',
        members: ['U4AGZSTV4']
      }];
      getChannelsDeferred.resolve(channels);
      scope.$digest();
      expect(SlackService.getChannelsList).toHaveBeenCalled();
      expect(SlackService.getChannelsList).toHaveBeenCalledWith('token');
      expect(SlackService.getChannelsList.calls.count()).toBe(1);
      expect(slack.channels).toEqual(channels);
    });

    it('should create channel', function() {
      spyOn(toastr, 'success');
      var slack = {
        newApiToken: 'token',
        newChannelName: 'new_name',
        channels: []
      };
      slackCtrl.createChannel(slack);
      var channel = {
        id: 'R8N7FRNY',
        members: ['U4AGZSTV4']
      };
      createChannelDeferred.resolve(channel);
      scope.$digest();
      expect(SlackService.createChannel).toHaveBeenCalled();
      expect(SlackService.createChannel).toHaveBeenCalledWith('token', 'new_name');
      expect(SlackService.createChannel.calls.count()).toBe(1);
      expect(slack.newChannelId).toBe(channel.id);
      expect(slack.channels).toEqual([channel]);
      expect(toastr.success).toHaveBeenCalledWith('<div>New slack channel was created successfully!</div><i class="material-icons md-30">done_all</i>', 'Success notification');
    });

    it('should enabled slack chat', function() {
      spyOn(toastr, 'success');
      var slack = {
        state: false
      };
      slackCtrl.onChange(slack);
      var answer = {
        state: true
      };
      changeStateDeferred.resolve(answer);
      scope.$digest();
      expect(SlackService.changeSlackState).toHaveBeenCalled();
      expect(SlackService.changeSlackState.calls.count()).toBe(1);
      expect(SlackService.changeSlackState).toHaveBeenCalledWith(slack);
      expect(toastr.success).toHaveBeenCalledWith('<div>Slack is enabled.</div><i class="material-icons md-30">done_all</i>', 'Success notification');
    });
  });
});
