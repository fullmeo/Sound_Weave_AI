/**
 * Request ID middleware for request correlation and tracing
 *
 * Adds a unique ID to each request for:
 * - Log correlation across services
 * - Debugging and troubleshooting
 * - Performance tracking
 */
import { randomUUID } from 'crypto';

/**
 * Request ID middleware
 *
 * Generates or uses existing request ID from header
 * Sets it on the request object and response header
 */
export function requestIdMiddleware(req, res, next) {
  // Use existing request ID from header if provided
  // Otherwise generate new UUID
  const requestId = req.headers['x-request-id'] ||
                    req.headers['x-correlation-id'] ||
                    randomUUID();

  // Attach to request object
  req.id = requestId;

  // Add to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);

  // Also set correlation ID header
  res.setHeader('X-Correlation-ID', requestId);

  next();
}

/**
 * Get request ID from request object
 * Safe accessor that always returns a string
 */
export function getRequestId(req) {
  return req.id || 'unknown';
}
