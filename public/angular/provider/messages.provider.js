(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .provider('tMessages', tMessages);

  tMessages.$inject = [];

  function tMessages () {
    var scenario = {
      deleted: ' deleted successfully',
      created: 'Scenario created',
      copied: ' copied successfully',
      tagExists: 'A tag by this name already exists. Please type a different name.',
      tagSaved: 'Tag saved successfully.',
      archived: ' archived successfully',
      scenarioNameLength: 'Maximum characters upto 80',
      scenarioNamePattern: 'Special characters are not permitted for scenario names. Valid characters include A-z, 0-9, ".", "_" and "-".',
      tagNameLength: 'Maximum characters upto 40',
      tagNamePattern: 'Special characters are not permitted for tag names. Valid characters include A-z, 0-9, ".", "_" and "-".',
    };
    var access = {
      restricted: 'Access restricted',
      login: 'Access restricted. Please contact Opex team to resolve.',
      ssoEmail: 'Please enter SSO email address',
      usernamePasswordEmpty: 'Please enter username/password.'
    };
    var parameters = {
      saved: 'Parameters saved successfully.',
      parametersFields: 'All fields are mandatory!',
      dateFormat: 'Invalid date format. Please check date picker value.',
      numericFormat: ' is numeric field. Please update and try again.',
      executionError: 'Sorry, there is a problem in running this execution. Please check the log files to know more.',
      primaryActionUndefined: 'Action to execute is not defined. Please set it up to start the execution'
    };
    var settings = {
      changeAccess: 'User accesses updated successfully',
      deleteUser: 'User deleted successfully',
      addSlack: 'Slack channel saved successfully',
      invalidAuth: 'Invalid authentication token.',
      nameTaken: 'A channel cannot be created with the given name.',
      accountInactive: 'Authentication token is for a deleted user or team.',
      notAuthed: 'No authentication token provided.',
      invalidName: 'Value passed for name was invalid.',
      noChannel: 'Value passed for name was empty.',
      userField: 'All fields are mandatory!',
      invalidEmail: 'Invalid email address!',
      headerUserDelete: 'Are you sure to delete user ',
      copyCredentials: 'Credentials copied to clipboard!',
      tableauFields: 'All fields are mandatory!',
      headerTableauDelete: 'Are you sure to delete tableau url?',
      slackFields: 'All fields are mandatory!',
      headerSlackDelete: 'Are you sure to delete Slack?',
      createChannel: 'New slack channel was created successfully!',
      scenarioFields: 'All fields are mandatory!',
      headerScenarioUpdate: 'Are you sure to update Settings?',
      headerScenarioDelete: 'Are you sure to delete script?',
      deleteLocking: 'All locks are removed.',
      userNameOccupied: 'Specified user name is already occupied',
      userEmailOccupied: 'Specified email is already registered'
    };
    var table = {
      actionError: 'Sorry, there is a problem in running this action. Please check the log files to know more.',
      uploadSuccess: 'Data uploaded successfully!',
      uploadError: 'Data upload error',
      fileFormat: 'Only .csv or .xlsx files can be loaded.',
      fileSize: ' File exceeds 40 MB size limit. Please try again with files less than 40MB.',
      fileEmpty: 'Choose file before uploading.',
      validationSuccess: 'Data validated successfully!',
      validationError: 'Data validation error',
      bulkUploadInvalidExtension: 'Invalid file extension',
      bulkUploadInvalidTable: 'Table is not found in the database',
      largeFileWarning: 'Large dataset file. ' +
          'Downloading might take some time. ' +
          'Don\'t close/refresh the tab during the process.',
      requiredItem: function (colname) {
        return 'Choose ' + colname + ' value from the list';
      },
      headerJqgridDelete: 'Are you sure to delete table rows url?',
      saveSuccess: function (type) {
        return 'Row was ' + type + 'ed successfully';
      },
      errorSuccess: function (type) {
        return 'Error while ' + type + 'ing row';
      },
      unknowenMsg: 'Something went wrong. Please try again later.',
      deleteSuccess: function (ids) {
        return 'Row' + (ids.length === 1 ? ' was' : 's were') + ' deleted successfully';
      },
      deleteError: 'There are no rows to be Deleted.'
    };
    var tableau = {
      ticket: 'Error while loading tableau report. Please contact Dev Team'
    };
    var jupyter = {
      missingScenarioId: 'Scenario id missing in URL',
      noPrimaryAction: 'Please assign a primary action for the Jupyter Notebook instance to open',
      failedToOpen: 'Error in open notebook! Try again',
      failedToClose: 'Error in closing notebook!'
    };
    this.$get = function () {
      return {
        getScenario: function () {
          return scenario;
        },
        getAccess: function () {
          return access;
        },
        getParameter: function () {
          return parameters;
        },
        getSettings: function () {
          return settings;
        },
        getTable: function () {
          return table;
        },
        getTableau: function () {
          return tableau;
        },
        getJupyter: function () {
          return jupyter;
        }
      };
    };
  }
})();
