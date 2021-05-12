const { MongoClient, ObjectID } = require('mongodb');
const genericPool = require('generic-pool');
const dbConfig = require('config').get('database.mongo');

const logger = require('../../logger');

class DBManager {
  constructor() {
    const mongoUrl = `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}`;
    const mongoOptions = {
      poolSize: 1,
      connectTimeoutMS: dbConfig.connectTimeoutMS,
      socketTimeoutMS: dbConfig.socketTimeoutMS,
      autoReconnect: dbConfig.autoReconnect,
      validateOptions: dbConfig.validateOptions,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      ignoreUndefined: true,
    };
    const poolOptions = {
      min: dbConfig.minConnections,
      max: dbConfig.maxConnections,
      evictionRunIntervalMillis: dbConfig.evictionRunIntervalMillis,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      acquireTimeoutMillis: dbConfig.acquireTimeoutMillis,
      fifo: dbConfig.fifo,
      autostart: dbConfig.autoStart,
    };

    const factory = {
      create: async function () {
        try {
          const client = await MongoClient.connect(mongoUrl, mongoOptions);
          return client;
        } catch (err) {
          logger.fatal('common', 'Error while connecting to database', err);
          throw err;
        }
      },
      destroy: function (client) {
        client.close();
      },
    };
    this._pool = genericPool.createPool(factory, poolOptions);
  }

  acquire() {
    return this._pool.acquire();
  }

  release(client) {
    return this._pool.release(client);
  }

  destroy(client) {
    return this._pool.destroy(client);
  }

  getObjectId(id) {
    return id ? new ObjectID(id) : new ObjectID();
  }

  isValidObjectId(id) {
    return ObjectID.isValid(id);
  }
}

module.exports = DBManager;
