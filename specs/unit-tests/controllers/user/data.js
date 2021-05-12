module.exports = {
  addUserObject: {
    "body": {
      username: 'testUser@opexanalytics.com',
      email: 'testUser@opexanalytics.com',
      password: 'test1234',
      role: 'Consultant'
    },
    "user": {
      username: "demo@opexanalytics.com"
    }
  },
  addUserObjectWithoutUsername: {
    "body": {
      email: 'testUser@opexanalytics.com',
      password: 'test1234',
      role: 'Consultant'
    }
  },
  addUserObjectWithoutEmail: {
    "body": {
      username: 'testUser@opexanalytics.com',
      password: 'test1234',
      role: 'Consultant'

    }
  },
  addUserObjectWithInvalidEmail: {
    "body": {
      username: 'testUser@opexanalytics.com',
      email: 'testUseropexanalytics.com',
      password: 'test1234',
      role: 'Consultant'
    }
  },
  addUserObjectWithoutPassword: {
    "body": {
      username: 'testUser@opexanalytics.com',
      email: 'testUser@opexanalytics.com',
      role: 'Consultant'
    }
  },
  addUserObjectWithoutRole: {
    "body": {
      username: 'testUser@opexanalytics.com',
      email: 'testUser@opexanalytics.com',
      password: 'test1234',
    }
  },
  updateUserObject: {
    "params": {
      userId: 1
    },
    "user": {
      "username": "testUser@opexanalytics.com",
    },
    "body": {
      "username": "testUser@opexanalytics.com",
      "password": "test12345",
      "email": "testchanged@tester.com"
    }
  },
  scenarioAccessObject: {
    "params": {
      userId: 1
    },
    "body": {
      scenarioIds: [1, 8]
    }
  },
  scenarioAccessObjectWithoutScenarioIds: {
    "params": {
      userId: 1
    },
    "body": {
      scenarioIds: []
    }
  },
  scenarioAccessData: {
    "bindParameters": {
      "cursor": [
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
    "rows": []
  }
};