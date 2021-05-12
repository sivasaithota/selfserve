module.exports = {
  scenarioLock: 'SELECT * FROM check_lock(%s,\'%s\',%s,%s,%s);',
  removeLock: 'DELETE FROM "locking" WHERE "scenario_id"=%s AND "username"=\'%s\';',
  removeAll: 'DELETE FROM "locking";',
  toggleLock: 'UPDATE "setting" SET "value" = \'%s\'  WHERE "key"=\'locking\';',
  lockScenario: 'SELECT * FROM lock_scenario(%s,\'%s\');',
  removeScenarioLock: 'SELECT * FROM remove_scenario_lock(%s,\'%s\');',
  getScenarioLock: 'SELECT "id","scenario_id","created_by" FROM "locking" WHERE "scenario_id" IN (%s);'
};
