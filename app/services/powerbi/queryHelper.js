module.exports = {
  addReport: 'INSERT INTO "lkp_powerbi_report" ("scenario_template_id","url","report_type","workspace_id","report_id","label","type","created_by","updated_by") VALUES (%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\') RETURNING "id";',
  getReportsByType: 'SELECT "id", "order_id", "report_type", "type", "url", "label", "workspace_id", "report_id" FROM "lkp_powerbi_report" WHERE "type"=\'%s\' ORDER BY "order_id";',
  getReportsByScenario: 'SELECT lkp_powerbi_report."id", lkp_powerbi_report."order_id", "type", "url", "report_type", "label", "workspace_id", "report_id" FROM "lkp_powerbi_report" LEFT JOIN "projects" ON projects."scenario_template_id" = lkp_powerbi_report."scenario_template_id" %s;',
  getReportsForRefresh: 'SELECT "id", "order_id", "type", "url", "report_type", "label", "workspace_id", "report_id" FROM "lkp_powerbi_report"',
  getReports: 'SELECT r."id", r."order_id", r."type", r."url", r."label" FROM "lkp_powerbi_report" r',
  getReport: 'SELECT "id", "order_id", "type", "url", "label", "workspace_id", "report_id" FROM "lkp_powerbi_report" WHERE "id"=%s;',
  deleteReport: 'DELETE FROM "lkp_powerbi_report" WHERE "id" = %s returning type;',
  editReport: 'UPDATE "lkp_powerbi_report" SET "scenario_template_id"=%s, "url" = \'%s\', "report_type" = \'%s\', "workspace_id" = \'%s\', "report_id" = \'%s\', "label" = \'%s\', "updated_at" = now(), "updated_by" = \'%s\' WHERE "id"=%s;',
  updateImportSetting: 'UPDATE "powerbi_import_settings" SET %s',
  insertImportSetting: 'INSERT INTO "powerbi_import_settings" (%s) VALUES (%s);',
  getImportSetting: 'SELECT powerbi_import_settings."id", "type", "type_id", "type_name", "run_import", "segment" FROM "powerbi_import_settings"',
  deleteImportSetting: 'DELETE FROM "powerbi_import_settings" WHERE "id"=%s;',
};
