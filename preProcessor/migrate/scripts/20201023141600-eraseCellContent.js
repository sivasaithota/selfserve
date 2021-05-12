const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const createEdGrFunction = await filer.readFile(path.resolve(__dirname, '../../sqlScripts/scenario/edit_grid_data_fn.sql'));
    await pgClient.executeQuery(app._id, createEdGrFunction);
  },

  async down({ app, pgClient, filer }) {
    const createEdGrFunction = await filer.readFile(path.resolve(__dirname, '../sqlfiles/20201023141600/edit_grid_data_fn.sql'));
    await pgClient.executeQuery(app._id, createEdGrFunction);
  }
};
