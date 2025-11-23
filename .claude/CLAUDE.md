# CLAUDE.md - SoundWeave Project Instructions

## Project Overview

**SoundWeave** is a production-ready alternative to Udio - a sophisticated REST API and CLI tool for AI music generation featuring:
- Meta's MusicGen model via Replicate API
- Full download control with no restrictions
- Complete local storage management
- REST API with 8 endpoints
- Comprehensive CLI tool
- Ready for integration with other music projects

## Core Technologies

- **Backend**: Node.js 18+, Express.js
- **API Integration**: Replicate API (MusicGen)
- **Storage**: Local file system (WAV + JSON metadata)
- **Architecture**: Modular service-based design
- **CLI**: Yargs with comprehensive commands

## Code Style & Standards

### JavaScript
- ES6+ modules (type: "module" in package.json)
- Async/await for all async operations
- Service-based architecture (MusicGenService, StorageService)
- Comprehensive error handling with custom error codes
- Structured logging with Pino

### API Design
- RESTful endpoints with consistent naming
- Standardized response format: `{success, data/error}`
- HTTP status codes matching error types
- Rate limiting (10 req/min default)
- Input validation with Joi schemas

### Documentation
- Clear inline comments for complex logic
- JSDoc-style function documentation
- Comprehensive README and guides
- Architecture documentation with diagrams
- Integration examples for each use case

## File Structure

```
Sound_Weave_AI/
├── src/
│   ├── api/routes.js           # REST API endpoints
│   ├── services/
│   │   ├── musicgen.service.js # Replicate integration
│   │   └── storage.service.js  # File & metadata management
│   ├── utils/validation.js     # Input validation & errors
│   ├── config/environment.js   # Configuration management
│   └── index.js                # Express server entry
├── cli/musicgen-cli.js         # Command-line interface
├── data/                       # Generated files (gitignored)
│   ├── generations/            # WAV audio files
│   └── metadata.json           # Metadata index
├── .claude/                    # Claude Code configuration
├── .env.example                # Environment template
├── package.json
└── *.md                        # Documentation
```

## Key Modules

### 1. MusicGen Service (`src/services/musicgen.service.js`)
- Replicate API integration
- Prediction creation and polling
- Parameter validation
- Timeout and retry logic
- Model information

### 2. Storage Service (`src/services/storage.service.js`)
- Audio file downloading
- Metadata persistence (JSON)
- CRUD operations
- Statistics tracking
- File management

### 3. REST API Routes (`src/api/routes.js`)
- 8 endpoints (generate, list, get, download, delete, models, stats, health)
- Request validation
- Rate limiting
- Error handling middleware
- Response formatting

### 4. CLI Tool (`cli/musicgen-cli.js`)
- 6 commands (generate, list, get, delete, stats, models)
- Interactive prompts
- Progress indicators
- Formatted output
- Auto-download option

### 5. Validation & Config
- `validation.js` - Joi schemas, error responses
- `environment.js` - Configuration management with defaults

## Development Guidelines

### Adding New Features

1. **Service Method**: Add to appropriate service class
2. **API Route**: Create endpoint in `routes.js`
3. **CLI Command**: Add command in `musicgen-cli.js`
4. **Validation**: Define Joi schema in `validation.js`
5. **Documentation**: Update README and relevant guides
6. **Testing**: Manual testing with real API calls

### Service Pattern

```javascript
class MusicGenService {
  async methodName(params) {
    try {
      // Validate
      const validation = this.validateParams(params);
      if (!validation.isValid) {
        throw new Error('VALIDATION_ERROR');
      }

      // Execute
      const result = await this.executeOperation(params);

      // Log
      logger.info('Operation successful', { params, result });

      return result;
    } catch (error) {
      logger.error('Operation failed', { error, params });
      throw error;
    }
  }
}
```

### Error Handling

```javascript
// Throw errors with specific codes
if (invalid) {
  const error = new Error('Validation failed');
  error.code = 'VALIDATION_ERROR';
  throw error;
}

// Handle in routes
try {
  const result = await service.method(params);
  res.json({ success: true, data: result });
} catch (error) {
  const statusCode = getStatusCode(error.code);
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });
}
```

## API Development

### Standard Response Format

