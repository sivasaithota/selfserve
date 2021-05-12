module.exports = {
	allScenarioData: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": [
			{
				"id": 1,
				"name": "Scenario 1",
				"tag": "Untagged",
				"updated_at": "2016-12-27T06:50:10.828Z"
		},
			{
				"id": 8,
				"name": "Abhiram",
				"tag": "undefined",
				"updated_at": "2016-12-28T04:51:09.320Z"
		}
	]
	},
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
	addScenarioData: {
		"rowCount": 1,
		"rows": [{
			"id": 2,
			"name": "Test",
			"updated_at": "2017-01-11T05:12:49.292Z"
    }],
		"fields": [{
			"name": "id",
			"dataTypeID": 23
    }, {
			"name": "name",
			"dataTypeID": 25
    }, {
			"name": "updated_at",
			"dataTypeID": 1114
    }]
	},
	addScenarioObject: {
		name: "s1",
		tag: "untagged"
	},
	getScenarioData: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": [{
			"id": 1,
			"name": "Scenario 1",
			"notes": "Default"
		}]
	},
	updateScenarioData: {
		"rowCount": 1,
		"rows": [{
			"update_scenario": 1
    }]
	},
	updateScenarioData2: {
		"rowCount": 0,
		"rows": []
	},
	copyScenarioData: {
		"rowCount": 1,
		"rows": [{
			"id": 3,
			"name": "Scenario 1-copy1732",
			"updated_at": "2017-01-11T05:34:04.636Z"
    }],
		"fields": [{
			"name": "id",
			"dataTypeID": 23
    }, {
			"name": "name",
			"dataTypeID": 25
    }, {
			"name": "updated_at",
			"dataTypeID": 1114
    }]
	},
	deleteScenarioData: {
		"rowCount": 1,
		"rows": [{
			"delete_scenario": 1
    }]
	},
	getTablesByTypeData: {
		"rows": [
			{
				"id": 10,
				"order_id": 1,
				"tablename": "plm",
				"displayname": "plm",
				"columnlist": "productid,location,onhandqty,standardcost",
				"columnlistwithtypes": "\"productid\" varchar2(400),\"location\" varchar2(400),\"onhandqty\" varchar2(400),\"standardcost\" varchar2(400)",
				"visible": 1,
				"type": "input",
				"updated_by": "2016-12-27T05:43:00.754Z",
				"unique_key": "''",
				"visiblecolumns": "productid,location,onhandqty,standardcost",
				"select_query": "\"productid\" AS \"productid\",\"location\" AS \"location\",\"onhandqty\" AS \"onhandqty\",\"standardcost\" AS \"standardcost\"",
				"tag": "untagged",
				"file_name": "plmm.csv",
				"status": "Uploaded Successfully",
				"updated_at": "2016-12-28T04:55:01.950Z"
		}
	]
	},
	emptyTablesData: {
		rows: []
	},
	getParametersData: {
		"rows": [
			{
				"id": 2,
				"type": "1",
				"parameter": "TextParam",
				"value": null,
				"displayname": "parameter 1"
		},
			{
				"id": 3,
				"type": "2",
				"parameter": "CalendarParam",
				"value": null,
				"displayname": "parameter 2"
		},
			{
				"id": 4,
				"type": "3",
				"parameter": "CheckboxParam",
				"value": null,
				"displayname": "parameter 3"
		},
			{
				"id": 5,
				"type": "4",
				"parameter": "RadioParam",
				"value": null,
				"displayname": "parameter 4"
		},
			{
				"id": 6,
				"type": "5",
				"parameter": "SwitchParam",
				"value": null,
				"displayname": "parameter 5"
		}
            ]
	},
	pageInfoObject: {
		"rows": [
			{
				id: 1,
				type: "inputs",
				value: "input data",
				visible: 1
      },
			{
				id: 2,
				type: "parameters",
				value: "parameters",
				visible: 1
      },
			{
				id: 3,
				type: "executions",
				value: "executions",
				visible: 1
      },
			{
				id: 4,
				type: "outputs",
				value: "output data",
				visible: 1
      }
    ]
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
	saveParameterData: {
		"rowCount": 1,
		"rows": [{
			"save_parameters": 0
    }]
	},
	parameterObject: [
		{
			"id": 1,
			"type": "1",
			"parameter": "TextParam",
			"value": "Test",
			"displayname": "TextParam",
			"tooltip": ""
  }, {
			"id": 2,
			"type": "2",
			"parameter": "CalendarParam",
			"value": "2016-12-31T18:30:00.000Z",
			"displayname": "CalendarParam",
			"tooltip": ""
  }, {
			"id": 3,
			"type": "3",
			"parameter": ["CheckboxParam"],
			"value": ["CheckboxParam"],
			"displayname": "CheckboxParam",
			"tooltip": ""
  }, {
			"id": 4,
			"type": "4",
			"parameter": ["RadioParam"],
			"value": "RadioParam",
			"displayname": "RadioParam",
			"tooltip": ""
  }, {
			"id": 5,
			"type": "5",
			"parameter": "SwitchParam",
			"value": true,
			"displayname": "SwitchParam",
			"tooltip": ""
  }],
	editGridInput: {
		scenarioId: "8",
		tableName: "plm",
		newRow: {
			location: "W",
			onhandqty: "100",
			oper: "edit",
			productid: "P1",
			standardcost: "3.65",
			jqgrid_id: '2'
		}
	},
	editGridData: {
		"command": "SELECT",
		"rowCount": 1,
		"rows": [
			{
				"edit_grid_data": ""
		}
	],
		"fields": [
			{
				"name": "edit_grid_data",
				"dataTypeID": 2278
		}
	]
	},
	addGridInput: {
		scenarioId: "8",
		tableName: "plm",
		newRow: {
			location: "W",
			onhandqty: "101",
			oper: "add",
			productid: "P2",
			standardcost: "265"
		}
	},
	addGridReturnObject1: {
		"command": "SELECT",
		"rowCount": 1,
		"rows": [
			{
				"add_grid_data": ""
		}
	],
		"fields": [
			{
				"name": "add_grid_data",
				"dataTypeID": 2278
		}
	]
	},
	addGridReturnObject2: {
		"bindParameters": {},
		"rowsAffected": 1,
		"rows": []
	},
	addGridReturnObject3: {
		"bindParameters": {
			"status": 1
		},
		"rowsAffected": 0,
		"rows": []
	},
	deleteGridInput: {
		scenarioID: "8",
		tableName: "plm",
		rowsId: "3,4"
	},
	deleteGridResultObject:{
		"command": "SELECT",
		"rowCount": 1,
		"rows": [
			{
				"delete_grid_data": ""
			}
		],
		"fields": [
			{
				"name": "delete_grid_data",
				"dataTypeID": 2278
			}
		]
	},
	settingObject: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": [
			{
				"id": 1,
				"script": "execute.py",
				"command_to_execute": "python"
      }
    ]
	},
	loadGridQueryParams: {
		"page": "1",
		"limit": "8",
		"sortColumns": "",
		"sort": "asc",
		"filter": null,
		"query": "\"productid\" AS \"productid\",\"location\" AS \"location\",\"onhandqty\" AS \"onhandqty\",\"standardcost\" AS \"standardcost\"",
		"scenarioId": "8",
		"tablename": "plm"
	},
	loadGridReturnObject1: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": [{
			"totalrows": 1
    }]
	},
	loadGridReturnObject2: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": [{
			"jqgrid_id": 2,
			"productid": "P1",
			"location": "W",
			"onhandqty": "100",
			"standardcost": "3.65"
    }]
	},
	loadGridReturnObject3: {
		"rows": [{
			"jqgrid_id": 2,
			"productid": "P1",
			"location": "W",
			"onhandqty": "100",
			"standardcost": "3.65"
    }],
		"total": 1,
		"records": 1,
		"page": "1"
	},
	downloadGridQueryParams: {
		"scenarioId": 1,
		"tablename": "BOM",
		"type": "input"
	},
	downloadGridReturnObject1: {
		"rowCount": 1,
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": []
	},
	downloadGridReturnObject2: "/downloads/scenario_1_BOM.csv",
	updateInputReturnObject: {
		"rows": [{
			"file_name": "bom.csv",
			"status": "Uploaded successfully",
			"updated_at": "2017-01-31 09:27:26.866544+02",
			"updated_by": "demo@opexanalytics.com"
		}]
	},
	updateInputQueryParams1: {
		"status": "Uploaded successfully",
		"tablename": "bom"
	},
	updateInputQueryParams2: {
		"actionDesc": 'refresh',
		"username": 'demo@opexanalytics.com'
	},
	updateTablesReturnObject: {
		"rows": [{
			"file_name": "bom.csv",
			"status": "Uploaded successfully",
			"updated_at": "2017-01-31 09:27:26.866544+02",
			"updated_by": "demo@opexanalytics.com"
		}]
	}
};
