const PGPool = require('./pgPool');
const logger = require('../../logger');
const masterDbConfig = require('config').get('database.postgres');
const cacheTtl = require('config').get('server.cacheTtl');
const cache = require('../../common/cache');
const mongoClient = require('../mongo');
const constants = require('../../common/constants');
/*****
Function to perform database related actions.
*****/

class DataAccess {
  async executeQuery(appId, query) {
    logger.debug(appId, `Executing query for app:${appId}`, query);
    let pool;
    let client;
    try {
      pool = await this.getPool(appId);
      client = await pool.acquire();
      const result = await client.query(query);
      pool.release(client);
      logger.debug(appId, 'Query executed successfully', result);
      return result;
    } catch (err) {
      logger.error(appId, `Error while executing query:${query}`, err);
      if (client) pool.destroy(client);
      throw err;
    }
  }

  async getPool(appId) {
    if (!cache.has(appId)) await this.setAppCache(appId);

    const poolKey = `${appId}_pool`;
    const dbConfig = cache.get(appId).database;
    let pool;
    if (cache.ttl(poolKey, cacheTtl)) {
      pool = cache.get(poolKey);
    } else {
      pool = new PGPool(Object.assign({}, masterDbConfig, {
        dbusername: dbConfig.username,
        dbpassword: dbConfig.password,
        dbname: dbConfig.databaseName,
      }));
      cache.set(poolKey, pool, cacheTtl);
    }
    return pool;
  }

  setAppCache = function (appId) {
    return mongoClient.findOne(
      constants.dbConstants.databases.enframe, 
      constants.dbConstants.collections.applications, 
      { _id: mongoClient.getObjectId(appId) }
    )
    .then(function (result) { 
      if (!result) {
        logger.error(appId, 'Failed to get metadata from mongo for app id ', appId);
        throw new Error('Failed to get metadata from mongo for app id ', appId);
      }
      result.appId = result._id.toString();
      cache.set(result.url, result.appId);
      cache.set(appId, result, cacheTtl);
      return result;
    });
  }
}

module.exports = new DataAccess();
