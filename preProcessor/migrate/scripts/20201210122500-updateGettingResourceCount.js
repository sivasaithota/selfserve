const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const sql = 'DROP FUNCTION IF EXISTS get_resource_count(INTEGER, JSON);';
    await pgClient.executeQuery(app._id, sql);
    const updateGRCountFunction = await filer.readFile(path.resolve(__dirname, '../../sqlScripts/scenario/get_resource_count_fn.sql'));
    await pgClient.executeQuery(app._id, updateGRCountFunction);
  },
  async down({ app, pgClient }) {
    const sql = 'DROP FUNCTION IF EXISTS get_resource_count(INTEGER, INTEGER);';
    await pgClient.executeQuery(app._id, sql);
    const revertGRCountFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20201210122500/get_resource_count_fn.sql'));
    await pgClient.executeQuery(app._id, revertGRCountFunction);
  }
};
