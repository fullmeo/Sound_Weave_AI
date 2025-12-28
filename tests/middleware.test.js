import { describe, it } from 'node:test';
import assert from 'node:assert';
import { requestIdMiddleware, getRequestId } from '../src/middleware/requestId.js';
import { createError } from '../src/middleware/errorHandler.js';

describe('Request ID Middleware', () => {
  it('should generate request ID if not provided', () => {
    const req = { headers: {} };
    const res = {
      setHeader: function(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
      headers: {}
    };

    requestIdMiddleware(req, res, () => {});

    assert.ok(req.id, 'Request should have ID');
    assert.strictEqual(typeof req.id, 'string');
    assert.strictEqual(res.headers['X-Request-ID'], req.id);
    assert.strictEqual(res.headers['X-Correlation-ID'], req.id);
  });

  it('should use existing x-request-id header', () => {
    const existingId = 'test-123-456';
    const req = {
      headers: { 'x-request-id': existingId }
    };
    const res = {
      setHeader: function(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
      headers: {}
    };

    requestIdMiddleware(req, res, () => {});

    assert.strictEqual(req.id, existingId);
    assert.strictEqual(res.headers['X-Request-ID'], existingId);
  });

  it('should use x-correlation-id if x-request-id not present', () => {
    const correlationId = 'correlation-789';
    const req = {
      headers: { 'x-correlation-id': correlationId }
    };
    const res = {
      setHeader: function(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
      headers: {}
    };

    requestIdMiddleware(req, res, () => {});

    assert.strictEqual(req.id, correlationId);
  });

  it('getRequestId should return id or unknown', () => {
    const reqWithId = { id: 'test-id' };
    const reqWithoutId = {};

    assert.strictEqual(getRequestId(reqWithId), 'test-id');
    assert.strictEqual(getRequestId(reqWithoutId), 'unknown');
  });
});

describe('Error Creation', () => {
  it('should create error with code and status', () => {
    const error = createError('VALIDATION_ERROR', 'Invalid input');

    assert.strictEqual(error.message, 'Invalid input');
    assert.strictEqual(error.code, 'VALIDATION_ERROR');
    assert.strictEqual(error.statusCode, 400);
  });

  it('should create error with details', () => {
    const details = ['Field A is required', 'Field B is invalid'];
    const error = createError('VALIDATION_ERROR', 'Validation failed', details);

    assert.strictEqual(error.code, 'VALIDATION_ERROR');
    assert.deepStrictEqual(error.details, details);
  });

  it('should use default message if not provided', () => {
    const error = createError('AUTH_ERROR');

    assert.ok(error.message.includes('Authentication'));
    assert.strictEqual(error.code, 'AUTH_ERROR');
    assert.strictEqual(error.statusCode, 401);
  });

  it('should handle unknown error codes', () => {
    const error = createError('UNKNOWN_CODE', 'Custom message');

    assert.strictEqual(error.message, 'Custom message');
    assert.strictEqual(error.code, 'UNKNOWN_CODE');
    assert.strictEqual(error.statusCode, 500);
  });
});
