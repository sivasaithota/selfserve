const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const createEdsFunction = await filer.readFile(path.resolve(__dirname, '../../sqlScripts/user/create_eds_user_fn.sql'));
    await pgClient.executeQuery(app._id, createEdsFunction);
    const grantSchemaFunction = await filer.readFile(path.resolve(__dirname, '../../sqlScripts/user/grant_schema_access.sql'));
    await pgClient.executeQuery(app._id, grantSchemaFunction);
    const updateRWSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20200924044542/update_rw_schema_access.sql'));
    await pgClient.executeQuery(app._id, updateRWSchemaFunction);
    await pgClient.executeQuery(app._id, `SELECT update_rw_schema_access();`);
    await pgClient.executeQuery(app._id, `DROP FUNCTION IF EXISTS update_rw_schema_access();`);
  },

  async down({ app, pgClient, filer }) {
    const createEdsFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20200924044542/create_eds_user_fn.sql'));
    await pgClient.executeQuery(app._id, createEdsFunction);
    const grantSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20200924044542/grant_schema_access.sql'));
    await pgClient.executeQuery(app._id, grantSchemaFunction);
    const revokeRWSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20200924044542/revoke_rw_schema_access.sql'));
    await pgClient.executeQuery(app._id, revokeRWSchemaFunction);
    await pgClient.executeQuery(app._id, `SELECT revoke_rw_schema_access();`);
    await pgClient.executeQuery(app._id, `DROP FUNCTION IF EXISTS revoke_rw_schema_access();`);
  }
};