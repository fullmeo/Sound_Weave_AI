/**
 * Centralized error handling middleware
 *
 * Provides consistent error responses and logging across all routes
 */
import pino from 'pino';
import config from '../config/environment.js';

const logger = pino({
  level: config.logging.level,
  transport: config.logging.prettyPrint ? { target: 'pino-pretty' } : undefined,
});

/**
 * Error code to HTTP status mapping
 */
const ERROR_STATUS_MAP = {
  VALIDATION_ERROR: 400,
  AUTH_ERROR: 401,
  NOT_FOUND: 404,
  FILE_NOT_FOUND: 404,
  RATE_LIMIT_ERROR: 429,
  GENERATION_ERROR: 500,
  LIST_ERROR: 500,
  GET_ERROR: 500,
  DELETE_ERROR: 500,
  DOWNLOAD_ERROR: 500,
  MODEL_ERROR: 500,
  STATS_ERROR: 500,
  TIMEOUT_ERROR: 504,
};

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MESSAGE_MAP = {
  VALIDATION_ERROR: 'Invalid input parameters',
  AUTH_ERROR: 'Authentication failed - invalid API token',
  NOT_FOUND: 'Resource not found',
  FILE_NOT_FOUND: 'Audio file not found',
  RATE_LIMIT_ERROR: 'Too many requests - please slow down',
  GENERATION_ERROR: 'Music generation failed',
  LIST_ERROR: 'Failed to list generations',
  GET_ERROR: 'Failed to retrieve generation',
  DELETE_ERROR: 'Failed to delete generation',
  DOWNLOAD_ERROR: 'Failed to download audio file',
  MODEL_ERROR: 'Failed to retrieve model information',
  STATS_ERROR: 'Failed to retrieve statistics',
  TIMEOUT_ERROR: 'Request timeout - operation took too long',
};

/**
 * Main error handling middleware
 */
export function errorHandler(err, req, res, next) {
  // Extract request correlation ID
  const requestId = req.id || 'unknown';

  // Determine error code and status
  const errorCode = err.code || 'INTERNAL_ERROR';
  const statusCode = err.statusCode || ERROR_STATUS_MAP[errorCode] || 500;

  // Log error with context
  logger.error({
    err: {
      message: err.message,
      code: errorCode,
      stack: err.stack,
    },
    requestId,
    path: req.path,
    method: req.method,
    statusCode,
  }, 'Request error');

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: ERROR_MESSAGE_MAP[errorCode] || err.message || 'An unexpected error occurred',
    },
    requestId,
  };

  // Add details if available (e.g., validation errors)
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  // In development, include stack trace
  if (config.env === 'development' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  const requestId = req.id || 'unknown';

  logger.warn({
    requestId,
    path: req.path,
    method: req.method,
  }, 'Route not found');

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    requestId,
  });
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes to error middleware
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create custom error with code
 */
export function createError(code, message, details = null) {
  const error = new Error(message || ERROR_MESSAGE_MAP[code] || 'Unknown error');
  error.code = code;
  error.statusCode = ERROR_STATUS_MAP[code] || 500;
  if (details) {
    error.details = details;
  }
  return error;
}
