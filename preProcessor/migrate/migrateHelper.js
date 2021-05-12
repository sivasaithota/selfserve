const util = require('util');
const path = require('path');

const pgClient = require('../../app/dataAccess/postgres');
const mongoClient = require('../../app/dataAccess/mongo');
const constants = require('../../app/common/constants');
const Filer = require('../../app/common/filer');
const queryHelper = require('./queryHelper');
const logger = require('../../app/logger');

class MigrateHelper {
  constructor() {
    this.scriptsPath = path.resolve(__dirname, './scripts');
  }

  getAllApps(status = null) {
    const appStatus = status ? [status] : ['ACTIVE', 'INACTIVE', 'UPGRADE FAILED'];
    return mongoClient.find(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications, {
      status: {
        $in: appStatus,
      },
    });
  }

  getAppById(appId) {
    return mongoClient.find(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications, {
      _id: mongoClient.getObjectId(appId)
    });
  }

  updateAppMigrationStatus(app) {
    const updateProperties = { status: app.status };
    if (app.status === 'UPGRADE FAILED' || app.status === 'DOWNGRADE FAILED') {
      updateProperties.migrationLogs = app.logs;
    }
    logger.info(app._id, 'Updating app migration status in mongo', app._id);
    return mongoClient.updateOne(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications,
      { _id: mongoClient.getObjectId(app._id) }, { $set: updateProperties });
  }

  async createChangeLog(app) {
    logger.info(app._id, 'Creating change log table if not exist');
    return pgClient.executeQuery(app._id, queryHelper.createChangeLog);
  }

  async getChangeLog(app, query) {
    const result = await pgClient.executeQuery(app._id, query);
    return (result && result.rows && result.rows.length > 0) ? result.rows.map(r => r.script) : [];
  }

  async insertChangeLog(app, script) {
    logger.info(app._id, `Inserting change log for the app:${app._id}`, script);
    const result = await pgClient.executeQuery(app._id, util.format(queryHelper.insertChangeLog, script));
    if (result.rowCount <= 0) throw `Error while inserting change log for app:${app._id}`;
  }

  async deleteChangeLog(app, script) {
    logger.info(app._id, `Deleting change log for the app:${app._id}`, script);
    const result = await pgClient.executeQuery(app._id, util.format(queryHelper.deleteChangeLog, script));
    if (result.rowCount <= 0) throw `Error while deleting change log for app:${app._id}`;
  }

  getMigrationScripts() {
    return new Filer().getAll(this.scriptsPath).filter(script => script.endsWith('.js'));
  }

  async populateChangeLogs(app) {
    const scripts = await this.getMigrationScripts();
    await this.createChangeLog(app);
    await Promise.all(scripts.map(script => this.insertChangeLog(app, script)));
  }
}

module.exports = new MigrateHelper();
