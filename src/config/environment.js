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
  const warnings = [];

  // Critical: API token validation
  if (!config.replicate.apiToken) {
    if (config.env === 'production') {
      errors.push('REPLICATE_API_TOKEN is required in production');
    } else {
      warnings.push(
        'REPLICATE_API_TOKEN not set - music generation will fail. Get one at https://replicate.com/account'
      );
    }
  }

  // Validate token format (should start with r8_)
  if (config.replicate.apiToken && !config.replicate.apiToken.startsWith('r8_')) {
    warnings.push(
      'REPLICATE_API_TOKEN format looks invalid - should start with "r8_"'
    );
  }

  // Generation constraints
  if (config.generation.maxDuration > 30) {
    errors.push('MAX_GENERATION_DURATION cannot exceed 30 seconds (Replicate limit)');
  }

  if (config.generation.minDuration < 1) {
    errors.push('MIN_GENERATION_DURATION must be at least 1 second');
  }

  if (config.generation.minPromptLength < 5) {
    warnings.push('MIN_PROMPT_LENGTH < 5 characters may produce poor results');
  }

  if (config.generation.maxPromptLength > 1000) {
    warnings.push('MAX_PROMPT_LENGTH > 1000 may be truncated by the model');
  }

  // Rate limiting
  if (config.rateLimit.maxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
  }

  if (config.rateLimit.maxRequests > 100) {
    warnings.push(
      'RATE_LIMIT_MAX_REQUESTS > 100 may overwhelm the Replicate API'
    );
  }

  // Port validation
  if (config.port < 1024 && process.platform !== 'win32' && process.getuid && process.getuid() !== 0) {
    warnings.push(
      `PORT ${config.port} < 1024 requires root privileges on Unix systems`
    );
  }

  // CORS validation
  if (config.env === 'production' && config.cors.origin === 'http://localhost:3000') {
    warnings.push(
      'CORS_ORIGIN still set to localhost in production - update to your domain'
    );
  }

  // Storage validation
  if (config.storage.maxFileSize < 1024 * 1024) {
    warnings.push('MAX_FILE_SIZE < 1MB may be too small for audio files');
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
    console.warn('');
  }

  // Display errors and exit if any
  if (errors.length > 0) {
    console.error('\n❌ Configuration Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('');
    process.exit(1);
  }

  // Success message
  if (warnings.length === 0) {
    console.log('✅ Configuration validated successfully\n');
  }
}

validateConfig();

export default config;
