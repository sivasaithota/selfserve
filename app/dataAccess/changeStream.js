const mongoClient = require('../dataAccess/mongo');
const constants = require('../common/constants');
const cache = require('../common/cache');
const logger = require('../logger');

const status = {
  update: 'update',
  delete: 'delete',
  replace: 'replace',
};

class ChangeStream {
  watchAppData() {
    mongoClient.watch(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications)
      .then(changeStream => {
        logger.info('common', 'Change stream started watching');
        changeStream.on('change', changeData => {
          const appId = changeData.documentKey._id.toString();
          logger.debug('Change stream next data ', changeData);
          if (cache.has(appId)) {
            if (changeData.operationType === status.delete) {
              cache.delete(appId);
              cache.delete(`${appId}_pool`);
            } else if (changeData.operationType === status.update) {
              const updatedData = cache.get(appId);
              cache.set(appId, {
                ...updatedData,
                ...changeData.updateDescription.updatedFields,
              });
            } else if (changeData.operationType === status.replace) {
              cache.set(appId, changeData.fullDocument);
            }
          }
        });

        changeStream.on('error', error => {
          logger.error('common', 'Error watching change stream', error);
        });

        changeStream.on('close', () => {
          logger.warning('common', 'Change stream closed');
        });
      })
      .catch(error => {
        logger.error('common', 'Failed to watch for change events in mongo', error);
      });
  }
}

module.exports = new ChangeStream();