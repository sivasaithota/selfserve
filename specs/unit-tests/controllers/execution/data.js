module.exports = {
  executionData: {
    "rows": [{
      "_id": "58bec4e184398b000d728b9b",
      "appId": 15,
      "appName": "CPG_Inventory_Calculator",
      "command_to_execute": "python3",
      "file_name": "execute.py",
      "jobId": "58bec4e184398b000d728b9b",
      "scenarioId": "1",
      "segment": "",
      "status": "Queued",
      "time": "2017-03-07T14:34:09.177Z",
      "type": "scripts",
      "username": "demo@opexanalytics.com"
    }]
  },
  executionObject: {
    "params": {
      "scenarioId": 1
    },
    "query": {
      "type": "scripts"
    },
    "user": {
      "username": "demo@opexanalytics.com"
    }
  },
  historyObject: {
    "params": {
      "scenarioId": 1
    },
    "query": {
      "type": "scripts",
      "limit": 1
    }
  },
  historyData: {
    "rows": [{
      "_id": "58b5471f387efa000dbcaa31",
      "appId": 15,
      "appName": "CPG_Inventory_Calculator",
      "command_to_execute": "python3",
      "endTime": "2017-02-28T09:47:17.548Z",
      "executionTime": 6,
      "file_name": "execute.py",
      "jobId": "58b5471f387efa000dbcaa31",
      "scenarioId": "1",
      "segment": "",
      "startTime": "2017-02-28T09:47:11.386Z",
      "status": "Failure",
      "time": "2017-02-28T09:47:11.209Z",
      "type": "scripts",
      "username": "demo@opexanalytics.com"
    }, {
      "_id": "58ad91b11b21ea000d069325",
      "appId": 15,
      "appName": "CPG_Inventory_Calculator",
      "command_to_execute": "python3",
      "endTime": "2017-02-22T13:27:24.360Z",
      "executionTime": 11,
      "file_name": "execute.py",
      "jobId": "58ad91b11b21ea000d069325",
      "scenarioId": "1",
      "segment": "",
      "startTime": "2017-02-22T13:27:13.433Z",
      "status": "Success",
      "time": "2017-02-22T13:27:13.265Z",
      "type": "scripts",
      "username": "demo@opexanalytics.com"
    }]
  },
  historyJobObject: {
    "params": {
      "scenarioId": 1,
      "jobId": "58b5471f387efa000dbcaa31"
    }
  },
  historyJobData: {
    "rows": [{
      "_id": "58bec4e184398b000d728b9b",
      "appId": 15,
      "appName": "CPG_Inventory_Calculator",
      "command_to_execute": "python3",
      "file_name": "execute.py",
      "jobId": "58bec4e184398b000d728b9b",
      "scenarioId": "1",
      "segment": "",
      "status": "Running",
      "time": "2017-03-07T14:34:09.177Z",
      "type": "scripts",
      "username": "demo@opexanalytics.com"
    }]
  },
  logsObject: {
    "params": {
      "jobId": "58b5471f387efa000dbcaa31"
    },
    "query": {
      "lastLogId": "58bec4e184398b000d728b9b"
    }
  },
  logsData: {
    "rows": [{
      "_id": "58ad91b11b21ea000d069325",
      "appId": 15,
      "appName": "CPG_Inventory_Calculator",
      "command_to_execute": "python3",
      "endTime": "2017-02-22T13:27:24.360Z",
      "executionTime": 11,
      "file_name": "execute.py",
      "jobId": "58ad91b11b21ea000d069325",
      "scenarioId": "1",
      "segment": "",
      "startTime": "2017-02-22T13:27:13.433Z",
      "status": "Success",
      "time": "2017-02-22T13:27:13.265Z",
      "type": "scripts",
      "username": "demo@opexanalytics.com",
      "logs": []
    }]
  }
};