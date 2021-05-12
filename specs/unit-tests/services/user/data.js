module.exports = {
  userObject: {
    username: 'testUser@opexanalytics.com',
    email: 'testUser@opexanalytics.com',
    password: 'test1234',
    role: 'Consultant'
  },
  dbUpdateSuccess: {
    "rowCount": 1,
    "rows": [],
    "fields": null
  },
  dbUpdateFailure: {
    "rowCount": 0,
    "rows": [],
    "fields": null
  },
  mockData1: {
    "rowCount": 1,
    "rows": [{
      "id": 1,
      "username": "testUser@opexanalytics.com",
      "email": "testUser@opexanalytics.com",
      "role": "Consultant"
    }],
    "fields": [{
      "name": "id",
      "dataTypeID": 23
    }, {
      "name": "username",
      "dataTypeID": 1043
    }, {
      "name": "email",
      "dataTypeID": 1043
    }, {
      "name": "role",
      "dataTypeID": 1043
    }]
  },
  invalidUserObject: {
    username: 'testUser@opexanalytics.com',
    email: 'testUser@opexanalytics.com',
    password: 'test1234'
  },
  getAllUserObjectData: {
    "rows": [
      {
        "id": 1,
        "username": "demo@opexanalytics.com",
        "email": "demo@opexanalytics.com",
        "role": "Consultant",
        "scenario_id": null
		},
      {
        "id": 4,
        "username": "demo2",
        "email": "demo1@demo.com",
        "role": "Consultant",
        "scenario_id": null
		},
      {
        "id": 2,
        "username": "demo1",
        "email": "demo1@opexanalytics.com",
        "role": "Consultant",
        "scenario_id": null
		}
	]
  },
  getAllUserExpectedResult: [
    {
      "id": 1,
      "username": "demo@opexanalytics.com",
      "email": "demo@opexanalytics.com",
      "role": "Consultant",
      "scenario_id": []
  },
    {
      "id": 2,
      "username": "demo1",
      "email": "demo1@opexanalytics.com",
      "role": "Consultant",
      "scenario_id": []
  },
    {
      "id": 4,
      "username": "demo2",
      "email": "demo1@demo.com",
      "role": "Consultant",
      "scenario_id": []
  }
],
  getUserMockData: {
    "bindParameters": {},
    "rows": [
      {
        "id": 2,
        "username": "demo1",
        "email": "demo1@opexanalytics.com",
        "role": "Consultant"
		}
	]
  },
  getUserResult: {
    id: 2,
    username: 'demo1',
    email: 'demo1@opexanalytics.com',
    role: 'Consultant'
  },
  rolesMockData: {
    "bindParameters": {},
    "rows": [
      {
        "role": "Consultant",
        "function": "SC_Create",
        "applicable": 1,
        "category": "Scenario",
        "rolename": "Consultant"
		},
      {
        "role": "Analyst_ReadWrite",
        "function": "SC_Create",
        "applicable": 1,
        "category": "Scenario",
        "rolename": "Analyst - Read Write"
		}
			]
  },
  scenarioAccessData: {
    "bindParameters": {},
    "rows": [
      {
        "id": 28,
        "user_id": 29,
        "scenario_id": 32,
        "created_at": "2016-12-28T05:20:37.575Z",
        "updated_at": "2016-12-28T05:20:37.575Z"
			},
      {
        "id": 29,
        "user_id": 29,
        "scenario_id": 3,
        "created_at": "2016-12-28T05:20:37.575Z",
        "updated_at": "2016-12-28T05:20:37.575Z"
			},
      {
        "id": 30,
        "user_id": 29,
        "scenario_id": 33,
        "created_at": "2016-12-28T05:20:37.575Z",
        "updated_at": "2016-12-28T05:20:37.575Z"
			}
		]
  },
  scenarioAccessEmptyData: {
    "bindParameters": {
      "cursor": []
    },
    "rows": []
  }
};
