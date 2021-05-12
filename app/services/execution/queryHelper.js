module.exports = {
  updateExecution: 'SELECT update_execution(%s,\'%s\');',
  updateProject: 'SELECT * FROM copy_tables(%s,\'%s\',\'%s\',\'%s\')',
  updateTable: 'UPDATE "project_tables" SET "status" = \'%s\' WHERE "pid" = %s and "table_name" = \'%s\' RETURNING "file_name", "status", "updated_at", "updated_by";',
};
