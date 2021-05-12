module.exports = {
  archiveScenario: 'SELECT * FROM archive_scenario(\'{%s}\', \'%s\');',
  getScenarioArchive: 'SELECT "status", "name" FROM "projects" WHERE "id" IN (%s);'
};
