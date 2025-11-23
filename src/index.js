import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import config from './config/environment.js';
import apiRoutes, { initializeServices } from './api/routes.js';

const app = express();
const logger = pino({
  level: config.logging.level,
  transport: config.logging.prettyPrint
    ? { target: 'pino-pretty' }
    : undefined,
});

// Logging middleware
app.use(pinoHttp({ logger }));

// Security middleware
app.use(helmet());

// Trust proxy if configured
if (config.security.trustProxy) {
  app.set('trust proxy', 1);
}

// CORS
app.use(cors(config.cors));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

app.use('/api/', limiter);

// Initialize services
initializeServices();

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error({ error: err, path: req.path }, 'Unhandled error');

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.env === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
});

// Start server
const PORT = config.port;
const HOST = config.host;

const server = app.listen(PORT, HOST, () => {
  logger.info(
    { host: HOST, port: PORT, env: config.env },
    `🎵 MusicGen Wrapper listening on http://${HOST}:${PORT}`
  );

  logger.info(
    {
      replicate: !!config.replicate.apiToken,
      storagePath: config.storage.basePath,
    },
    'Services initialized'
  );
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
