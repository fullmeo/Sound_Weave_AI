# CLAUDE.md - SoundWeave Project Instructions

## Project Overview

**SoundWeave** is a production-ready alternative to Udio - a sophisticated REST API and CLI tool for AI music generation using Meta's open-source MusicGen model via Replicate API with unrestricted downloads and full local storage control.

**Key Differentiators:**
- ✅ Full Download Control - No restrictions on downloading generated music
- ✅ Local Storage - Complete control over your audio files and metadata
- ✅ Open Integration - Easy integration into other projects
- ✅ Cost Effective - Pay-as-you-go Replicate pricing

## Core Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI Model**: Meta MusicGen (via Replicate API)
- **Storage**: Local file system (WAV format) + JSON metadata
- **CLI**: Yargs-based command-line interface
- **Validation**: Joi schema validation
- **Logging**: Pino logger with pretty formatting
- **Security**: Helmet, CORS, rate limiting, express-rate-limit

## Code Style & Standards

### JavaScript
- ES6+ syntax with async/await
- Modular service-based architecture
- Comprehensive error handling with try-catch
- Structured logging with Pino
- Input validation before processing
- Graceful error responses with HTTP status codes

### Error Handling Format
```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details: ["Additional context if applicable"]
  }
}
```

### Validation
- Use Joi for schema validation
- Return 400 status for validation errors
- Provide meaningful error messages
- Log validation failures for debugging

### Services
All services should follow this pattern:
```javascript
export class ServiceName {
  constructor() {
    this.logger = createLogger('ServiceName');
  }

  async methodName(params) {
    try {
      // Implementation
      this.logger.info(`Operation successful`);
      return result;
    } catch (error) {
      this.logger.error({ error, context: 'methodName' });
      throw error;
    }
  }
}
```

## File Structure

```
SoundWeave/
├── .claude/                           # Claude Code configuration
│   ├── CLAUDE.md                      # This file
│   ├── settings.local.json            # Claude workspace settings
│   └── (commands/, hooks/ as needed)
├── src/                               # Source code
│   ├── api/
│   │   └── routes.js                  # REST API endpoints
│   ├── services/
│   │   ├── musicgen.service.js        # Replicate API integration
│   │   └── storage.service.js         # File & metadata management
│   ├── config/
│   │   └── environment.js             # Configuration management
│   ├── utils/
│   │   └── validation.js              # Validation schemas & error responses
│   └── index.js                       # Express server entry point
├── cli/
│   └── musicgen-cli.js                # CLI interface
├── data/                              # Generated audio and metadata
│   ├── generations/                   # WAV audio files
│   └── metadata.json                  # Metadata index
├── debug/                             # Debug tools and reports
├── .env.example                       # Environment template
├── .env                               # Environment configuration (DO NOT COMMIT)
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependencies
├── package-lock.json                  # Lock file
├── README.md                          # User documentation
├── ARCHITECTURE.md                    # Architecture documentation
├── SECURITY.md                        # Security guidelines
├── CONTRIBUTING.md                    # Contribution guidelines
└── LICENSE                            # MIT License
```

## Key Modules

### 1. MusicGen Service (`src/services/musicgen.service.js`)
- Validates generation parameters (prompt, duration, model)
- Creates Replicate API predictions
- Polls for generation completion with exponential backoff
- Handles timeouts (max 5 minutes per request)
- Provides model information

**Key Methods:**
- `validateGenerationParams(params)` - Validate input parameters
- `generate(params)` - Create and manage generation
- `createPrediction(input, model)` - Create Replicate prediction
- `pollPrediction(id)` - Poll for completion
- `getModelInfo()` - Get available models and limits

### 2. Storage Service (`src/services/storage.service.js`)
- Downloads audio files from Replicate
- Persists metadata to JSON
- Manages CRUD operations
- Provides file listing and filtering
- Tracks storage statistics

**Key Methods:**
- `downloadAudio(id, url)` - Download and save audio
- `saveMetadata(generation)` - Store generation metadata
- `loadMetadata()` - Load all generations
- `getMetadata(id)` - Get specific generation
- `list(options)` - List with pagination
- `delete(id)` - Delete generation
- `getStats()` - Get storage statistics

