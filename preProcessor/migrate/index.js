const util = require('util');
const minimist = require('minimist');

const logger = require('../../app/logger');
const cache = require('../../app/common/cache');
const migrationHelper = require('./migrateHelper');
const queryHelper = require('./queryHelper');
const mongoClient = require('../../app/dataAccess/mongo');
const pgClient = require('../../app/dataAccess/postgres');
const Filer = require('../../app/common/filer');

class PGMigrator {

  constructor({ migration, date, appId, status }) {
    this.migration = migration || 'up';
    this.appId = appId;
    this.migrateDownDate = date;
    this.migratedApps = {};
    this.appStatus = status;
    this.isMigrationSuccess = true;
  }

  async _runScript(app, scriptName) {
    const script = require(`${migrationHelper.scriptsPath}/${scriptName}`);
    app.logs += `Running the script:${scriptName}`;
    logger.info(app._id, 'Running the script for app', scriptName);
    const scriptObject = {
      app: app,
      cache: cache,
      mongoClient: mongoClient,
      pgClient: pgClient,
      filer: new Filer(),
    };
    this.migration === 'up' ? await script.up(scriptObject) : await script.down(scriptObject);
    app.logs += `Script ran successfully`;
  }

  async migrateUp(app, scripts) {
    logger.info(app._id, 'Migration Up for the app');
    for (let i = 0; i < scripts.length; i++) {
      await this._runScript(app, scripts[i]);
      logger.info(app._id, 'Inserting changelog for app', scripts[i]);
      await migrationHelper.insertChangeLog(app, scripts[i]);
    }
  }

  async migrateDown(app, scripts) {
    logger.info(app._id, 'Migration Down for the app');
    for (let i = 0; i < scripts.length; i++) {
      await this._runScript(app, scripts[i]);
      logger.info(app._id, 'Deleting changelog for app', scripts[i]);
      await migrationHelper.deleteChangeLog(app, scripts[i]);
    }
  }

  async migrateApp(app) {
    try {
      app._id = app._id.toString();
      logger.info(app._id, 'Migrating app', app._id);
      cache.set(app._id, app);
      await migrationHelper.createChangeLog(app);
      app.logs = '';
      if (this.migration === 'up') {
        const changeLogScripts = await migrationHelper.getChangeLog(app, queryHelper.getChangeLog);
        const newScripts = this.scripts.filter(s => !changeLogScripts.includes(s));
        await this.migrateUp(app, newScripts)
      } else {
        const changeLogScripts = await migrationHelper.getChangeLog(app, util.format(queryHelper.getChangeLogDown, this.migrateDownDate));
        await this.migrateDown(app, changeLogScripts);
      }
      app.status = app.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    } catch (err) {
      app.logs += `\n${err}`;
      this.isMigrationSuccess = false;
      app.status = this.migration === 'up' ? 'UPGRADE FAILED' : 'DOWNGRADE FAILED';
      logger.error(app._id, `Error while migrating app:${app._id}`, err);
    } finally {
      this.migratedApps[app._id] = app.status;
      await migrationHelper.updateAppMigrationStatus(app);
    }
  }

  async run() {
    this.scripts = await new Filer().getAllFiles(migrationHelper.scriptsPath).filter(script => script.endsWith('.js'));
    logger.info('common', 'Getting all apps');
    const apps = this.appId ? await migrationHelper.getAppById(this.appId) : await migrationHelper.getAllApps(this.appStatus);
    logger.info('common', 'Total   apps to be migrated.', apps.length);
    const chunkSize = 10;
    for (let index = 0; index < apps.length; index += chunkSize) {
      const appsChunk = apps.slice(index, index + chunkSize);
      await Promise.all(appsChunk.map(app => this.migrateApp(app)));
    }
    if (this.isMigrationSuccess) logger.info('', 'All apps migrated successfully');
    else logger.info('common', 'Some apps are not migrated successfully');
    logger.info('common', 'App migration status:', this.migratedApps);
  }
}

module.exports = PGMigrator;
