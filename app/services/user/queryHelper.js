module.exports = {
  deleteUser: 'SELECT * FROM delete_user(%s);',
  addUser: 'SELECT * FROM add_user(\'%s\',\'%s\',\'%s\',%s,\'%s\');',
  getAllUser: 'SELECT u."id",u."username",u."email",u."role",s."scenario_id",t."table_id",t."editable",v."report_id",p."powerbi_id" ' +
      'FROM "users" u ' +
      'LEFT OUTER JOIN "users_scenario_accesses" s on u."id"=s."user_id" ' +
      'LEFT OUTER JOIN "users_table_accesses" t on u."id"=t."user_id" ' +
      'LEFT OUTER JOIN "users_powerbi_accesses" p on u."id"=p."user_id" ' +
      'LEFT OUTER JOIN "users_visualization_accesses" v on u."id"=v."user_id";',
  updateUser: 'SELECT * FROM update_user(%s,\'%s\',\'%s\');',
  getUserById: 'SELECT "id","username","email","role" from "users" where "id"=%s',
  getUserByUsername: 'SELECT * FROM "users" WHERE LOWER(username)=\'%s\';',
  getUserRoleByUsername:
      'SELECT u."id",u."username",u."admin",u."companyName",u."home_page",u."role", ' +
      'array_to_string(array_agg(distinct s.scenario_id), \',\') as "scenarios", ' +
      'ARRAY_AGG(r.function::TEXT) as "roleFunctions", ' +
      'ARRAY_AGG(r."applicable"::BOOLEAN) as "roleFunctionValues" ' +
      'FROM public."users" u ' +
      'LEFT OUTER join public."users_scenario_accesses" s ON u."id"=s."user_id" ' +
      'join public."user_roles" r ON u."role"=r."role" ' +
      'WHERE LOWER(u."username")=\'%s\' ' +
      'GROUP BY u."id", u."username",u."admin",u."companyName",u."home_page",u."role";',
  getAllRoles: 'SELECT "role", "function", "applicable", "category", "rolename" FROM "user_roles" WHERE "role" NOT IN (%s);',
  updateScenarioAccess: 'SELECT * FROM update_scenario_access(%s,ARRAY[%s],false);',
  updateTableAccess: 'SELECT * FROM update_table_access(%s,\'%s\'::json);',
  exportUsers: 'SELECT "username", "password", "email", "role", "home_page" from "users" where "id" != \'%s\'',
  exportUsersWithAccess: 'SELECT u."username", u."email", u."password", u."role", u."home_page", st."name" AS "scenario_access", tt."tablename" AS "table_access" from "users" u ' +
    'LEFT OUTER JOIN "users_scenario_accesses" s on u."id"=s."user_id" ' +
    'LEFT OUTER JOIN "users_table_accesses" t on u."id"=t."user_id" ' +
    'LEFT OUTER JOIN "lkp_data_upload_tables" tt on tt."id"=t."table_id" ' +
    'LEFT OUTER JOIN "projects" st on st."id"=s."scenario_id" ' +
    'WHERE u."id" != \'%s\';',
  importUser: 'INSERT INTO "users" ("username","email","password","role","home_page","created_by","updated_by") ' +
    'VALUES (\'%s\',\'%s\',\'%s\',\'%s\',%s,\'%s\',\'%s\') RETURNING "id";',
  getScenarioIdByName: 'SELECT "id" from projects WHERE "name"=\'%s\'',
  getTableIdByName: 'SELECT "id" from "lkp_data_upload_tables" WHERE "tablename"=\'%s\'',
  createScenarioAccess: 'INSERT INTO "users_scenario_accesses" ("user_id","scenario_id") VALUES (\'%s\', \'%s\')',
  createTableAccess: 'INSERT INTO "users_table_accesses" ("user_id","table_id") VALUES (\'%s\', \'%s\')',
  removeUsersWithAccessExceptAdmin: 'SELECT * FROM remove_users_with_access(\'%s\');',
  updateTableauAccess: 'SELECT * FROM update_visualization_access(%s,ARRAY[%s]::integer[]);',
  updatePowerAccess: 'SELECT * FROM update_powerbi_access(%s,ARRAY[%s]::integer[]);',
};
