var util = require('util');

var dataAccess = require('../../app/dataAccess/postgres'),
  logger = require('../../app/logger'),
  cache = require('../../app/common/cache');

var DBCreator = function () {
  var defaultAppId = '1111';
  
  /*****
  Function to drop an existing db if exists.
  *****/

  var dropDatabase = function (dbName) {
    logger.info('Checking if database exists', dbName);
    return dataAccess.executeQuery(defaultAppId, util.format('SELECT datname FROM pg_catalog.pg_database WHERE datname=\'%s\';', dbName))
      .then(function (result) {
        if (result && result.rows && result.rows.length === 1) {
          logger.info('common', 'Database exist, terminating active connections');
          return dataAccess.executeQuery(defaultAppId, util.format('SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname =\'%s\';', dbName)).then(function () {
            return dataAccess.executeQuery(defaultAppId, util.format('DROP DATABASE "%s";', dbName));
          });
        } else {
          logger.info('common', 'Database does not exist', dbName);
          return '';
        }
      }).catch(function (err) {
        logger.error('common', 'Error while dropping database:' + dbName, err);
        throw err;
      });
  };

  /*****
  Function to create a new db.
  *****/

  var createDatabase = function (dbName) {
    logger.info('common', 'Checking if database exists', dbName);
    return checkDbExists(dbName)
      .then(function (result) {
        if (result) {
          logger.info('common', 'Database exists', dbName);
          return '';
        } else {
          logger.info('common', 'Creating database...');
          return dataAccess.executeQuery(defaultAppId, util.format('CREATE DATABASE "%s";', dbName))
            .then(function (result) {
              logger.info('common', 'Database created successfully', dbName);
              return dataAccess.executeQuery(defaultAppId, util.format('REVOKE ALL PRIVILEGES ON DATABASE "%s" FROM PUBLIC; REVOKE CONNECT ON DATABASE "%s" FROM PUBLIC;', dbName, dbName));
            });
        }
      }).catch(function (err) {
        logger.error('common', 'Error while creating database:' + dbName, err);
        throw err;
      });
  };

  /*****
  creating dba role user with password
  Note: For do this Admin should sign in with app database
   *****/

  var createDbaUser = function (dbaConfig, appId) {
    logger.info('Creating dba user', dbaConfig.dbusername);

    var query = `CREATE ROLE ${dbaConfig.roleName} WITH CREATEROLE;
      ALTER DATABASE ${dbaConfig.dbname} OWNER TO ${dbaConfig.roleName};
      CREATE USER ${dbaConfig.dbusername} WITH PASSWORD '${dbaConfig.dbpassword}';
      GRANT ${dbaConfig.roleName} TO ${dbaConfig.dbusername};
      ALTER USER ${dbaConfig.dbusername} SET ROLE ${dbaConfig.roleName};
      ALTER SCHEMA public OWNER TO ${dbaConfig.roleName};`;

    return dataAccess.executeQuery(`${defaultAppId}_${appId}`, query);
  };


  var run = function (dbaConfig, dType, appId) {
    return createDatabase(dbaConfig.dbname)
      .then(function () {
        if (dType === 'redeploy') return '';
        // connect as superAdmin with the app database to create dba
        return createDbaUser(dbaConfig, appId);
      })
      .catch(function (err) {
        logger.error('common', 'Error while creating database!!', err);
        throw err;
      });
  };

  var checkDbExists = function (dbName) {
    logger.info('common', 'Checking if database exists', dbName);
    return dataAccess.executeQuery(defaultAppId, util.format('SELECT datname FROM pg_catalog.pg_database WHERE datname=\'%s\';', dbName))
      .then(function (result) {
        return (result && result.rows && result.rows.length === 1) ? true : false;
      }).catch(function (err) {
        logger.error('common', 'Error while dropping database:' + dbName, err);
        throw err;
      });
  };

  return {
    run: run,
    checkDbExists: checkDbExists
  };

};

module.exports = DBCreator;
