module.exports = {
  insertTableauExtractStatus: 'INSERT INTO "tableau_extract_status" ("scenario_id","type", "status", "logs", "created_by", "updated_by") VALUES (%s, \'%s\', \'%s\', $$\'%s\'$$, \'%s\', \'%s\') RETURNING "id", "scenario_id", "type", "logs", "created_by", "created_at", "updated_by", "updated_at";',
  updateTableauExtractStatus: 'UPDATE "tableau_extract_status" SET "status"=\'%s\', "logs=\'%s\', "updated_at"=now() WHERE "id"=%s RETURNING "id", "scenario_id", "type", "logs", "created_by", "created_at", "updated_by", "updated_at";',
  getTableau: 'SELECT r."id",r."order_id",r."scenario_template_id",r."type",r."url",r."label",r."project",r."workbook" ' +
      'FROM "lkp_tableau_report" r',
  getTableauWithType: 'SELECT "order_id", "type", "url", "label", "project", "workbook" FROM "lkp_tableau_report" WHERE "type"=\'%s\' ORDER BY "order_id";',
  deleteTableau: 'DELETE FROM "lkp_tableau_report" WHERE "id" = %s returning type;',
  editTableau: 'UPDATE "lkp_tableau_report" SET "scenario_template_id"=%s, "url" = \'%s\', "label" = \'%s\', "updated_at" = now(), "updated_by" = \'%s\'',
  addTableau: 'INSERT INTO "lkp_tableau_report" ("scenario_template_id","url","label","type","created_by","updated_by") VALUES (%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\') RETURNING "id";',
  addTableauWithProject: 'INSERT INTO "lkp_tableau_report" ("scenario_template_id","url","label","type","created_by","updated_by", "project", "workbook") VALUES(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\') RETURNING "id";',
  getTemplateSettings: 'SELECT s."key", s."value", s."data_type" FROM "setting" s, "projects" p WHERE s."key" IN (\'%s\') AND p."id"=%s AND p."scenario_template_id"=s."scenario_template_id";',
  getUniqueWorkbooks: 'SELECT DISTINCT split_part((split_part(url, \'/views/\', 2)), \'/\', 1) AS url, project, workbook FROM lkp_tableau_report t;',
  getExtractSetting: 'SELECT te."id", te."type", te."typeId", te."typeName", te."runExtract", te."segment" FROM "tableauExtract" te',
  updateExtractSetting: 'UPDATE "tableauExtract" SET %s',
  insertExtractSetting: 'INSERT INTO "tableauExtract" (%s) VALUES (%s);',
  deleteExtractSetting: 'DELETE FROM "tableauExtract" WHERE "id"=%s;'
};
