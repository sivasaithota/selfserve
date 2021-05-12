module.exports = {
  getSettings: 'SELECT "key", "value", "data_type" FROM "setting" s',
  updateSetting: 'UPDATE "setting" SET "value" = \'%s\', "updated_by"= \'%s\', "updated_at" = now() WHERE "key" = \'%s\' AND "scenario_template_id"=%s;',
  getTabView: 'SELECT "id", "type", "value", "scenario_template_id" FROM "lkp_tab_view" WHERE "scenario_template_id" = %s',
  updateTabView: 'UPDATE "lkp_tab_view" SET "value" = \'%s\' WHERE "type" = \'%s\' AND "scenario_template_id" = %s;',
};
