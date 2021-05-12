module.exports = {
  getSettingsObject: {
    "rows": [
      {
        "id": 2,
        "command_to_execute": "python3",
        "script_id": 4,
        "type": "input_refresh",
        "action_desc": "Refresh",
        "segment": "input"
      }
    ]
  },
  saveSettingData: {
    "rowCount": 1,
    "rows": [],
    "fields": null
  },
  saveSettingData1: {
    "rowCount": 0,
    "rows": [],
    "fields": null
  },
  saveSettingObject: [{
    "id": 1,
    "command_to_execute": "python3",
    "script_id": 4,
    "type": "scripts"
  }],
  saveSettingObject2: [
    {
      "id": 1,
      "command_to_execute": "python3",
      "script_id": 4,
      "type": "scripts"
    }, {
      "id": 2,
      "command_to_execute": "python3",
      "script_id": 4,
      "type": "input_refresh",
      "action_desc": "Refresh",
      "segment": "input"
    }
  ],
  saveSettingObject3: [
    {
      "id": 1,
      "command_to_execute": "python3",
      "script_id": 4,
      "type": "scripts"
    }, {
      "id": 2,
      "command_to_execute": "python3",
      "script_id": 4,
      "type": "input_refresh",
      "action_desc": "Refresh",
      "segment": "input"
    }, {
      "id": 3,
      "command_to_execute": "python3",
      "script_id": 4,
      "type": "input_validation",
      "action_desc": "validate",
      "segment": "input"
    }
  ],
  getBothOptionalSettingsObject: {
    "rows": [
      {
        action_desc: "Refresh",
        commandToExecute: "python3",
        id: 1,
        scriptToExecute: "execute.py",
        segment: "input",
        type: "input_refresh"
      },
      {
        action_desc: "validate",
        commandToExecute: "python3",
        id: 2,
        scriptToExecute: "execute.py",
        segment: "input",
        type: "input_validation"
      }
    ]
  },
  getRefreshOptionalSettingsObject: {
    "rows": [
      {
        action_desc: "Refresh",
        commandToExecute: "python3",
        id: 1,
        scriptToExecute: "execute.py",
        segment: "input",
        type: "input_refresh"
      }
    ]
  },
  getValidateOptionalSettingsObject: {
    "rows": [
      {
        action_desc: "validate",
        commandToExecute: "python3",
        id: 2,
        scriptToExecute: "execute.py",
        segment: "input",
        type: "input_validation"
      }
    ]
  },
  getCommandsObject: {
    "rows": [
      {
        command: "python3"
      },
      {
        command: "Rscript"
      },
      {
        command: "sh"
      },
      {
        command: "python"
      }
    ]
  },
  getScriptsObject: {
    "rows": [
      {
        "id": 1,
        "file_name": "connector.py"
      },
      {
        "id": 2,
        "file_name": "app_utils.py"
      },
      {
        "id": 3,
        "file_name": "calculator.py"
      },
      {
        "id": 4,
        "file_name": "execute.py"
      }
    ]
  },
  uploadObject: {
    "id": "1",
    "file": {
      "size": 20417,
      "path": "/var/folders/r9/kvqlfmmn0f9318mjkwd4hsk40000gn/T/upload_d507be2553f2d5a183c1d719ab4da179.json",
      "name": "dhc_backup_1.3.5_upgrade.json",
      "type": "application/json",
      "mtime": "2016-12-28T17:56:10.723Z"
    }
  },
  getAppNameReturnObject: {
    rowCount: 4,
    rows: [{
        key: 'appId',
        value: '1',
        data_type: 'integer'
      },
      {
        key: 'appName',
        value: 'ROTA',
        data_type: 'text'
      },
      {
        key: 'appId',
        value: '1',
        data_type: 'integer'
      },
      {
        key: 'appName',
        value: 'ROTA',
        data_type: 'text'
      }]
  },
  getAppNameObject: {
    appId: 1,
    appName: 'ROTA'
  },
  getHtmlReturnObject: {
    rowCount: 2,
    rows: [{
        key: 'html',
        value: 'false',
        data_type: 'boolean'
      },
      {
        key: 'html',
        value: 'false',
        data_type: 'boolean'
      }]
  },
  getHtmlObject: {
    html: false
  },
  getTableauInputObject: {
    "rows": [
      {
        id: 26,
        label: "untagged",
        type: "input",
        url: "test.com"
      }
    ]
  },
  getTableauOutputObject: {
    "rows": [
      {
        id: 27,
        label: "untagged",
        type: "output",
        url: "test.com"
      }
    ]
  },
  getTableauInOutObject: {
    "rows": [
      {
        id: 26,
        label: "untagged",
        type: "input",
        url: "test.com"
      },
      {
        id: 27,
        label: "untagged",
        type: "output",
        url: "test.com"
      }
    ]
  },
  getNoObject: {
    "rows": []
  },
  getSettingData: {
    "bindParameters": {},
    "rowsAffected": 0,
    "rows": [
      {
        "id": 1,
        "script_list": "execute.py"
		}
	]
  },
  validEditTableauObject: {
    id: 1,
    url: 'testtableau.com',
    label: 'untagged'
  },
  invalidEditTableauObject: {
    url: 'testtableau.com',
    label: 'untagged'
  },
  addTableauReturnObject: {
    "command": "INSERT",
    "rowCount": 1,
    "rows": [{
      "id": 1
    }],
    "fields": [{
      "name": "id",
      "dataTypeID": 23
    }]
  },
  updateUploadSettingsObject: {
    "rowCount": 1,
    "rows": [{
      "update_setting": ""
    }],
  },
  updateDeleteSettingsObject: {
    "rowCount": 1,
    "rows": [{
      "delete_setting": ""
    }],
  }
};
