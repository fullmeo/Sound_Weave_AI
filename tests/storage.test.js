import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { StorageService } from '../src/services/storage.service.js';
import fs from 'fs/promises';
import path from 'path';

describe('StorageService', () => {
  let storage;
  const testBasePath = './test-data';

  before(async () => {
    // Create test storage instance
    process.env.STORAGE_PATH = testBasePath;
    storage = new StorageService();
    await storage.init();
  });

  after(async () => {
    // Cleanup test data
    try {
      await fs.rm(testBasePath, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('Path Security', () => {
    it('should prevent path traversal attacks', () => {
      const maliciousIds = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'test/../../../secret',
        'test/./../../confidential',
      ];

      maliciousIds.forEach(id => {
        assert.throws(
          () => storage.getAudioPath(id),
          /path traversal detected/,
          `Should reject malicious ID: ${id}`
        );
      });
    });

    it('should sanitize generation IDs', () => {
      const dirtyId = 'test<>:"/\\|?*id';
      const path = storage.getAudioPath(dirtyId);
      assert.ok(path.includes('test'), 'Should keep valid characters');
      assert.ok(!path.includes('<'), 'Should remove invalid characters');
    });

    it('should allow valid UUIDs', () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = storage.getAudioPath(validId);
      assert.ok(
        filePath.endsWith(`${validId}.wav`),
        'Should accept valid UUID'
      );
    });
  });

  describe('Metadata Management', () => {
    it('should save and retrieve metadata', async () => {
      const testGeneration = {
        id: 'test-123',
        prompt: 'test music',
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      await storage.saveMetadata(testGeneration);
      const retrieved = await storage.getMetadata('test-123');

      assert.strictEqual(retrieved.id, testGeneration.id);
      assert.strictEqual(retrieved.prompt, testGeneration.prompt);
    });

    it('should update existing metadata', async () => {
      const testGeneration = {
        id: 'test-456',
        prompt: 'initial prompt',
        status: 'processing',
      };

      await storage.saveMetadata(testGeneration);

      const updated = {
        id: 'test-456',
        status: 'completed',
        audioUrl: 'https://example.com/audio.wav',
      };

      await storage.saveMetadata(updated);
      const retrieved = await storage.getMetadata('test-456');

      assert.strictEqual(retrieved.status, 'completed');
      assert.strictEqual(retrieved.audioUrl, updated.audioUrl);
      assert.strictEqual(retrieved.prompt, 'initial prompt'); // Should keep old fields
    });

    it('should list generations with pagination', async () => {
      // Add multiple test generations
      for (let i = 0; i < 5; i++) {
        await storage.saveMetadata({
          id: `test-list-${i}`,
          prompt: `test ${i}`,
          status: 'completed',
          createdAt: new Date(Date.now() + i * 1000).toISOString(),
        });
      }

      const result = await storage.list({ limit: 3, offset: 0 });

      assert.strictEqual(result.data.length, 3);
      assert.strictEqual(result.pagination.hasMore, true);
      assert.strictEqual(result.pagination.total >= 5, true);
    });

    it('should filter by status', async () => {
      await storage.saveMetadata({
        id: 'test-failed',
        prompt: 'test',
        status: 'failed',
        createdAt: new Date().toISOString(),
      });

      const result = await storage.list({ status: 'failed' });
      const failedItems = result.data.filter(item => item.status === 'failed');

      assert.ok(failedItems.length > 0, 'Should find failed items');
      assert.ok(
        failedItems.every(item => item.status === 'failed'),
        'All items should have failed status'
      );
    });
  });

  describe('Metadata Caching', () => {
    it('should cache metadata for performance', async () => {
      // First load - should read from disk
      const start1 = Date.now();
      await storage.loadMetadata();
      const duration1 = Date.now() - start1;

      // Second load - should use cache
      const start2 = Date.now();
      await storage.loadMetadata();
      const duration2 = Date.now() - start2;

      // Cache should be significantly faster (or at least not slower)
      assert.ok(
        duration2 <= duration1 + 5,
        'Cached load should not be slower than first load'
      );
    });

    it('should invalidate cache after save', async () => {
      await storage.loadMetadata(); // Load into cache

      const beforeSave = await storage.loadMetadata();
      const beforeCount = beforeSave.length;

      await storage.saveMetadata({
        id: 'cache-test',
        prompt: 'test cache invalidation',
        status: 'completed',
      });

      const afterSave = await storage.loadMetadata();
      const afterCount = afterSave.length;

      assert.strictEqual(
        afterCount,
        beforeCount + 1,
        'Should reflect new item after cache invalidation'
      );
    });
  });

  describe('Statistics', () => {
    it('should calculate storage statistics', async () => {
      const stats = await storage.getStats();

      assert.ok(typeof stats.totalGenerations === 'number');
      assert.ok(typeof stats.completedCount === 'number');
      assert.ok(typeof stats.totalStorageUsed === 'number');
      assert.ok(stats.totalGenerations >= 0);
    });
  });

  describe('Delete Operations', () => {
    it('should delete generation metadata', async () => {
      await storage.saveMetadata({
        id: 'test-delete',
        prompt: 'will be deleted',
        status: 'completed',
      });

      const beforeDelete = await storage.getMetadata('test-delete');
      assert.ok(beforeDelete, 'Should exist before delete');

      await storage.delete('test-delete');

      const afterDelete = await storage.getMetadata('test-delete');
      assert.strictEqual(afterDelete, null, 'Should not exist after delete');
    });
  });
});
