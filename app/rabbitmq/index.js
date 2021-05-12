var amqp = require('amqplib/callback_api'),
  Bluebird = require('bluebird');

var logger = require('../logger');

var RabbitMQ = function (rabbitmqConfig, channel) {

  /*****
  constructing connection string for rabbitmq
  *****/
  var _connectionString = function () {
    return 'amqp://' + rabbitmqConfig.username + ':' + rabbitmqConfig.password + '@' + rabbitmqConfig.host + ':' + rabbitmqConfig.port;
  };


  /*****
  this function starts the rabbitmq and create separate channels for publisher and worker.
  mqobject contain {
  startPublisher:true,
  startWorker: true,
  callback: cbfunc
  }
  It starts publisher channel and subscriber channel based on mqobject
  Don't remove singleton object from this class.
  Also, publisher and subscriber channels are declared globally for this class to be accessible within
  It will auto reconnect if rabbitmq server fails
  *****/

  var start = function (mqObject) {
    var connection = null;
    return _connect()
      .then(function (con) {
        connection = con;
        _registerEvents(connection, mqObject);
        return createChannel(connection);
      })
      .then(function (channel) {
        subscribe(channel, mqObject.callback);
        return;
      })
      .catch(function (err) {
        logger.error('common', 'Error while starting rabbitmq.', err);
        if (!connection) createConOnTimeout(mqObject);
        else throw err;

      });
  };

  var _registerEvents = function (connection, mqObject) {
    connection.on("close", function () {
      logger.warning('common', 'Connection closed by rabbitmq, trying to re-connect');
      return createConOnTimeout(mqObject);
    });
    connection.on("error", function (err) {
      logger.error('common', 'Error in rabbit mq conneciton.' + err);
      return createConOnTimeout(mqObject);
    });
  };

  var _connect = function () {
    return new Bluebird(function (resolve, reject) {
      amqp.connect(_connectionString(), function (err, conn) {
        err ? reject(err) : resolve(conn);
      });
    });
  };

  var createChannel = function (connection) {
    return new Bluebird(function (resolve, reject) {
      connection.createConfirmChannel(function (err, channel) {
        if (err) {
          logger.error('common', 'Error while creating channel...', err);
          connection.close();
          reject(err);
        } else resolve(channel);
      });
    });
  };

  var createConOnTimeout = function (mqObject) {
    return setTimeout(function () {
      start(mqObject);
    }, rabbitmqConfig.reConnectTimeout)
  };

  var subscribe = function (workerChannel, callback) {
    workerChannel.prefetch(rabbitmqConfig.queues[channel].workerCount);
    workerChannel.assertQueue(rabbitmqConfig.queues[channel].queueName, {
      durable: true
    }, function (err, ok) {
      workerChannel.consume(rabbitmqConfig.queues[channel].queueName, function (message) {
        callback(message.content.toString())
          .then(function (result) {
            logger.info('common', 'Sending ack..');
            result && result.nack ? workerChannel.nack(message) : workerChannel.ack(message);
          })
          .catch(function (err) {
            logger.error('common', 'Subscribe error..', err);
            workerChannel.ack(message);
          });
      }, {
        noAck: false
      });
    });
  };

  var publish = function (message) {
    return new Bluebird(function (resolve, reject) {
      var con = null;
      _connect()
        .then(function (connection) {
          con = connection;
          return createChannel(connection);
        })
        .then(function (publisherChannel) {
          publisherChannel.publish('', rabbitmqConfig.queues[channel].queueName, new Buffer(message), {
            persistent: true,
            durable: true,
            contentEncoding: "utf-8",
            contentType: "text/plain"
          }, function (err, ok) {
            if (con) con.close();
            err ? reject(err) : resolve();
          });
        });
    });
  };

  return {
    start: start,
    publish: publish,
    subscribe: subscribe
  };

};

module.exports = RabbitMQ;
