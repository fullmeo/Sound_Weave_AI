import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // API Configuration
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
    baseUrl: 'https://api.replicate.com/v1',
    model: 'meta/musicgen',
    timeout: 120000, // 2 minutes
    maxRetries: 3,
    retryDelay: 2000, // exponential backoff
  },

  // Storage Configuration
  storage: {
    basePath: process.env.STORAGE_PATH || path.join(__dirname, '../data'),
    generationsDir: 'generations',
    metadataFile: 'metadata.json',
    maxFileSize: 52428800, // 50MB
  },

  // Generation Configuration
  generation: {
    maxPromptLength: parseInt(process.env.MAX_PROMPT_LENGTH || '500', 10),
    minPromptLength: 10,
    maxDuration: parseInt(process.env.MAX_GENERATION_DURATION || '30', 10),
    minDuration: 5,
    defaultDuration: 10,
    defaultModel: 'large',
    allowedModels: ['small', 'medium', 'large'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
  },

  // Security
  security: {
    trustProxy: process.env.TRUST_PROXY === 'true',
    csrfProtection: process.env.NODE_ENV === 'production',
  },
};

// Validation
function validateConfig() {
  const errors = [];

  if (!config.replicate.apiToken && config.env === 'production') {
    errors.push('REPLICATE_API_TOKEN is required in production');
  }

  if (config.generation.maxDuration > 30) {
    errors.push('MAX_GENERATION_DURATION cannot exceed 30 seconds');
  }

  if (config.generation.minPromptLength < 5) {
    errors.push('MIN_PROMPT_LENGTH should be at least 5 characters');
  }

  if (config.rateLimit.maxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
  }

  if (errors.length > 0) {
    console.error('Configuration Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}

validateConfig();

export default config;
