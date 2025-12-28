/**
 * Simple in-memory mutex for preventing race conditions
 *
 * This is a lightweight solution for single-process scenarios.
 * For multi-process/distributed systems, use Redis-based locks.
 */
export class Mutex {
  constructor() {
    this.locks = new Map();
  }

  /**
   * Acquire lock and execute function
   * @param {string} key - Lock identifier
   * @param {Function} fn - Function to execute with lock
   * @returns {Promise} Result of function execution
   */
  async acquire(key, fn) {
    // Wait for existing lock to release
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    // Create new lock
    let releaseLock;
    const lockPromise = new Promise(resolve => {
      releaseLock = resolve;
    });

    this.locks.set(key, lockPromise);

    try {
      // Execute function with lock held
      return await fn();
    } finally {
      // Release lock
      this.locks.delete(key);
      releaseLock();
    }
  }

  /**
   * Check if a key is currently locked
   * @param {string} key - Lock identifier
   * @returns {boolean}
   */
  isLocked(key) {
    return this.locks.has(key);
  }

  /**
   * Get number of active locks
   * @returns {number}
   */
  size() {
    return this.locks.size;
  }
}

// Singleton instance for app-wide use
export const globalMutex = new Mutex();
