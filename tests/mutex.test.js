import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Mutex } from '../src/utils/mutex.js';

describe('Mutex', () => {
  describe('Basic Locking', () => {
    it('should execute function with lock', async () => {
      const mutex = new Mutex();
      let value = 0;

      const result = await mutex.acquire('test', async () => {
        value++;
        return value;
      });

      assert.strictEqual(result, 1);
      assert.strictEqual(value, 1);
    });

    it('should release lock after execution', async () => {
      const mutex = new Mutex();

      await mutex.acquire('test', async () => {
        assert.strictEqual(mutex.isLocked('test'), true);
      });

      assert.strictEqual(mutex.isLocked('test'), false);
    });

    it('should execute functions sequentially for same key', async () => {
      const mutex = new Mutex();
      const executionOrder = [];

      // Start two operations in parallel
      const promise1 = mutex.acquire('test', async () => {
        executionOrder.push('start-1');
        await new Promise(resolve => setTimeout(resolve, 50));
        executionOrder.push('end-1');
      });

      const promise2 = mutex.acquire('test', async () => {
        executionOrder.push('start-2');
        await new Promise(resolve => setTimeout(resolve, 50));
        executionOrder.push('end-2');
      });

      await Promise.all([promise1, promise2]);

      // Second should start only after first completes
      assert.deepStrictEqual(executionOrder, ['start-1', 'end-1', 'start-2', 'end-2']);
    });

    it('should allow concurrent execution for different keys', async () => {
      const mutex = new Mutex();
      const start1 = Date.now();
      const start2 = Date.now();

      await Promise.all([
        mutex.acquire('key1', async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        }),
        mutex.acquire('key2', async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        }),
      ]);

      const duration = Date.now() - Math.min(start1, start2);

      // Should take ~50ms (parallel), not ~100ms (sequential)
      assert.ok(duration < 80, 'Operations should run in parallel');
    });
  });

  describe('Race Condition Prevention', () => {
    it('should prevent race conditions in concurrent writes', async () => {
      const mutex = new Mutex();
      let value = 0;

      // Simulate 10 concurrent increments
      const promises = Array.from({ length: 10 }, (_, i) =>
        mutex.acquire('counter', async () => {
          const current = value;
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
          value = current + 1;
        })
      );

      await Promise.all(promises);

      // Without mutex, this would likely fail due to race conditions
      assert.strictEqual(value, 10, 'All increments should be applied');
    });

    it('should handle errors and still release lock', async () => {
      const mutex = new Mutex();

      try {
        await mutex.acquire('test', async () => {
          throw new Error('Test error');
        });
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.strictEqual(error.message, 'Test error');
      }

      // Lock should be released even after error
      assert.strictEqual(mutex.isLocked('test'), false);

      // Should be able to acquire lock again
      await mutex.acquire('test', async () => {
        assert.ok(true, 'Lock reacquired successfully');
      });
    });
  });

  describe('Utility Methods', () => {
    it('should track lock state correctly', async () => {
      const mutex = new Mutex();

      assert.strictEqual(mutex.isLocked('test'), false);
      assert.strictEqual(mutex.size(), 0);

      const promise = mutex.acquire('test', async () => {
        assert.strictEqual(mutex.isLocked('test'), true);
        assert.strictEqual(mutex.size(), 1);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Check during lock
      assert.strictEqual(mutex.isLocked('test'), true);
      assert.strictEqual(mutex.size(), 1);

      await promise;

      // Check after release
      assert.strictEqual(mutex.isLocked('test'), false);
      assert.strictEqual(mutex.size(), 0);
    });

    it('should return function result', async () => {
      const mutex = new Mutex();

      const result = await mutex.acquire('test', async () => {
        return { success: true, value: 42 };
      });

      assert.deepStrictEqual(result, { success: true, value: 42 });
    });
  });
});
