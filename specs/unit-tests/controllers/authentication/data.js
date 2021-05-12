module.exports = {
	userObject: {
		body: {
			password: "T2eD8HnOz07",
			username: "demo@opexanalytics.com"
		}
	},
	userResult: {
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
			scenarios: []
		}
	},
	userObject2: {
		body: {
			password: "T2eD8HnOz07"
		}
	},
	userObject3: {
		body: {
			username: "demo@opexanalytics.com"
		}
	},
	tokenObject: {
		headers: {
			token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInB3ZCI6IjQ5MTJiYTc5ZmRjZDgxODE0ZGE3MDdiM2UxNTAzZjcxIiwiaWF0IjoxNDgzMDk2NTIyLCJleHAiOjE0ODMxMDAxMjJ9.DkKl500E1BVHr23YkcaEAjJjfQz9dA70qvW9YF9A9vTEgzryaU5Xsc7YxRWgyh_0t5ffMQB4fT_O-maZDhclAg'
		},
		tokenResultObject: {
			id: 1,
			username: 'demo@opexanalytics.com',
			admin: 1,
			companyName: 'Opex',
			home_page: '/WSProjects',
			role: 'Consultant',
			scenarios: [],
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
			}
		},
	}

};
