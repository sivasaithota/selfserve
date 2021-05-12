const minimist = require('minimist');

const PGMigrator = require('..');
const logger = require('../../../app/logger');

(async () => {
  try {
    const argv = minimist(process.argv.slice(2));
    if (argv.migration === 'down' && !argv.date) {
      logger.warning('common', 'Please provide valid migration down date');
      process.exit(1);
    }
    await new PGMigrator(argv).run();
    process.exit(0);
  } catch (err) {
    logger.error('common', 'Error while running migration', err);
    process.exit(1);
  }
})();