### 3. REST API (`src/api/routes.js`)
Endpoints:
- `POST /api/generate` - Generate music from prompt
- `GET /api/generations` - List all generations with pagination
- `GET /api/generations/:id` - Get generation details
- `GET /api/generations/:id/download` - Download audio file
- `DELETE /api/generations/:id` - Delete generation
- `GET /api/models` - Get model information
- `GET /api/stats` - Get storage statistics
- `POST /api/health` - Health check

### 4. CLI Tool (`cli/musicgen-cli.js`)
Commands:
- `generate` - Create music with options
- `list` - List generations with filters
- `get <id>` - Fetch generation details
- `delete <id>` - Delete generation
- `stats` - Show storage statistics
- `models` - Display available models

## Development Guidelines

### Adding New Features

1. **Create Service**: `src/services/feature-name.service.js`
   - Implement business logic
   - Add comprehensive error handling
   - Log important operations
   - Use Joi validation where needed

2. **Add API Endpoint**: Update `src/api/routes.js`
   - Define route with method and path
   - Implement handler function
   - Validate input
   - Return standardized response
   - Handle errors with appropriate status codes

3. **Update CLI**: Modify `cli/musicgen-cli.js`
   - Add command with description
   - Implement options with yargs
   - Call appropriate service method
   - Format output for users

4. **Documentation**: Update relevant files
   - README.md for user-facing features
   - ARCHITECTURE.md for structural changes
   - Comments in code for complex logic

### Error Handling Pattern

```javascript
try {
  // Operation
  logger.info('Operation successful');
  return result;
} catch (error) {
  logger.error({ error, context: 'methodName' });

  if (error.code === 'VALIDATION_ERROR') {
    throw { statusCode: 400, ...error };
  } else if (error.code === 'TIMEOUT_ERROR') {
    throw { statusCode: 504, ...error };
  } else {
    throw { statusCode: 500, ...error };
  }
}
```

### Environment Configuration

```env
# Required
REPLICATE_API_TOKEN=your_token_here

# Optional (defaults provided)
NODE_ENV=development
PORT=3000
STORAGE_PATH=./data
LOG_LEVEL=info
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## Generation Constraints

```javascript
{
  maxPromptLength: 500,        // characters
  minPromptLength: 10,         // characters
  maxDuration: 30,             // seconds
  minDuration: 5,              // seconds
  defaultDuration: 10,         // seconds
  allowedModels: ['small', 'medium', 'large']
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "prompt": "...",
    "duration": 10,
    "model": "large",
    "audioUrl": "https://...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": ["Additional info if applicable"]
  }
}
```

## Security Checklist

### Input Security
- ✅ Schema validation with Joi
- ✅ Length constraints on prompts
- ✅ Type checking for parameters
- ✅ Sanitization of user input

### API Security
- ✅ Rate limiting (10 requests/minute default)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Error message masking

### Data Security
- ✅ API keys in environment variables only
- ✅ No credential logging
- ✅ Secure file permissions
- ✅ Timeout protection on requests

### Production Considerations
- Use HTTPS only
- Increase rate limits based on usage
- Monitor error logs for suspicious activity
- Use environment-specific configurations
- Enable request logging
- Set up log aggregation

## Integration Points

### With Ut Queant Laxis (Vocal Analysis)
```javascript
// Analyze vocals, generate complementary music
const vocalAnalysis = await utQueantLaxis.analyze(vocalFile);
const music = await soundweave.generate({
  prompt: vocalAnalysis.generatePrompt(),
  duration: 15
});
```

### With NeuralMix (DJ Platform)
```javascript
// Generate multiple tracks for mixing
const tracks = await Promise.all([
  soundweave.generate({prompt: "upbeat electronic 120bpm"}),
  soundweave.generate({prompt: "chill ambient 120bpm"})
]);
const mix = await neuralMix.blend(tracks);
```

### With ButterFiles (File Management)
```javascript
// Auto-categorize generated music
const generations = await soundweave.list();
await butterfiles.organize(generations);
```

## Common Tasks

### Add New API Endpoint

1. Define validation schema in `src/utils/validation.js`
2. Implement handler in `src/api/routes.js`
3. Call service method
4. Return standardized response
5. Add error handling

### Add Generation Parameter

1. Update validation in `MusicGenService`
2. Add parameter to Replicate payload
3. Store in metadata
4. Update API documentation
5. Update CLI options

### Add Storage Feature

1. Implement method in `StorageService`
2. Add persistence logic
3. Handle file system errors
4. Update metadata.json
5. Add to list/filter operations

## Testing Guidelines

### Manual Testing

```bash
# Development mode
npm run dev

