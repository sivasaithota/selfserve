module.exports = {
	userObject: {
		password: "T2eD8HnOz07",
		username: "demo@opexanalytics.com"
	},
	invalidUserObject: {
		password: "T2eD8HnOz07",
	},
	userData: {
		"command": "SELECT",
		"rowCount": 1,
		"rows": [{
			"id": 1,
			"username": "demo@opexanalytics.com",
			"admin": true,
			"companyName": "Opex",
			"home_page": "/WSProjects",
			"role": "Consultant",
			"scenarios": "",
			"roleFunctions": ["table_delete", "table_edit", "table_add", "app_settings", "home_page", "SC_Copy", "wf_VwTableau", "wf_DownloadOutput", "wf_ParamExecute", "wf_DataUpload", "SC_View", "SC_Delete", "SC_Create"],
			"roleFunctionValues": [true, true, true, true, false, true, true, true, true, true, true, true, true]
    }],
	},
	invalidUserData: {
		"bindParameters": {},
		"rowsAffected": 0,
		"rows": []
	},
	successLoginReturnObject: {
		"token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInB3ZCI6IjQ5MTJiYTc5ZmRjZDgxODE0ZGE3MDdiM2UxNTAzZjcxIiwiaWF0IjoxNDgzMDk2NTIyLCJleHAiOjE0ODMxMDAxMjJ9.DkKl500E1BVHr23YkcaEAjJjfQz9dA70qvW9YF9A9vTEgzryaU5Xsc7YxRWgyh_0t5ffMQB4fT_O-maZDhclAg",
		user: {
			"id": 1,
			"username": "demo@opexanalytics.com",
			"admin": true,
			"companyName": "Opex",
			"home_page": "/WSProjects",
			"role": "Consultant",
			"scenarios": "",
			"functions": {
				"table_delete": true,
				"table_edit": true,
				"table_add": true,
				"app_settings": true,
				"home_page": false,
				"SC_Copy": true,
				"wf_VwTableau": true,
				"wf_DownloadOutput": true,
				"wf_ParamExecute": true,
				"wf_DataUpload": true,
				"SC_View": true,
				"SC_Delete": true,
				"SC_Create": true
			}
		},
	},
	successLoginReturnObject1: {
		"token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInB3ZCI6IjQ5MTJiYTc5ZmRjZDgxODE0ZGE3MDdiM2UxNTAzZjcxIiwiaWF0IjoxNDgzMDk2NTIyLCJleHAiOjE0ODMxMDAxMjJ9.DkKl500E1BVHr23YkcaEAjJjfQz9dA70qvW9YF9A9vTEgzryaU5Xsc7YxRWgyh_0t5ffMQB4fT_O-maZDhclAg",
		user: {
			id: 1,
			username: 'demo@opexanalytics.com',
			admin: 1,
			companyName: 'Opex',
			home_page: '/WSProjects',
			role: 'Consultant',
			functions: {
				SC_Copy: true,
				SC_Create: true,
				SC_Delete: true,
				SC_View: true,
				app_settings: true,
				home_page: false,
				table_add: true,
				table_delete: true,
				table_edit: true,
				wf_DataUpload: true,
				wf_DownloadOutput: true,
				wf_ParamExecute: true,
				wf_VwTableau: true
			},
			scenarios: ['1', '8']
		}
	},
	tokenResultObject: {
		id: 1,
		username: 'demo@opexanalytics.com',
		admin: true,
		companyName: 'Opex',
		home_page: '/WSProjects',
		role: 'Consultant',
		scenarios: '',
		functions: {
			"table_delete": true,
			"table_edit": true,
			"table_add": true,
			"app_settings": true,
			"home_page": false,
			"SC_Copy": true,
			"wf_VwTableau": true,
			"wf_DownloadOutput": true,
			"wf_ParamExecute": true,
			"wf_DataUpload": true,
			"SC_View": true,
			"SC_Delete": true,
			"SC_Create": true
		}
	},
	expiredToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInB3ZCI6IjQ5MTJiYTc5ZmRjZDgxODE0ZGE3MDdiM2UxNTAzZjcxIiwiaWF0IjoxNDgzMDk2NTIyLCJleHAiOjE0ODMxMDAxMjJ9.DkKl500E1BVHr23YkcaEAjJjfQz9dA70qvW9YF9A9vTEgzryaU5Xsc7YxRWgyh_0t5ffMQB4fT_O-maZDhclAg',
	invalidToken: 'eyJhbciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInB3ZCI6IjQ5MTJiYTc5ZmRjZDgxODE0ZGE3MDdiM2UxNTAzZjcxIiwiaWF0IjoxNDgzMDk2NTIyLCJeHAiOjE0ODMxMDAxMjJ9.DkKl500E1BVHr23YkcaEAjJjfQz9dA70qvW9YF9A9vTEgzryaU5Xsc7YxRWgyh_0t5ffMQB4fT_O-maZDhclAg'

};
