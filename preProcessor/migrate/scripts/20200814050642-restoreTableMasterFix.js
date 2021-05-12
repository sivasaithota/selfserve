const path = require('path');

const Filer = require('../../../app/common/filer');

module.exports = {
  async up({ app, pgClient }) {
    const sql = await new Filer().readFile(path.resolve(__dirname, '../../sqlScripts/master/restore_app_fn.sql'));
    return pgClient.executeQuery(app._id, sql);
  },

  down() {
  }
};
