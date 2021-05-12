const logConfig = require('config').get('logs');
const enframeJsCommon = require('@opexanalytics-rad/enframe-js-common');

const Arborsculpt = require('pino-arborsculpture');
const stackTrace = require('stack-trace');
const pino = require('pino');

class Logger {
  constructor(logConfig) {
    const config = {
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { level: label }
        },
        bindings() {
        },
      },
      ...logConfig,
    }

    this.pino = pino(config);
    const arbor = Arborsculpt({
      path: logConfig.adjustmentFilePath,
      loggers: [this.pino],
    });

    arbor.on('error', (err) => {
      pino.error('Failed to adjust log level', err);
    });
  }

  _getStackTrace(func) {
    const trace = stackTrace.get(func);
    const caller = trace[0];
    return {
      caller: `${caller.getFunctionName()} (${caller.getFileName()}:${caller.getLineNumber()})`,
    };
  }

  /**
   * Function to log the debug message with object
   * @param {string} message Message to be logged
   * @param {object} [object] object Object to be logged
   */
  debug(appId, message, object) {
    this.pino.debug({
      ...this._getStackTrace(this.debug),
      data: object,
      appId: appId,
    }, message);
  }

  /**
   * Function to log the info message with object
   * @param {string} message Message to be logged
   * @param {object} [object] object Object to be logged
   */
  info(appId, message, object) {
    this.pino.info({
      ...this._getStackTrace(this.info),
      data: object,
      appId: appId,
    }, message);
  }

  /**
   * Function to log the warning message with object
   * @param {string} message Message to be logged
   * @param {object} object Object to be logged
   */
  warning(appId, message, object) {
    this.pino.warn({
      ...this._getStackTrace(this.warn),
      data: object,
      appId: appId,
    }, message);
  }

  /**
   * Function to log the error message with object
   * @param {string} message Message to be logged
   * @param {object} object Object to be logged
   */
  error(appId, message, object) {
    this.pino.error({
      appId: appId,
      err: object,
    }, message);
  }

  /**
   * Function to log the fatal message with object
   * @param {string} message Message to be logged
   * @param {object} object Object to be logged
   */
  fatal(message, object) {
    this.pino.fatal(object, message);
  }
}

module.exports = new Logger(logConfig);
