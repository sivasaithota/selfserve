module.exports = {

  httpCodes: {
    success: 200,
    successfulCreate: 201,
    redirect: 302,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    inActive: 420,
    internalServerError: 500,
    notImplemented: 501
  },
  httpCodeArr: [200, 201, 302, 400, 401, 403, 404, 409, 420, 500, 501],

  authentication: {
    userNotFound: 'Username does not exist. You are being logged out. Please ask the app owner to share the app.'
  },

  application: {
    appNotFound: 'Application does not exist',
    status: {
      inactive: 'INACTIVE',
      active: 'ACTIVE',
    },
    deactivated: 'Application deactivated',
  },

  tag: {
    tagObjectEmpty: 'Tag details not found',
    tagNameNotFound: 'Tag Name cannot be empty',
    updateSuccess: 'Tag saved successfully'
  },

  user: {
    addUserError: 'Error adding user.',
    createUserError: 'Error creating user.',
    deleteUserError: 'Error while deleting user. Please try again.',
    deleteSuccess: 'User deleted successfully',
    userObjectNotFound: 'User object cannot be empty',
    usernameNotFound: 'Username cannot be empty',
    invalidEmail: 'Email is not valid',
    passwordNotFound: 'Password cannot be empty',
    invalidRole: 'Invalid role',
    userAdded: 'User added successfully',
    userCreated: 'User created successfully',
    userNotFound: 'User not found',
    updateSuccess: 'User updated successfully',
    accessObjectNotFound: 'Scenario Access object cannot be empty',
    scenarioIdNotFound: 'Scenario Ids for Access not found',
    tableIdNotFound: 'Table Ids for Access not found',
    tableauIdNotFound: 'Tableau report Ids for Access not found',
    powerIdNotFound: 'PowerBI report Ids for Access not found',
    getUserError: 'Error while fetching user',
    invalidResetPass: 'Your Password must be different from your previous password by at least 4 characters',
    loginAccess: 'You do not have access',
    adminRoleRestriction: 'Admin is not able to create Consultant role',
    moderatorRoleRestriction: 'Admin is not able to create Consultant or Admin role',
    invalidUsername: 'Username is not valid',
    userDetailsNotFound: 'User details not found with the user name. You are being logged out.',
    errorUpdateUser: 'Error while updating user. Please try again'
  },
  userManagement: {
    successGetUrl: 'Successfully retreived URL',
    serverError: 'Cannot connect to user-management'
  },
  scenario: {
    scenarioObjectEmpty: 'Scenario details not found',
    scenarioNameNotFound: 'Scenario name not found',
    tableNameNotFound: 'Table name not found',
    errorCreatingScenario: 'Error while creating scenario',
    deleteSuccess: 'Scenario deleted successfully',
    scenarioNotFound: 'Scenario not found',
    updateSuccess: '%s updated successfully',
    copyScenarioError: 'Error while copying scenario. Please try again',
    deleteScenarioError: 'Error while deleting scenario. Please try again',
    scenarioIdNotFound: 'Scenario ID not found',
    paramIdNotFound: 'Parameter id not found',
    paramNameNotFound: 'Parameter name not found',
    paramDisplayNameNotFound: 'Parameter display name not found',
    paramNotFound: 'Parameter are not found or in wrong format',
    parameterSuccess: 'Parameters saved successfully',
    tablenameNotFound: 'Table name not found',
    queryParamNotFound: 'Query Parameter to download grid data not found',
    uploadObjectNotFound: 'Upload object not found',
    dataTemplateNotFound: 'Data template not found',
    fileNotFound: 'File to upload data not found',
    uploadDataError: 'Error while uploading data. Please try again',
    typeNotFound: 'Type not found',
    invalidExtension: 'Upload data file is not valid',
    scriptNotFound: 'Script to execute not found',
    executionError: 'Error while execution. Please see logs',
    getPdfError: 'PDF not found',
    getHtmlError: 'HTML is not generated yet',
    executionObjectNotFound: 'Execution info and application id not found.',
    jobSubmissionError: 'Error while submitting jobs. Please try again.',
    updateExecutionQueryNotFound: 'Query parameter for updating execution not found.',
    updateExecutionTypeNotFound: 'Type for updating execution not found.',
    saveParameterObjectNotFound: 'Parameter object to save not found',
    paramTypeNotFound: 'Parameter type not found',
    scenarioLockError: 'Error while checking scenario access.Please try again.',
    lockRemoveError: 'Error removing lock.',
    queryStringNotFound: 'Query string not found',
    gridDataNotFound: 'Add grid data not found',
    gridIdNotFound: 'Grid Id not found',
    downloadTables: 'Error while downloading data. Please try again',
    invalidType: 'Invalid type passed.',
    dataTableNameNotFound: 'Table name not found',
    invalidFileSize: 'File size for XLSX/XLS should not execeed 40MB',
    invalidFileExtension: 'Invalid file extension',
    visibleColumnsNotFound: 'Visible columns for this table not found. Please try again',
    editGridQueryObjectNotFound: 'Query object to load grid column values not found',
    columnNameNotFound: 'Column name not found to load values',
    scenarioTemplateNotFound: 'Scenario template not specified.',
    noRowsToEdit: 'No rows to edit specified.',
    noRowDataToEditPassed: 'No row data to edit passed.',
    columnNotFound: 'Column header not found/ or file is not valid',
    emptyTable: 'No data available.',
    scenarioNameExists: 'A scenario by this name already exists. Please type a different name.',
    scenarioNameNotValidPattern: 'Special characters are not permitted for scenario names. Valid characters include A-z, 0-9, ".", "_" and "-".',
    scenarioNameNotValidLength: 'Maximum characters upto 80',
    tagNameNotValidPattern: 'Special characters are not permitted for tag names. Valid characters include A-z, 0-9, ".", "_" and "-".',
    tagNameNotValidLength: 'Tag Name cannot exceed 40 characters.',
    deletedSuccess: 'Scenario deleted successfully',
    tableNotFound: 'Table details not found',
    gridEditSuccess: 'Grid edited successfully',
    errorUpload: 'Error uploading file, either the file name of table name does not match / table does not exist',
    uploadTableColumnMismatch: 'Sorry, the columns in the uploaded file do not match the current table. ' +
      'Please check for any missing or incorrect column names.',
    enterCorrectDataType: 'Please enter a value with the correct datatype',
    nofilesInZip: 'No files found in the zip to upload',
    refreshSuccess: 'Master tables refreshed successfully',
    masterDropSuccess: 'Master tables dropped successfully'
  },

  execution: {
    setDefaultScript: 'Entry point for the execution is not set. Please assign a script for execution from the App Settings',
    executionTypeNotFound: 'Execution type not found/invalid',
    getExecutionError: 'Error while getting data for execution',
    appDetailsNotFound: 'Application name and id not found',
    executionDetailsNotFound: 'Execution details not found. Please update details for execution.',
    scriptNotFound: 'Script for execution is not found',
    jobKilled: 'Script execution stopped',
    errorJobKill: 'Error while stopping executing job',
    proccessIdError: 'Proccess not found',
    errorInStopExecution: 'Error while stopping execution. Data corruption error. Please contact Administrator',
    jobDataNotFound: 'Job Data not found/ execution not running / already completed ',
    invalidSegment: 'Execution segment not found or invalid',
    executionIdNotFound: 'Execution ID not found or invalid',
    executionSettingNotFound: 'Execution settings not found',
    executionCommandNotFound: 'Execution command not found or invalid',
    insertError: 'Error while inserting execution settings. Please try again',
    updateError: 'Error while updating execution settings. Please try again',
    deleteError: 'Error while deleting execution settings. Please try again',
    scenarioIdNotFound: 'Scenario ID not found',
    deleteSuccess: 'Execution setting deleted successfully',
    deleteNotFound: 'Execution setting to delete not found',
    actionDescriptionNotFound: 'Action Description Not found',
    scenarioSpecificNotValid: 'Scenario specific value should be boolean',
    scenarioTemplateIdNotFound: 'Scenario template id not found/invalid',
    actionNotFound: 'Action details not found / invalid for the id',
    fileNotFound: 'The requested file %s is not available for download',
    uploadActionNotFound: 'Upload Action object not found',
    uploadFileNotFound: 'File to Upload action not found',
    uploadSuccess: 'Upload action successful',
    jobNotFound: 'Job details not found',
    actionDescriptionOccupied: 'Action description is already occupied'
  },

  accessManager: {
    noAccess: 'Access restricted.'
  },

  setting: {
    idNotFound: 'Setting id not found',
    updateSuccess: 'Settings updated successfully',
    updateError: 'Error while updating settings',
    fileNotFound: 'File to upload not found',
    uploadSuccess: 'File uploaded successfully',
    uploadError: 'Error while uploading file. Please try again',
    emptyTableauError: 'Tableau setting not found to add.',
    invalidType: 'Type can either be input or output',
    scriptNotFound: 'Script not found for the given Id',
    deleteScriptError: 'Error while deleting script. Please try again',
    deleteSettingError: 'Error while deleting scenario segment. Please try again',
    errorUpdatingSetting: 'Error while updating setting. Please try again',
    settingObjectNotFound: 'Setting object not found',
    settingKeyNotFound: 'Setting key not found',
    settingValueNotFound: 'Setting value not found',
    pageNotFound: 'Help Page not found',
    scriptDirNotFound: 'Script directory not found',
    details: 'details',
  },

  multiPartParser: {
    parseError: 'Error parsing data'
  },

  scenarioLocking: {
    accessError: 'Currently the scenario is locked by user - ',
    accessErrorСontin: '. Please try accessing after some time.',
    releaseLockSuccess: 'Lock released successfully',
    lockEnabled: 'Lock turned on successfully',
    lockDisabled: 'Lock turned off successfully',
    lockObjectNotFound: 'Lock object not found',
    lockObjectInvalid: 'Lock object invalid',
    scenarioIdNotFound: 'Scenario Id not found to lock',
    scenarioLockSuccess: 'Scenario locked successfully',
    errorLockScenario: 'Error while locking scenario, please try again or contact Administrator',
    deleteLockSuccess: 'Scenario lock removed',
    errorRemoveLock: 'Error while removing scenario lock, please try again or contact Administrator',
    errorVerifyLock: 'Error while verifying lock, please try again or contact Administrator',
    scenarioLocked: 'Scenario is locked by user - %s'
  },

  scenarioArchiving: {
    archiveObjectNotFound: 'Lock object not found',
    scenarioIdNotFound: 'Scenario Id not found to archive',
    errorArchivingScenario: 'Error while archiving scenario, please try again or contact Administrator',
    scenarioArchived: '%s is archived.'
  },

  tableau: {
    tablueExtractNotFound: 'Tableau Extract JSON file not found',
    tableauExtractObjectNotFound: 'Tableau Extract file does not contain Workbook/Project/ExtractAPI/authKey',
    extractTypeNotFound: 'Tableau Extract Type not found or invalid',
    signinError: 'Error while signing in to the tableau server. Please try again or contact Administrator',
    getWorkbookError: 'Error while getting workbooks from the tableau server',
    tableauObjectEmpty: 'Tableau object is empty or not found',
    urlNotFound: 'Tableau url not found or invalid',
    labelNotFound: 'Label not found',
    deleteTableauError: 'Unable to delete tableau. Please try again.',
    editTableauError: 'Tableau setting not found to edit.',
    projectWorkbookNotFound: 'Tableau Project/workbook combination not found',
    addTableauError: 'Error while adding new tableau',
    settingObjectNotFound: 'Tableau Settings object not found',
    invalidSetting: 'Tableau setting object /value are invalid',
    settingSaveError: 'Error while saving tableau settings',
    usernotFound: 'Tableau user not found for generating trusted ticket',
    errorGeneratingTicket: 'Error while generating ticket for trusted authentication',
    noExtractWorkbookFound: 'No Project/Workbooks are configured to run the tableau extract',
    noExtractRun: 'Cannot run Tableau extract for execution Cancelled/completed with Success/Failure or Invalid Job',
    runTableauExtract: 'Running Tableau Extracts',
    typeNotFound: 'Tableau type not found/invalid',
    deleteSuccess: 'Tableau deleted successfully',
    updateSuccess: 'Tableau updated successfully',
    queryObjectNotFound: 'Query object not found',
    tableauExtractSettingNotFound: 'Tableau extract setting object not found',
    runExtractInvalid: 'Tableau Run Extract status is invalid/not found',
    tableauExtractSettingUpdateSuccess: 'Successfully updated tableau extract Setting',
    errorTableauExtractSetting: 'Error while updating tableau extract setting, please try again or contact Administrator',
    invalidType: 'Tableau Extract type is not valid',
    invalidSegment: 'Tableau Extract segment is not valid',
    typeIdNotFound: 'Type id not found',
    reportsUserNotFound: 'Database user details not found',
    prepareWorkbookError: 'Failed to prepare workbook template',
    publishWorkbookError: 'Failed to publish workbook',
    siteNotFound: 'Configured tableau site not found.',
    projectNotFound: 'Configured tableau project not found.',
    serverNotFound: 'Invalid tableau server configured'
  },

  bomVisualization: {
    bomVisNotFound: 'BOM Visualization JSON file not found',
    bomVisObjectNotFound: 'BOM Visualization file does not contain current table',
    bomVisObjectWrong: 'The version of BOMConfig.JSON is not compatible. Please update the configuration.'
  },

  template: {
    templateIdNotFound: 'Template id not found',
    templateIdScenarioIdNotFound: 'Template ID/Scenario ID not found'
  },

  health: {
    "success": "App is healthy and running successfully."
  },

  notebooks: {
    openNotebookError: 'Error opening Jupyter Notebook.',
    removeNotebookError: 'Error removing Jupyter Notebook.',
    getExecutionScriptCommand: 'Error getting the execution script command.'
  },

  powerbi: {
    addReportError: 'Error adding powerbi report',
    getReportFromPowerbiError: 'Error fetching report details from powerbi',
    getEmbedTokenError: 'Failed to get embed token. Check if the report url is valid.',
    getReportsError: 'Error fetching reports',
    requestBodyEmpty: 'Request body is empty',
    reportUrlNotFound: 'Report url not found',
    reportTypeNotFound: 'Report type not found or invalid',
    labelNotFound: 'Tab name not found',
    deleteReportSuccess: 'Report deleted successfully',
    deleteReportError: 'Error deleting report',
    editReportError: 'Error editing report',
    editReportSuccess: 'Report edited successfully',
    saveImportSettingsSuccess: 'Import settings saved successfully',
    saveImportSettinssError: 'Error saving import settings',
    getImportSettingsError: 'Error fetching import settings',
    scenarioTemplateIdNotFound: 'Scenario template id not found',
    runImportNotValid: 'Run import setting not valid',
    invalidUrl: 'Invalid report/dashboard url',
    refreshAccepted: 'Refresh request accepted by powerbi service',
    refreshRejected: 'Refresh request rejected by powerbi service',
    runningRefreshStatus: 'Populating reports',
    refreshDoneStatus: 'Published reports',
    refreshFailedStatus: 'Publish report failed',
    refreshFailedMessage: 'Failed to publish powerbi reports',
    refreshDoneMessage: 'Refreshed powerbi reports',
    accessTokenError: 'Failed to get access token from Azure',
    invalidCredentialsError: 'Failed to publish reports. Ensure that Gateway is enabled in powerbi and dataset credentials are properly configured in gateway.'
  },
  dbConstants: {
    databases: {
      enframe: 'enframe',
      fluentD: 'fluentD',
    },
    collections: {
      settings: 'settings',
      applications: 'applications',
      actions: 'actions',
    },
  },
  environment: {
    types: {
      internal: 'internal',
      all: 'all',
    },
  },
  restrictedAccessRoles: [
    'BusinessUser',
    'Analyst_ReadOnly',
    'Analyst_ReadWrite',
    'Analyst_ReadEdit',
    'Analyst_Execute',
    'Admin',
    'Moderator'
  ],
  adminUsers: [
    'Admin',
    'Architect'
  ],
  roles: {
    consultant: 'Consultant',
  },
  appDevEditRoles: ['Consultant','Admin','Moderator'],
  consultantScopes: [
    'create',
    'read',
    'update',
    'delete'
  ],
  defaultScopes: [
    'read'
  ]
};
