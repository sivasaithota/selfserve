module.exports = {
  selectAllScenario: 'SELECT "id","order_id","name","updated_by","updated_at","tag_id","status","created_by","created_at","archived_at","archived_by" ' +
    'FROM "projects" WHERE (%s AND "status" = \'%s\') OR (%s AND "status" IS NOT NULL);',
  getTemplates: 'SELECT "id","name" FROM "lkp_scenario_templates";',
  selectAllScenarioByUser: 'SELECT p."id", p."order_id", p."name", p."tag_id", p."status", p."updated_at", p."updated_by", p."created_by", p."created_at", p."archived_at", p."archived_by" ' +
    'FROM "projects" p, "users_scenario_accesses" usa ' +
    'WHERE p."id" = usa."scenario_id" AND usa."user_id"=%s AND ((%s AND p."status" = \'%s\') OR (%s AND p."status" IS NOT NULL)) ' +
    'ORDER BY p."order_id";',
  selectAllTables: 'SELECT "id", "order_id", "tablename", "displayname", "type", "tag" FROM "lkp_data_upload_tables" WHERE "version" = (SELECT MAX ("version") FROM "lkp_data_upload_tables") ORDER BY "order_id";',
  selectAllTablesByUser: 'SELECT "id", "order_id", "tablename", "displayname", "type", "tag" FROM "lkp_data_upload_tables" WHERE "id" IN (SELECT "table_id", "editable" FROM "users_table_accesses" WHERE "user_id"=%s) AND "version" = (SELECT MAX ("version") FROM "lkp_data_upload_tables") ORDER BY "order_id";',
  addScenario: 'SELECT * FROM create_scenario(\'%s\',%s,\'%s\',%s);',
  updateScenario: 'SELECT * FROM update_scenario(%s,\'%s\',%s,\'%s\');',
  getScenarioById: 'SELECT "id","scenario_template_id","name","status","archived_at","archived_by" FROM "projects" WHERE "id" = %s;',
  copyScenario: 'SELECT * from copy_scenario(%s,\'%s\',\'%s\')',
  deleteScenario: 'SELECT * from delete_scenario(\'{%s}\');',
  getParameters: 'SELECT param."id", param."type", param."validation", param."parameter", param."dependency_id", param."value", param."displayname", param."tooltip", param."group_name", param."column_name" as "parent_column_name", dep."dependent_column_name" FROM scenario_%s."parameters" param LEFT JOIN "lkp_dependency_list" dep on param."dependency_id" = dep."id" ORDER BY param."id";',
  saveParameter: 'SELECT * FROM save_parameter(%s,\'%s\',\'%s\',\'%s\');',
  uploadGridData: 'Select * FROM upload_grid_data(%s,\'%s\',\'%s\',\'%s\');',
  selectTables: 'a."id",a."tablename",a."columnlist",a."displayname",a."displaylist",a."columnlistwithtypes",a."visible",a."type",a."unique_key",a."visiblecolumns",a."editablecolumns",a."tag",a."columnfloat",a."filter",' +
    'b."file_name",b."status",b."updated_at",b."updated_by",psut.n_live_tup AS total_count,r."column_position",r."column_order",table_metainfo_check(a."tablename", %s) AS "meta_info_exists" ' +
    'FROM "lkp_data_upload_tables" a INNER JOIN "projects" c ON a."scenario_template_id" = c."scenario_template_id" AND a."type" LIKE \'%s%\' AND c."id" = %s AND a."version" = c."version" ' +
    'LEFT JOIN "project_tables" b ON a."tablename"= b."table_name" AND b."pid"=c."id" ' +
    'LEFT JOIN "lkp_row_view" r ON a."tablename" = r."tablename" AND a."scenario_template_id" = r."scenario_template_id" ' +
    'LEFT JOIN pg_stat_user_tables psut ON psut.relname=a."tablename" AND psut.schemaname=\'scenario_%s\' ',
  resourceCount: 'SELECT * FROM get_resource_count(%s, %s);',
  tableType: 'SELECT t."id", t."order_id", t."label", t."url" FROM "lkp_tableau_report" t, "projects" p WHERE t."type" = \'%s\' AND t."scenario_template_id"=p."scenario_template_id" AND p."id"=%s ORDER BY t."order_id";',
  selectTablesRowsCounts: 'SELECT a."id",table_rows_count(a."tablename", %s) total_count ' +
    'FROM "lkp_data_upload_tables" a ' +
    'INNER JOIN "projects" c ON a."scenario_template_id" = c."scenario_template_id" ' +
    'AND a."type" LIKE \'%s%\' ' +
    'AND c."version" = a."version" ' +
    'AND c."id" = %s ' +
    'LEFT JOIN "project_tables" b ON a."tablename"= b."table_name" ' +
    'AND b."pid"=c."id" ORDER BY a."id";',
  selectTablesRowsCountByType: 'SELECT a."id",table_rows_count(a."tablename", %s) total_count ' +
    'FROM "lkp_data_upload_tables" a ' +
    'JOIN "users_table_accesses" d ON d."table_id" = a."id" ' +
    'INNER JOIN "projects" c ON a."scenario_template_id" = c."scenario_template_id" ' +
    'AND a."type" LIKE \'%s%\' AND c."version" = a."version" AND c."id" = %s AND a."version" = c."version" ' +
    'LEFT JOIN "project_tables" b ON a."tablename"= b."table_name" AND b."pid"=c."id" ' +
    'WHERE d."user_id"=%s' +
    'ORDER BY a."id";',
  selectAllTableau: 'SELECT t."id", t."order_id", t."label", t."url" FROM "lkp_tableau_report" t, "projects" p ' +
    'WHERE t."type" = \'%s\' AND t."scenario_template_id"=p."scenario_template_id" AND p."id"=%s ' +
    'ORDER BY t."order_id";',
  selectAllTableauByUser: 'SELECT r."id", r."order_id", r."label", r."url" FROM "lkp_tableau_report" r ' +
    'INNER JOIN "users_visualization_accesses" acc ON r.id = acc."report_id" AND acc."user_id"=%s ' +
    'INNER JOIN "projects" p ON r."scenario_template_id"=p."scenario_template_id" AND p."id"=%s ' +
    'WHERE r."type" = \'%s\' ' +
    'ORDER BY r."order_id";',
  addGrid: 'SELECT * from add_grid_data(%s,\'%s\',\'%s\',\'%s\')',
  editGrid: 'SELECT * FROM edit_grid_data(%s,%s,\'%s\',\'%s\',\'%s\',%s)',
  deleteGrid: 'SELECT * FROM delete_grid_data(\'%s\',%s,\'%s\',\'%s\')',
  getPageInfo: 'SELECT a."id",a."type",a."value",a."visible",a."is_default" AS "isDefault" FROM "lkp_pages" a, "projects" b WHERE a."scenario_template_id"=b."scenario_template_id" AND b."id"=%s;',
  changeOrderId: 'UPDATE "projects" SET "order_id" = %s WHERE "id" = %s;',
  getEditOptions: 'SELECT d."custom_sql",l."column_name",d."dependent_schema_name",d."dependent_table_name",d."dependent_column_name",d."custom_values" FROM "lkp_edit_grid" l JOIN "lkp_dependency_list" d ON d."id" = l."dependency_id" ,"projects"  p  WHERE l."table_name"=\'%s\' AND l."type"=\'%s\' AND p."id"=%s AND p."scenario_template_id"=l."scenario_template_id";',
  getParametersList: 'SELECT js."value", d."custom_sql",d."dependent_schema_name",d."dependent_table_name",d."dependent_column_name" ,d."custom_values" ,s."column_name" AS "parentColumnName" FROM scenario_%s."parameters" s LEFT JOIN scenario_%s."parameters" js ON js."id" = s."parent_id" LEFT JOIN "lkp_dependency_list" d on d."id" = s."dependency_id"   WHERE s."displayname"=\'%s\' AND s."group_name"=\'%s\';',
  getTableEditOptions: 'SELECT l."column_name", d."custom_sql", d."dependent_schema_name", d."dependent_table_name", d."dependent_column_name", d."custom_values", l."parent_column_name" FROM "lkp_edit_grid" l JOIN "lkp_dependency_list" d ON d."id" = l."dependency_id"  WHERE "table_name"=\'%s\' AND "type"=\'%s\';',
  getRangeOptions: 'SELECT * FROM get_col_range_for_table(%s,\'%s\');',
  multiEditGrid: 'SELECT * FROM multi_edit_grid_data(%s,\'%s\',\'%s\',\'%s\',\'%s\')',
  getTableInfo: 'SELECT l."visiblecolumns" , v."definition", l."type" FROM "lkp_data_upload_tables" l ' +
    'JOIN "projects" p ON p."scenario_template_id" = l."scenario_template_id" AND p."version" = l."version" ' +
    'LEFT JOIN "lkp_views" v ON l."id" = v."table_id" ' +
    'WHERE p."id" = %s and l."tablename"=\'%s\';',
  checkIfViewExist: 'SELECT * FROM pg_views WHERE "schemaname"=\'scenario_%s\' AND "viewname" = \'%s\'',
  createView: 'CREATE OR REPLACE VIEW scenario_%s."%s" AS %s',
  getTags: 'SELECT "id", "tag_name" FROM "tags"',
  saveTags: 'INSERT INTO "tags"("tag_name","type", "created_by") VALUES (\'%s\',\'%s\',\'%s\') RETURNING id, tag_name;',
  selectActiveTemplateTables: 'SELECT t."id" "table_id", t."tablename", t."displayname", t."type", ' +
    't."scenario_template_id", p."id" "scenario_id", p."name" "scenario_name" ' +
    'FROM "lkp_data_upload_tables" t, "projects" p ' +
    'WHERE t."scenario_template_id" = p."scenario_template_id" ' +
    'AND p."version" = t."version"' +
    'AND p."status" = \'active\'' +
    'AND t."scenario_template_id" = %s ' +
    'ORDER BY "scenario_id", t."id";',
  selectUpdatedInputsParameters: 'SELECT * from get_updated_parameters(%s) as x(tab_name text, values json);',
  copyTable: 'export PGPASSWORD=\'%s\'; psql -h %s -p %s -d %s -U %s -c "\\copy scenario_%s.\\"%s\\" (%s) from \'%s\' WITH CSV HEADER encoding \'windows-1251\'";',
  getTableForDownload: 'SELECT lkp."tablename", lkp."columnlist", lkp."type" FROM public."lkp_data_upload_tables" lkp INNER JOIN "projects" p ON lkp."version" = p."version" JOIN information_schema.tables ist ON ist."table_name"=lkp."tablename" WHERE lkp."tablename"= \'%s\' AND lkp."type"= \'%s\' AND p."id" = %s AND ist."table_schema"=\'scenario_%s\';',
  downloadTable: 'export PGPASSWORD=\'%s\'; psql -h %s -p %s -d %s -U %s -c "\\copy (SELECT %s FROM scenario_%s.\\"%s\\"  %s) TO \'%s\' DELIMITER \',\' CSV HEADER";',
  getAllTablesForDownload: 'SELECT lkp."tablename", lkp."%s" AS "columnlist",lkp."type", p."id" FROM public."lkp_data_upload_tables" lkp JOIN "projects" p ON p."scenario_template_id" = lkp."scenario_template_id" AND lkp."version" = p."version" JOIN information_schema.tables ist ON ist."table_name"=lkp."tablename" WHERE lkp."type" LIKE \'%s%\' AND p."id" = %s AND ist.table_schema=\'scenario_%s\';',
  getAllTablesForDownloadByUserId: 'SELECT lkp."tablename", lkp."%s" AS "columlist" ,lkp."type", p."id" FROM public."lkp_data_upload_tables" lkp JOIN "projects" p ON p."scenario_template_id" = lkp."scenario_template_id" AND lkp."version" = p."version" JOIN "users_table_accesses" uta ON lkp."id" = uta."table_id" JOIN information_schema.tables ist ON ist."table_name"=lkp."tablename" WHERE lkp."type" LIKE \'%s%\' AND p."id" = %s AND ist.table_schema=\'scenario_%s\' AND uta."user_id" = %s;',
};