```javascript
// Success
{
  success: true,
  data: { /* result object */ }
}

// Error
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details: [] // Optional array of detail strings
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid input parameters
- `AUTH_ERROR` (401) - Missing or invalid API token
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMIT_ERROR` (429) - Too many requests
- `GENERATION_ERROR` (500) - Generation failed
- `TIMEOUT_ERROR` (504) - Request timeout

### Adding New Endpoint

```javascript
// In routes.js
router.post('/api/new-endpoint', async (req, res) => {
  try {
    // Validate
    const { error, value } = validateInput(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details
        }
      });
    }

    // Execute
    const result = await service.performOperation(value);

    // Respond
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
});
```

## Configuration Management

### Environment Variables

```bash
# Required
REPLICATE_API_TOKEN=r8_...     # From https://replicate.com/account

# Optional (with defaults)
NODE_ENV=development            # development | production
PORT=3000                       # Server port
STORAGE_PATH=./data             # Storage location
LOG_LEVEL=info                  # debug | info | warn | error
RATE_LIMIT_WINDOW=60000         # Rate limit window (ms)
RATE_LIMIT_MAX_REQUESTS=10      # Max requests per window
```

### Config Access

```javascript
import config from './config/environment.js';

// Access values
const port = config.port;
const token = config.replicate.apiToken;
const maxDuration = config.generation.maxDuration;
```

## Integration Examples

### Node.js Integration

```javascript
import { MusicGenService } from './src/services/musicgen.service.js';
import { StorageService } from './src/services/storage.service.js';

const musicGen = new MusicGenService();
const storage = new StorageService();

// Generate music
const generation = await musicGen.generate({
  prompt: 'uplifting orchestral with strings',
  duration: 15,
  model: 'large'
});

// Download audio
const audioFile = await storage.downloadAudio(
  generation.id,
  generation.audioUrl
);

console.log('Saved to:', audioFile.filePath);
```

### Integration with Ut Queant Laxis

```javascript
// Analyze vocals, generate complementary music
const vocalAnalysis = await utQueantLaxis.analyze(vocalFile);
const prompt = `${vocalAnalysis.genre} music, ${vocalAnalysis.bpm} bpm, ${vocalAnalysis.energy} energy`;
const music = await soundweave.generate({ prompt, duration: 30 });
```

### Integration with NeuralMix

```javascript
// Generate multiple tracks with matching BPM
const tracks = await Promise.all([
  soundweave.generate({ prompt: 'upbeat electronic 120bpm', duration: 30 }),
  soundweave.generate({ prompt: 'chill ambient 120bpm', duration: 30 })
]);
await neuralMix.loadTracks(tracks);
```

### Integration with ButterFiles

```javascript
// Auto-organize generated music
const generations = await soundweave.storage.list({ limit: 100 });
await butterfiles.organize(generations, {
  by: ['genre', 'duration', 'date'],
  destination: './organized-music'
});
```

## Testing Guidelines

### Manual Testing Flow

```bash
# 1. Setup
cp .env.example .env
# Edit .env with your REPLICATE_API_TOKEN
npm install

# 2. Start server
npm start

# 3. Test generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "epic orchestral", "duration": 10, "model": "small"}'

# 4. Test CLI
node cli/musicgen-cli.js generate --prompt "jazz piano" --duration 10

# 5. Verify files
ls -lh data/generations/
cat data/metadata.json
```

### Edge Cases to Test

- Empty/invalid prompts
- Duration out of range (< 5 or > 30)
- Invalid model names
- Rate limiting (11+ requests in 1 minute)
- Network timeouts
- Missing API token
- Disk space issues
- Concurrent requests

## Performance Optimization

### API Performance
- Keep request validation < 10ms
- Use streaming for file downloads
- Implement pagination for list endpoints
- Cache model information
- Connection pooling for Replicate API

### Storage Optimization
- Store only essential metadata
- Implement cleanup for old generations
- Monitor disk space usage
- Consider compression for archives
- Lazy-load metadata on startup

### Resource Management
- Set timeouts on all external requests
- Limit concurrent Replicate requests
- Implement exponential backoff
- Monitor memory usage
- Graceful shutdown handling

## Security Best Practices

### API Token Security
- ❌ NEVER commit .env file
- ❌ NEVER log API tokens
- ✅ Use environment variables only
- ✅ Rotate tokens regularly
- ✅ Use separate tokens for dev/prod

### Input Security
- ✅ Validate all inputs with Joi
- ✅ Sanitize file paths
- ✅ Limit string lengths
- ✅ Check numeric ranges
- ✅ Prevent path traversal

