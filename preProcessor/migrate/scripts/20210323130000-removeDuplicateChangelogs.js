const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const removeDuplicates = `DELETE FROM changelog c
      WHERE EXISTS (
        SELECT FROM changelog
        WHERE  script = c.script
        AND    id < c.id
      );`;
    await pgClient.executeQuery(app._id, removeDuplicates);
  },
  async down({ app, pgClient }) {
  }
};
