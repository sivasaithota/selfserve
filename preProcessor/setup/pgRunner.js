var path = require('path');
var logger = require('../../app/logger');
var CommandExecutor = require('./commandExecutor');

var PGRunner = function () {

  var runSQL = function (config, sqlFilePath) {
    var destFileName = path.resolve(__dirname, sqlFilePath);
    var command = 'export PGPASSWORD=\'' + config.dbpassword + '\';psql -h ' + config.dbserverName + ' -p ' + config.port + ' -f ' + destFileName + ' -d ' + config.dbname + ' -U ' + config.dbusername;
    logger.info('common', 'Executing command: ', command);
    return new CommandExecutor().execute(command); //Execute command to connect to database.postgres.
  };

  var restore = function (config, filePath) {
    var cmd = 'export PGPASSWORD=\'' + config.dbpassword + '\';pg_restore -h ' + config.dbserverName + ' -p ' + config.port + ' -U ' + config.dbusername + ' --dbname=' + config.dbname + ' ' + filePath + '';
    logger.info('common', 'Executing command: ', cmd);
    return new CommandExecutor().execute(cmd); //Execute command to connect to database.postgres.	
  };

  var executeCommand = function (config, cmd) {
    var command = 'export PGPASSWORD=\'' + config.dbpassword + '\';psql -h ' + config.dbserverName + ' -p ' + config.port + ' -c "' + cmd + '" -d ' + config.dbname + ' -U ' + config.dbusername;
    return new CommandExecutor().execute(command); //Execute command to connect to database.postgres.
  }

  return {
    runSQL: runSQL,
    restore: restore,
    executeCommand: executeCommand
  };

};

module.exports = PGRunner;
