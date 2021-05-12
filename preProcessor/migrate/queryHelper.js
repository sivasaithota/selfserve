module.exports = {
  createChangeLog: `CREATE TABLE IF NOT EXISTS "changelog" ("id" SERIAL, "script" TEXT, "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now())`,
  getChangeLog: `SELECT * FROM "changelog" ORDER BY script;`,
  getChangeLogDown: `SELECT * FROM "changelog" WHERE "applied_at"::date > '%s' ORDER BY script DESC;`,
  insertChangeLog: `INSERT INTO "changelog"(script) VALUES ('%s');`,
  deleteChangeLog: `DELETE FROM "changelog" WHERE script='%s'`,
};
