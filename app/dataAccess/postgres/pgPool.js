const genericPool = require('generic-pool');
const pg = require('pg');

const logger = require('../../logger');

class PgPool {

  constructor(dbConfig) {
    this._dbConfig = dbConfig;
    this.createClient = this.createClient.bind(this);
    this.destroyClient = this.destroyClient.bind(this);
    this.acquire = this.acquire.bind(this);
    this.release = this.release.bind(this);
    this.destroy = this.destroy.bind(this);
    const factory = {};
    const options = {
      min: this._dbConfig.minConnections || 0,
      max: this._dbConfig.maxConnections,
      evictionRunIntervalMillis: this._dbConfig.evictionRunIntervalMillis || 10000,
      idleTimeoutMillis: this._dbConfig.idleTimeoutMillis || 1800000,
      acquireTimeoutMillis: this._dbConfig.acquireTimeoutMillis || 3000,
      fifo: this._dbConfig.fifo || true,
      autostart: this._dbConfig.autoStart || true,
      ssl: this._dbConfig.ssl || false
    };
    this.pool = genericPool.createPool({
      create: this.createClient,
      destroy: this.destroyClient,
    }, options);
  }

  createClient() {
    const client = new pg.Client({
      user: this._dbConfig.dbusername,
      password: this._dbConfig.dbpassword,
      database: this._dbConfig.dbname,
      host: this._dbConfig.dbserverName,
      port: this._dbConfig.port,
      ssl: this._dbConfig.ssl
    });
    client.on('error', (err) => {
      logger.error('common', 'Error from postgres!', err);
    });
    return new Promise((resolve, reject) => {
      client.connect(function (err) {
        if (err) {
          logger.error('common', 'Error while creating postgres client using pooling...', err);
          reject(err);
        } else
          resolve(client);
      });
    });
  }

  destroyClient(client) {
    client.end();
  }

  acquire() {
    return this.pool.acquire();
  }

  release(client) {
    return this.pool.release(client);
  }

  destroy(client) {
    return this.pool.destroy(client);
  };
}

module.exports = PgPool;
