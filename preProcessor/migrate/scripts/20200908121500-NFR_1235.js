const path = require('path');

const Filer = require('../../../app/common/filer');

module.exports = {
  async up({ app, pgClient }) {
    const sql = await new Filer().readFile(path.resolve(__dirname, '../../sqlScripts/scenario/get_resource_count_fn.sql'));
    return pgClient.executeQuery(app._id, sql);
  },

  down({ app, pgClient }) {
    const sql = 'DROP FUNCTION IF EXISTS get_resource_count(INTEGER, JSON);';
    return pgClient.executeQuery(app._id, sql);
  }
};
