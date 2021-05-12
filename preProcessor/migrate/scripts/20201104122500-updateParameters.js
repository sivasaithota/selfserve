const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const updateRWSchemaFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20201017144800/update_parameters_dates_fn.sql'));
    await pgClient.executeQuery(app._id, updateRWSchemaFunction);
    await pgClient.executeQuery(app._id, 'SELECT updateparametervalue();');
    await pgClient.executeQuery(app._id, 'DROP FUNCTION IF EXISTS updateparametervalue();');
  },
  async down({ app, pgClient }) {
    const sql = 'DROP FUNCTION IF EXISTS updateparametervalue();';
    await pgClient.executeQuery(app._id, sql);
  }
};
