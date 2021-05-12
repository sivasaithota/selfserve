var NodeCache = require('node-cache');

class Cache {
  constructor() {
    this.cache = new NodeCache({
      useClones: false,
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, data, ttl = 300) {
    this.cache.set(key, data, ttl);
  }

  has(key) {
    return this.cache.has(key);
  }

  ttl(key, ttl) {
    return this.cache.ttl(key, ttl);
  }

  delete(key) {
    return this.cache.del(key);
  }
}
module.exports = new Cache();
