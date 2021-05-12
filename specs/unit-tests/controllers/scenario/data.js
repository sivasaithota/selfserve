module.exports = {
  scenarioData: {
    "rows": [
      {
        "id": 1,
        "name": "Scenario 1",
        "tag": "Untagged",
        "updated_at": "2016-12-27T06:50:10.828Z"
		}
    ]
  },
  addScenarioObject: {
    "body": {
      name: "Scenario 1"
    },
    "user": {
      username: "demo@opexanalytics.com"
    }
  },
  addScenarioObjectWithoutName: {
    "body": {
      name: ""
    }
  },
  updateScenarioObject: {
    "params": {
      scenarioId: 1
    },
    "body": {
      name: "Scenario 1"
    },
    "user": {
      username: "demo@opexanalytics.com"
    }
  },
  invalidScenarioObject: {
    body: {
      name: ''
    }
  },
  getParametersObject: {
    "query": {
      scenarioId: 1
    }
  },
  getParametersObjectWithoutScenarioId: {
    "query": {
      scenarioId: ''
    }
  },
  getParametersData: {
    "rows": [{
      "id": 2,
      "type": "1",
      "parameter": "TextParam",
      "value": null,
      "displayname": "parameter 1"
		}, {
      "id": 3,
      "type": "2",
      "parameter": "CalendarParam",
      "value": null,
      "displayname": "parameter 2"
		}, {
      "id": 4,
      "type": "3",
      "parameter": "CheckboxParam",
      "value": null,
      "displayname": "parameter 3"
		}, {
      "id": 5,
      "type": "4",
      "parameter": "RadioParam",
      "value": null,
      "displayname": "parameter 4"
		}, {
      "id": 6,
      "type": "5",
      "parameter": "SwitchParam",
      "value": null,
      "displayname": "parameter 5"
		}]
  },
  saveParameterObject: {
    body: {
      scenarioId: 1,
      parameters: [{
        "id": 2,
        "type": "1",
        "parameter": "TextParam",
        "value": "test",
        "displayname": "parameter 1"
	}]
    }
  },
  invalidParameterObject: {
    body: {
      scenarioId: 1
    }
  },
  invalidParameterObject2: {
    body: {
      scenarioId: 1,
      parameters: [{
        parameter: 'p1'
			}]
    }
  },
  invalidParameterObject3: {
    body: {
      scenarioId: 1,
      parameters: [{
        id: 'p1'
			}]
    }
  },
  invalidParameterObject4: {
    body: {
      scenarioId: 1,
      parameters: [{
        id: '1',
        type: '1'
			}]
    }
  },
  invalidParameterObject5: {
    body: {
      scenarioId: 1,
      parameters: [{
        id: '1',
        type: '1',
        parameter: 'p1'
			}]
    }
  }
};