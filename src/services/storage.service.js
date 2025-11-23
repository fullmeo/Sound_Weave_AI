import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import pino from 'pino';
import config from '../config/environment.js';

const logger = pino({
  level: config.logging.level,
  transport: config.logging.prettyPrint
    ? { target: 'pino-pretty' }
    : undefined,
});

export class StorageService {
  constructor() {
    this.basePath = config.storage.basePath;
    this.generationsDir = path.join(
      this.basePath,
      config.storage.generationsDir
    );
    this.metadataFile = path.join(this.basePath, config.storage.metadataFile);
    this.init();
  }

  /**
   * Initialize storage directories
   */
  async init() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.mkdir(this.generationsDir, { recursive: true });

      // Create metadata file if it doesn't exist
      try {
        await fs.access(this.metadataFile);
      } catch {
        await fs.writeFile(this.metadataFile, JSON.stringify([], null, 2));
      }

      logger.info(
        { path: this.basePath },
        'Storage initialized successfully'
      );
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize storage');
      throw error;
    }
  }

  /**
   * Save generation metadata
   */
  async saveMetadata(generation) {
    try {
      const metadata = await this.loadMetadata();
      const existingIndex = metadata.findIndex(m => m.id === generation.id);

      if (existingIndex >= 0) {
        metadata[existingIndex] = { ...metadata[existingIndex], ...generation };
      } else {
        metadata.push(generation);
      }

      await fs.writeFile(
        this.metadataFile,
        JSON.stringify(metadata, null, 2)
      );

      logger.debug({ generationId: generation.id }, 'Metadata saved');
    } catch (error) {
      logger.error(
        { error: error.message, generationId: generation.id },
        'Failed to save metadata'
      );
      throw error;
    }
  }

  /**
   * Load all metadata
   */
  async loadMetadata() {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to load metadata');
      return [];
    }
  }

  /**
   * Get generation metadata by ID
   */
  async getMetadata(generationId) {
    try {
      const metadata = await this.loadMetadata();
      const generation = metadata.find(m => m.id === generationId);
      return generation || null;
    } catch (error) {
      logger.error(
        { error: error.message, generationId },
        'Failed to get metadata'
      );
      throw error;
    }
  }

  /**
   * Download and save audio file from URL
   */
  async downloadAudio(generationId, audioUrl) {
    try {
      const fileName = `${generationId}.wav`;
      const filePath = path.join(this.generationsDir, fileName);

      logger.info(
        { generationId, url: audioUrl.substring(0, 50) },
        'Starting audio download'
      );

      const response = await axios({
        method: 'get',
        url: audioUrl,
        responseType: 'stream',
        timeout: 60000,
      });

      // Check file size
      const contentLength = parseInt(response.headers['content-length'], 10);
      if (contentLength > config.storage.maxFileSize) {
        throw new Error(
          `File size ${contentLength} exceeds max ${config.storage.maxFileSize}`
        );
      }

      // Write to file
      await new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filePath))
          .on('finish', resolve)
          .on('error', reject);
      });

      const fileStats = await fs.stat(filePath);

      logger.info(
        { generationId, size: fileStats.size },
        'Audio downloaded successfully'
      );

      return {
        fileName,
        filePath,
        size: fileStats.size,
        url: `/api/generations/${generationId}/download`,
      };
    } catch (error) {
      logger.error(
        { error: error.message, generationId },
        'Failed to download audio'
      );
      throw error;
    }
  }

  /**
   * Get audio file path
   */
  getAudioPath(generationId) {
    return path.join(this.generationsDir, `${generationId}.wav`);
  }

  /**
   * Check if audio file exists
   */
  async audioExists(generationId) {
    try {
      const filePath = this.getAudioPath(generationId);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete generation (metadata + audio file)
   */
  async delete(generationId) {
    try {
      // Delete audio file
      const filePath = this.getAudioPath(generationId);
      try {
        await fs.unlink(filePath);
        logger.debug({ generationId }, 'Audio file deleted');
      } catch {
        // File might not exist, continue
      }

      // Delete from metadata
      const metadata = await this.loadMetadata();
      const filtered = metadata.filter(m => m.id !== generationId);
      await fs.writeFile(
        this.metadataFile,
        JSON.stringify(filtered, null, 2)
      );

      logger.info({ generationId }, 'Generation deleted successfully');
    } catch (error) {
      logger.error(
        { error: error.message, generationId },
        'Failed to delete generation'
      );
      throw error;
    }
  }

  /**
   * List all generations with optional filtering
   */
  async list(options = {}) {
    try {
      let metadata = await this.loadMetadata();

      // Filter by status
      if (options.status) {
        metadata = metadata.filter(m => m.status === options.status);
      }

      // Filter by date range
      if (options.after) {
        const afterDate = new Date(options.after);
        metadata = metadata.filter(
          m => new Date(m.createdAt) >= afterDate
        );
      }

      if (options.before) {
        const beforeDate = new Date(options.before);
        metadata = metadata.filter(
          m => new Date(m.createdAt) <= beforeDate
        );
      }

      // Sort
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      metadata.sort(
        (a, b) =>
          sortOrder * (new Date(b.createdAt) - new Date(a.createdAt))
      );

      // Paginate
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const total = metadata.length;
      const paginated = metadata.slice(offset, offset + limit);

      return {
        data: paginated,
        pagination: {
          total,
          offset,
          limit,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      logger.error(
        { error: error.message },
        'Failed to list generations'
      );
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    try {
      const metadata = await this.loadMetadata();
      let totalSize = 0;

      // Calculate total size
      const files = await fs.readdir(this.generationsDir);
      for (const file of files) {
        const stats = await fs.stat(path.join(this.generationsDir, file));
        totalSize += stats.size;
      }

      return {
        totalGenerations: metadata.length,
        completedCount: metadata.filter(m => m.status === 'completed').length,
        totalStorageUsed: totalSize,
        maxStorageAllowed: config.storage.maxFileSize * metadata.length,
      };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get stats');
      throw error;
    }
  }
}

export default StorageService;
