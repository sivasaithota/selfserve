const io = require('socket.io-client');
const socketConfig = require('config').get('socket');
const logger = require('../logger');
class SocketHandler {
  start() {
    this._socket = io(`http://${socketConfig.hostname}:${socketConfig.port}`, {
      path: socketConfig.path,
      transports: ['websocket'],
      reconnection: socketConfig.reconnection,
      reconnectionDelay: socketConfig.reconnectionDelay,
      reconnectionDelayMax: socketConfig.reconnectionDelayMax,
      reconnectionAttempts: socketConfig.reconnectionAttempts,
    });
    this._socket.on('connect', () => {
      logger.info('common', 'Socket connection established successfully.');
    });
    this._socket.on('error', (err) => {
      logger.error('common', 'Error occurred in socket', err);
    });
    this._socket.on('connect_error', (reason) => {
      logger.error('common', 'Error connecting to socket', reason);
    });
    this.eventHandlers = {};
  }

  addEventHandler(event, handler) {
    if (!this.eventHandlers[event]) {
      this._socket.on(event, handler);
      this.eventHandlers[event] = true;
    }
  }

  joinRoom(roomId) {
    logger.info('common', 'Socket joining room', roomId);
    this._socket.emit('createRoom', roomId);
  }

  leaveRoom(roomId) {
    this._socket.emit('leaveRoom', roomId);
  }

  registerEvent(event, callback) {
    this._socket.emit(event, callback);
  }

  close() {
    logger.debug('appId', 'Closing socket connection.');
    this._socket.close();
  }

  broadcastEvent(event, message) {
    this._socket.emit('broadcast', {
      event,
      message,
    });
  }

  emitEvent(roomId, event, message) {
    this._socket.emit('emit', roomId, {
      event,
      message,
    });
  }
}

module.exports = new SocketHandler();