### API Security
- ✅ Enable rate limiting
- ✅ Configure CORS properly
- ✅ Use Helmet for headers
- ✅ Implement request timeouts
- ✅ Hide error stack traces in production

### File Security
- ✅ Validate file extensions
- ✅ Check file sizes
- ✅ Set proper file permissions
- ✅ Sanitize filenames
- ✅ Prevent directory traversal

## Common Tasks

### Add New CLI Command

```javascript
// In cli/musicgen-cli.js
.command('new-command', 'Description', {
  // Define options
  option1: {
    type: 'string',
    demandOption: true,
    describe: 'Option description'
  }
}, async (argv) => {
  try {
    // Execute command logic
    const result = await performOperation(argv.option1);
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})
```

### Add Validation Schema

```javascript
// In validation.js
export const newValidationSchema = Joi.object({
  field1: Joi.string().min(10).max(100).required(),
  field2: Joi.number().min(5).max(30).required(),
  field3: Joi.string().valid('option1', 'option2', 'option3')
});

export function validateNewInput(data) {
  const { error, value } = newValidationSchema.validate(data);
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : [],
    value
  };
}
```

### Add Service Method

```javascript
// In appropriate service class
async newMethod(params) {
  try {
    // Validate
    this.validateParams(params);

    // Execute logic
    const result = await this.performOperation(params);

    // Log success
    logger.info('Operation completed', { params, result });

    return result;
  } catch (error) {
    logger.error('Operation failed', { error, params });
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

**API Token Invalid**
- Verify token in .env file
- Check token hasn't expired
- Ensure no extra spaces
- Test token at https://replicate.com/account

**Generation Timeout**
- Check Replicate API status
- Increase timeout in config
- Try smaller duration
- Use 'small' model for testing

**Storage Errors**
- Verify STORAGE_PATH is writable
- Check disk space
- Ensure proper permissions
- Check file path in config

**Rate Limit Hit**
- Wait 60 seconds
- Reduce requests per minute
- Increase RATE_LIMIT_MAX_REQUESTS
- Implement request queuing

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Watch mode for development
npm run dev

# Check logs
tail -f logs/app.log  # if logging to file
```

## Deployment Considerations

### Development
```bash
NODE_ENV=development npm run dev
```

### Production
```bash
# Set production env vars
NODE_ENV=production
PORT=8080
LOG_LEVEL=info

# Run with process manager
pm2 start src/index.js --name soundweave

# Or with systemd
systemctl start soundweave
```

### Environment Checklist
- [ ] Set REPLICATE_API_TOKEN
- [ ] Configure STORAGE_PATH with enough space
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS in production
- [ ] Configure CORS for your domain
- [ ] Set up log rotation
- [ ] Monitor disk usage
- [ ] Set up health check monitoring

## Project Goals

1. **Unrestricted Downloads**: Full control over generated music files
2. **Local Storage**: Complete ownership of audio and metadata
3. **Production Ready**: Robust error handling and validation
4. **Easy Integration**: Simple API for other music projects
5. **Developer Friendly**: Clear documentation and examples

## Resources

- **Replicate API**: https://replicate.com/meta/musicgen
- **MusicGen Paper**: https://arxiv.org/abs/2306.05284
- **Express.js**: https://expressjs.com/
- **Pino Logger**: https://getpino.io/
- **Joi Validation**: https://joi.dev/

## Quick Commands

```bash
# Development
npm start                    # Start server
npm run dev                  # Start with auto-reload
npm run lint                 # Check code quality
npm run format               # Format code

# CLI Usage
npm run cli generate -- --prompt "..." --duration 15
npm run cli list
npm run cli stats

# Git
git checkout -b feature/name # New feature branch
git commit -m "feat: message" # Conventional commits
git push origin branch       # Push changes
```

## Integration Compatibility

SoundWeave is designed to integrate with:
- ✅ **Ut Queant Laxis** - Vocal analysis → music generation
- ✅ **NeuralMix** - Generate tracks for DJ mixing
- ✅ **ButterFiles** - Organize generated music files
- ✅ **Any Node.js project** - Import services directly
- ✅ **External apps** - Use REST API

---

**Remember**: SoundWeave provides unrestricted download access to AI-generated music. Every generation is stored locally with complete metadata. Code with clarity and document thoroughly. 🎵✨
