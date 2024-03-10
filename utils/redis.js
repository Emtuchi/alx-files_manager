import { createClient } from 'redis';
import { promisify } from 'util'; // For converting callback-based functions to promises

class RedisClient {
  /**
   * creates a new redis client
   */
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.toString());
    });
    this.connected = false;
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  /**
   * Checks if this client's connection is active
   * @returns {boolean}
   */
  isAlive() {
    return this.connected;
  }

  /**
   * Stores a key and its value along with an expiration time.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    // Convert the 'set' function to a promise-based function
    // 'SETEX' set with expiration time
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  /**
   * Retrieves the value of a given key.
   * @param {String} key The key of the item to retrieve.
   * @returns {String | Object}
   */
  async get(key) {
    // Convert the 'get' function to a promise-based function
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Removes the value of a given key.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    // Convert the 'DEL' function to a promise-based function
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}
export const redisClient = new RedisClient();
export default redisClient;
