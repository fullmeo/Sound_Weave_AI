import config from '../config/environment.js';

/**
 * Validate generation input parameters
 */
export function validateGenerationInput(data) {
  const { prompt, duration, model } = data;
  const errors = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  } else if (prompt.trim().length < config.generation.minPromptLength) {
    errors.push(
      `Prompt must be at least ${config.generation.minPromptLength} characters`
    );
  } else if (prompt.length > config.generation.maxPromptLength) {
    errors.push(
      `Prompt cannot exceed ${config.generation.maxPromptLength} characters`
    );
  }

  if (duration !== undefined) {
    if (!Number.isInteger(duration)) {
      errors.push('Duration must be an integer');
    } else if (
      duration < config.generation.minDuration ||
      duration > config.generation.maxDuration
    ) {
      errors.push(
        `Duration must be between ${config.generation.minDuration} and ${config.generation.maxDuration} seconds`
      );
    }
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
 * Create standardized error response
 */
export function createErrorResponse(code, details = null) {
  const errorMap = {
    VALIDATION_ERROR: {
      message: 'Invalid input parameters',
      statusCode: 400,
    },
    GENERATION_ERROR: {
      message: 'Music generation failed',
      statusCode: 500,
    },
    AUTH_ERROR: {
      message: 'Authentication failed - invalid API token',
      statusCode: 401,
    },
    RATE_LIMIT_ERROR: {
      message: 'Rate limit exceeded',
      statusCode: 429,
    },
    TIMEOUT_ERROR: {
      message: 'Generation timeout - request took too long',
      statusCode: 504,
    },
    NOT_FOUND: {
      message: 'Resource not found',
      statusCode: 404,
    },
    FILE_NOT_FOUND: {
      message: 'Audio file not found',
      statusCode: 404,
    },
    LIST_ERROR: {
      message: 'Failed to list generations',
      statusCode: 500,
    },
    GET_ERROR: {
      message: 'Failed to retrieve generation',
      statusCode: 500,
    },
    DELETE_ERROR: {
      message: 'Failed to delete generation',
      statusCode: 500,
    },
    DOWNLOAD_ERROR: {
      message: 'Failed to download audio file',
      statusCode: 500,
    },
    MODEL_ERROR: {
      message: 'Failed to retrieve model information',
      statusCode: 500,
    },
    STATS_ERROR: {
      message: 'Failed to retrieve statistics',
      statusCode: 500,
    },
  };

  const errorInfo = errorMap[code] || {
    message: 'An unexpected error occurred',
    statusCode: 500,
  };

  return {
    success: false,
    error: {
      code,
      message: errorInfo.message,
      ...(details && { details }),
    },
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data, message = null) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Sanitize log data (remove sensitive info)
 */
export function sanitizeForLog(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const clone = { ...obj };
  const sensitiveKeys = ['token', 'apiToken', 'password', 'secret'];

  for (const key of sensitiveKeys) {
    if (key in clone) {
      clone[key] = '***';
    }
  }

  return clone;
}
