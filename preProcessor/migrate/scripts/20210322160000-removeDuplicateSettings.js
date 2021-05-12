const path = require('path');

module.exports = {
  async up({ app, pgClient, filer }) {
    const removeDuplicates = `DELETE FROM setting s
      WHERE EXISTS (
        SELECT FROM setting
        WHERE  key = s.key
        AND    id < s.id
      );`;
    await pgClient.executeQuery(app._id, removeDuplicates);
  },
  async down({ app, pgClient }) {
  }
};
