module.exports = {
  getSettingObject: {
    command_to_execute: "python3",
    id: 1,
    script: "execute.py",
    script_list: "execute.py"
  },
  validSaveSettingObject: {
    "body": {
      "product": {
        "id": 1,
        "script": "execute.py",
        "command_to_execute": "Rscript",
        "script_list": "execute.py"
      }
    }
  },
  invalidSaveSettingObject: {
    "body": {
      "product": {
        "script": "execute.py",
        "command_to_execute": "Rscript",
        "script_list": "execute.py"
      }
    }
  },
  uploadObject: {
    "body": {
      "file": {
        "size": 20417,
        "path": "/var/folders/r9/kvqlfmmn0f9318mjkwd4hsk40000gn/T/upload_d507be2553f2d5a183c1d719ab4da179.json",
        "name": "dhc_backup_1.3.5_upgrade.json",
        "type": "application/json",
        "mtime": "2016-12-28T17:56:10.723Z"
      }
    },
    "user":{
      "username":"demo@opexanalytics.com"
    }
  },
  uploadObjectWithoutFile: {
    "body": {}
  }
};