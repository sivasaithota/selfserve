var DBGenerator = require('./dbGenerator'),
  helper = require('./helper'),
  logger = require('../../app/logger');

function run(config) {
  var dbGenerator = new DBGenerator(config.appConfig, config.dbConfig),
    promise;

  switch (process.argv[2]) {
    case 'bundle': //Statements to just bundle the queries.
      promise = dbGenerator.bundle();
      break;
    case 'deploy': //Statments to just deploy the database.
      promise = dbGenerator.deploy();
      break;
    case 'bundleAndDeploy': //Statements to bundle and deploy the database.
      promise = dbGenerator.bundleAndDeploy()
      break;
    case 'restore': //Statements to restore and upgrade the db
      promise = dbGenerator.restore();
      break;
  };

  return promise;
}

helper.getConfig()
  .then(function (config) {
    logger.info('common', 'db configuration', config);
    return run(config);
  })
  .then(function () {
    logger.info('common', 'Successfuly executed command.');
    process.exit(0);
  })
  .catch(function (err) {
    logger.error('common', 'Error in executing Pre-Processor Command!', err);
    process.exit(1);
  });
