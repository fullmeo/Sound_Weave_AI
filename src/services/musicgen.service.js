import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import config from '../config/environment.js';

const logger = pino({
  level: config.logging.level,
  transport: config.logging.prettyPrint
    ? { target: 'pino-pretty' }
    : undefined,
});

export class MusicGenService {
  constructor() {
    this.replicate = axios.create({
      baseURL: config.replicate.baseUrl,
      headers: {
        Authorization: `Token ${config.replicate.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: config.replicate.timeout,
    });
  }

  /**
   * Validate generation parameters
   */
  validateGenerationParams(params) {
    const { prompt, duration, model } = params;
    const errors = [];

    if (!prompt || typeof prompt !== 'string') {
      errors.push('Prompt is required and must be a string');
    } else if (prompt.length < config.generation.minPromptLength) {
      errors.push(
        `Prompt must be at least ${config.generation.minPromptLength} characters`
      );
    } else if (prompt.length > config.generation.maxPromptLength) {
      errors.push(
        `Prompt cannot exceed ${config.generation.maxPromptLength} characters`
      );
    }

    if (!Number.isInteger(duration) || duration < config.generation.minDuration || 
        duration > config.generation.maxDuration) {
      errors.push(
        `Duration must be an integer between ${config.generation.minDuration} and ${config.generation.maxDuration} seconds`
      );
    }

    if (model && !config.generation.allowedModels.includes(model)) {
      errors.push(
        `Model must be one of: ${config.generation.allowedModels.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate music from text prompt
   */
  async generate(params) {
    const {
      prompt,
      duration = config.generation.defaultDuration,
      model = config.generation.defaultModel,
    } = params;

    const generationId = uuidv4();

    // Validate parameters
    const validation = this.validateGenerationParams({
      prompt,
      duration,
      model,
    });

    if (!validation.isValid) {
      const error = new Error('Invalid generation parameters');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    logger.info(
      { generationId, prompt, duration, model },
      'Starting music generation'
    );

    try {
      // Build input object based on model variant
      const input = {
        prompt,
        duration,
      };

      if (model === 'melody') {
        input.top_k = 250;
        input.top_p = 0.0;
      }

      // Create prediction on Replicate
      const prediction = await this.createPrediction(input, model);

      // Poll for completion with exponential backoff
      const result = await this.pollPrediction(prediction.id, generationId);

      logger.info(
        { generationId, predictionId: prediction.id },
        'Music generation completed successfully'
      );

      return {
        id: generationId,
        status: 'completed',
        prompt,
        duration,
        model,
        audioUrl: result.output?.[0],
        replicateId: prediction.id,
        createdAt: new Date().toISOString(),
        metadata: {
          promptLength: prompt.length,
          modelVariant: model,
          inputTokens: Math.ceil(prompt.length / 4), // rough estimate
        },
      };
    } catch (error) {
      logger.error(
        { generationId, error: error.message },
        'Music generation failed'
      );

      if (error.code === 'VALIDATION_ERROR') {
        throw error;
      }

      // Handle specific Replicate errors
      if (error.response?.status === 401) {
        const apiError = new Error('Invalid Replicate API token');
        apiError.code = 'AUTH_ERROR';
        apiError.statusCode = 401;
        throw apiError;
      }

      if (error.response?.status === 429) {
        const apiError = new Error('Replicate rate limit exceeded');
        apiError.code = 'RATE_LIMIT_ERROR';
        apiError.statusCode = 429;
        throw apiError;
      }

      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error(
          'Generation timeout - model taking too long'
        );
        timeoutError.code = 'TIMEOUT_ERROR';
        timeoutError.statusCode = 504;
        throw timeoutError;
      }

      // Default error
      const genericError = new Error(
        `Generation failed: ${error.message || 'Unknown error'}`
      );
      genericError.code = 'GENERATION_ERROR';
      genericError.statusCode = 500;
      throw genericError;
    }
  }

  /**
   * Create prediction on Replicate API
   */
  async createPrediction(input, model) {
    try {
      const modelVersion =
        model === 'melody'
          ? 'meta/musicgen:1602de9c14c2c1b47c212072250500ac64e4e682c72971e01b8af38c17b60d82'
          : 'meta/musicgen:7a76a8258b23fae65c5a22dbb63625ccf54ea7c6bc252e124122d8ecdd857c99';

      const response = await this.replicate.post('/predictions', {
        version: modelVersion,
        input,
      });

      return response.data;
    } catch (error) {
      logger.error(
        { error: error.message, status: error.response?.status },
        'Failed to create Replicate prediction'
      );
      throw error;
    }
  }

  /**
   * Poll Replicate prediction until completion
   */
  async pollPrediction(predictionId, generationId, maxAttempts = 120) {
    let attempts = 0;
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();

    while (attempts < maxAttempts) {
      try {
        const response = await this.replicate.get(
          `/predictions/${predictionId}`
        );
        const prediction = response.data;

        logger.debug(
          { generationId, status: prediction.status, attempt: attempts + 1 },
          'Polling prediction status'
        );

        if (prediction.status === 'succeeded') {
          return prediction;
        }

        if (prediction.status === 'failed') {
          const error = new Error(
            `Prediction failed: ${prediction.error || 'Unknown error'}`
          );
          error.code = 'PREDICTION_FAILED';
          throw error;
        }

        if (prediction.status === 'canceled') {
          const error = new Error('Prediction was canceled');
          error.code = 'PREDICTION_CANCELED';
          throw error;
        }

        // Check timeout
        if (Date.now() - startTime > maxWaitTime) {
          const error = new Error(
            'Generation timeout - exceeded maximum wait time'
          );
          error.code = 'TIMEOUT_ERROR';
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc. (max 10s)
        const delay = Math.min(1000 * Math.pow(1.5, attempts), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      } catch (error) {
        if (error.code?.includes('TIMEOUT') || error.code?.includes('FAILED')) {
          throw error;
        }

        logger.warn(
          { error: error.message, attempt: attempts + 1 },
          'Error polling prediction, retrying'
        );

        const delay = Math.min(1000 * Math.pow(1.5, attempts), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      }
    }

    const error = new Error('Generation timeout - max polling attempts exceeded');
    error.code = 'MAX_ATTEMPTS_ERROR';
    throw error;
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      models: config.generation.allowedModels,
      defaults: {
        model: config.generation.defaultModel,
        duration: config.generation.defaultDuration,
      },
      limits: {
        minDuration: config.generation.minDuration,
        maxDuration: config.generation.maxDuration,
        maxPromptLength: config.generation.maxPromptLength,
      },
    };
  }
}

export default MusicGenService;
