var dataAccess = require('../../app/dataAccess/postgres'),
  logger = require('../../app/logger');

var DBHelper = function () {

  /*****
  Function to get maximum id in the projects table.
  *****/

  var getLastId = function (appId) {
    var query = 'SELECT last_value FROM projects_id_seq;';
    logger.info('Getting maximum id...', query);
    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        logger.info('common', 'Getting maximum id result', result);
        return result && result.rows && result.rows.length > 0 ? Number(result.rows[0].last_value) : 0;
      })
      .catch(function (err) {
        logger.error('common', 'Error while getting id', err);
        throw err;
      });
  };

  return {
    getLastId: getLastId
  };

};

module.exports = DBHelper;
