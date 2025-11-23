import express from 'express';
import pino from 'pino';
import { MusicGenService } from '../services/musicgen.service.js';
import { StorageService } from '../services/storage.service.js';
import { validateGenerationInput, createErrorResponse } from '../utils/validation.js';

const router = express.Router();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

let musicGenService;
let storageService;

/**
 * Initialize services
 */
export function initializeServices() {
  musicGenService = new MusicGenService();
  storageService = new StorageService();
}

/**
 * POST /api/generate
 * Generate music from prompt
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, duration, model } = req.body;

    // Validate input
    const validation = validateGenerationInput({
      prompt,
      duration,
      model,
    });

    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', validation.errors)
      );
    }

    logger.info({ prompt: prompt.substring(0, 50) }, 'Generation request');

    // Generate music
    const result = await musicGenService.generate({
      prompt,
      duration,
      model,
    });

    // Save metadata
    await storageService.saveMetadata({
      ...result,
      localFile: null,
      downloadedAt: null,
    });

    // Attempt to download audio (async, non-blocking)
    storageService
      .downloadAudio(result.id, result.audioUrl)
      .then(audioInfo => {
        storageService.saveMetadata({
          ...result,
          localFile: audioInfo.fileName,
          downloadedAt: new Date().toISOString(),
        });
      })
      .catch(error => {
        logger.warn(
          { generationId: result.id, error: error.message },
          'Failed to download audio file'
        );
      });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Generation started successfully',
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Generation failed');

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(createErrorResponse(error.code, error.details));
    }

    if (error.code === 'AUTH_ERROR') {
      return res.status(401).json(createErrorResponse(error.code));
    }

    if (error.code === 'RATE_LIMIT_ERROR') {
      return res.status(429).json(createErrorResponse(error.code));
    }

    if (error.code === 'TIMEOUT_ERROR') {
      return res.status(504).json(createErrorResponse(error.code));
    }

    res.status(500).json(
      createErrorResponse('GENERATION_ERROR', error.message)
    );
  }
});

/**
 * GET /api/generations
 * List all generations
 */
router.get('/generations', async (req, res) => {
  try {
    const { limit = 20, offset = 0, status, after, before } = req.query;

    const result = await storageService.list({
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
      status,
      after,
      before,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to list generations');
    res.status(500).json(createErrorResponse('LIST_ERROR', error.message));
  }
});

/**
 * GET /api/generations/:id
 * Get specific generation
 */
router.get('/generations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await storageService.getMetadata(id);

    if (!metadata) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Generation ${id} not found`)
      );
    }

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get generation');
    res.status(500).json(createErrorResponse('GET_ERROR', error.message));
  }
});

/**
 * GET /api/generations/:id/download
 * Download audio file
 */
router.get('/generations/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await storageService.getMetadata(id);
    if (!metadata) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Generation ${id} not found`)
      );
    }

    const filePath = storageService.getAudioPath(id);
    const exists = await storageService.audioExists(id);

    if (!exists) {
      return res.status(404).json(
        createErrorResponse('FILE_NOT_FOUND', 'Audio file not available for download')
      );
    }

    res.download(filePath, `musicgen-${id}.wav`, (err) => {
      if (err) {
        logger.error({ error: err.message }, 'Failed to send file');
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Download failed');
    res.status(500).json(createErrorResponse('DOWNLOAD_ERROR', error.message));
  }
});

/**
 * DELETE /api/generations/:id
 * Delete generation
 */
router.delete('/generations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await storageService.getMetadata(id);
    if (!metadata) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Generation ${id} not found`)
      );
    }

    await storageService.delete(id);

    res.json({
      success: true,
      message: `Generation ${id} deleted successfully`,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Delete failed');
    res.status(500).json(createErrorResponse('DELETE_ERROR', error.message));
  }
});

/**
 * GET /api/models
 * Get available models and constraints
 */
router.get('/models', (req, res) => {
  try {
    const modelInfo = musicGenService.getModelInfo();
    res.json({
      success: true,
      data: modelInfo,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get model info');
    res.status(500).json(createErrorResponse('MODEL_ERROR', error.message));
  }
});

/**
 * GET /api/stats
 * Get storage and usage statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await storageService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get stats');
    res.status(500).json(createErrorResponse('STATS_ERROR', error.message));
  }
});

/**
 * POST /api/health
 * Health check
 */
router.post('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