# API Testing
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"ambient music","duration":10,"model":"medium"}'

# CLI Testing
node cli/musicgen-cli.js generate --prompt "lo-fi hip hop" --duration 15

# Health Check
curl -X POST http://localhost:3000/api/health
```

### Verification Steps

1. Test with valid inputs
2. Test with invalid inputs
3. Verify error responses
4. Check storage and metadata
5. Verify rate limiting
6. Test API responses

## Deployment Checklist

### Pre-Deployment
- [ ] Test all endpoints
- [ ] Verify environment variables
- [ ] Check error handling
- [ ] Review security settings
- [ ] Validate rate limits
- [ ] Test storage paths
- [ ] Review logs

### Deployment Steps
1. Set environment variables
2. Install dependencies: `npm install`
3. Create storage directory
4. Start server: `npm start`
5. Verify health check
6. Monitor logs

### Post-Deployment
- [ ] Verify API responses
- [ ] Check storage
- [ ] Monitor error logs
- [ ] Test generation
- [ ] Validate downloads

## Quick Commands

```bash
# Development
npm start                    # Start server
npm run dev                  # Start with auto-reload
npm run lint                 # Check code style
npm run format               # Format code

# CLI
npm run cli generate -- --prompt "..." --duration 15
npm run cli list
npm run cli get <id>

# Git
git checkout -b feature/name # New feature branch
git add .                    # Stage changes
git commit -m "type: message" # Conventional commits
git push origin feature      # Push changes

# GitHub
gh pr create --title "..." --body "..." # Create PR
```

## Common Issues & Solutions

### "REPLICATE_API_TOKEN not found"
**Solution**: Check `.env` file exists and has valid token
```bash
cp .env.example .env
# Edit .env with your token
```

### "Generation timeout"
**Solution**: Large model takes 60-90s. Increase timeout in environment.
```javascript
REPLICATE_TIMEOUT=180000 // 3 minutes
```

### "Storage path not writable"
**Solution**: Check directory permissions
```bash
mkdir -p data/generations
chmod 755 data
```

### "Rate limit exceeded"
**Solution**: Reduce request frequency or increase limit in `.env`
```env
RATE_LIMIT_MAX_REQUESTS=20
```

## Project Goals

1. **Production Ready** - Fully functional music generation API
2. **User Friendly** - Easy REST API and CLI interface
3. **Flexible** - Easily integrate into other projects
4. **Secure** - Input validation, rate limiting, error handling
5. **Maintainable** - Clean code, modular design, good documentation
6. **Scalable** - Support for growth without architectural changes

## Resources

- **MusicGen Documentation**: https://github.com/facebookresearch/audiocraft
- **Replicate API**: https://replicate.com/meta/musicgen
- **Express.js**: https://expressjs.com
- **Yargs CLI**: https://yargs.js.org
- **Joi Validation**: https://joi.dev
- **Pino Logging**: https://getpino.io

## CI/CD with Claude Code

### Automated Workflows
- Code quality checks
- Error handling validation
- Security audit
- Documentation updates
- Performance optimization

### GitHub Actions
Relevant workflows for SoundWeave:
- API testing on PR
- Storage validation
- CLI functionality test
- Security scan

---

**Remember**: SoundWeave is a production-ready music generation platform. Maintain code quality, thorough error handling, and clear documentation. Code with purpose. 🎵✨
