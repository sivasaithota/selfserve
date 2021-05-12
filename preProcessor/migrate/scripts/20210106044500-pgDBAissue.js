const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const grantSchemaFunction = await filer.readFile(path.resolve(__dirname, '../../sqlScripts/user/grant_schema_access.sql'));
    await pgClient.executeQuery(app._id, grantSchemaFunction);
    const updateRWSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20210106044500/upgrade_schema_access.sql'));
    await pgClient.executeQuery(app._id, updateRWSchemaFunction);
    await pgClient.executeQuery(app._id,
    `
    DO $$
    DECLARE
        schema_table RECORD;
        _query text;
    BEGIN
        FOR schema_table IN
        (SELECT schema_name from information_schema.schemata where schema_name not like 'pg_%' and schema_name not like 'information_schema')
        LOOP
        BEGIN
            PERFORM public.upgrade_grant_schema_access(schema_table.schema_name);
            RAISE INFO 'GRANTED ACCESS for % SCHEMA', schema_table.schema_name ;
        END;
        END LOOP;
    END
  $$;`);
    await pgClient.executeQuery(app._id, `SELECT upgrade_scenario_schema_access();`);
    await pgClient.executeQuery(app._id, `SELECT upgrade_report_schema_access();`);
    await pgClient.executeQuery(app._id, `DROP FUNCTION IF EXISTS upgrade_grant_schema_access(TEXT);`);
    await pgClient.executeQuery(app._id, `DROP FUNCTION IF EXISTS upgrade_scenario_schema_access();`);
    await pgClient.executeQuery(app._id, `DROP FUNCTION IF EXISTS upgrade_report_schema_access();`);
  
  },

  async down({ app, pgClient, filer }) {
    const grantSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20210106044500/grant_schema_access.sql'));
    await pgClient.executeQuery(app._id, grantSchemaFunction);
  }
};