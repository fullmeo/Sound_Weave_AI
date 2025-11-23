# SoundWeave - Production-Ready Alternative to Udio

## Overview

**SoundWeave** is a production-ready alternative to Udio - a sophisticated REST API and CLI tool for AI music generation using Meta's open-source MusicGen model via Replicate API. With unrestricted downloads and full local storage control.

**Key Difference from Udio:**
- ✅ **Full Download Control** - No restrictions on downloading generated music
- ✅ **Local Storage** - Complete control over your audio files and metadata
- ✅ **Open Integration** - Easy to integrate into your projects
- ✅ **Cost Effective** - Pay-as-you-go Replicate pricing

**Features:**
- ✅ REST API for music generation
- ✅ CLI tool for batch operations
- ✅ Automatic audio file storage (WAV format)
- ✅ Complete metadata tracking and history
- ✅ Rate limiting & security hardening
- ✅ Comprehensive error handling
- ✅ Production-ready configuration

---

## Setup

### 1. Prerequisites

- Node.js 18+
- Replicate API account (free at https://replicate.com)
- Replicate API token

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
# Required
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Optional (defaults provided)
NODE_ENV=development
PORT=3000
STORAGE_PATH=./data
LOG_LEVEL=info
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

---

## Usage

### Via REST API

#### Start Server

```bash
npm start
```

Server runs at `http://localhost:3000`

#### Generate Music

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "uplifting orchestral music with strings",
    "duration": 15,
    "model": "large"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "prompt": "uplifting orchestral music with strings",
    "duration": 15,
    "model": "large",
    "audioUrl": "https://...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Generations

```bash
curl http://localhost:3000/api/generations?limit=10&offset=0
```

#### Get Specific Generation

```bash
curl http://localhost:3000/api/generations/550e8400-e29b-41d4-a716-446655440000
```

#### Download Audio

```bash
curl -O http://localhost:3000/api/generations/550e8400-e29b-41d4-a716-446655440000/download
```

#### Get Model Info

```bash
curl http://localhost:3000/api/models
```

#### Health Check

```bash
curl -X POST http://localhost:3000/api/health
```

### Via CLI

#### Generate Music

```bash
node cli/musicgen-cli.js generate \
  --prompt "lo-fi hip hop with nature sounds" \
  --duration 20 \
  --model large \
  --download
```

#### List Generations

```bash
node cli/musicgen-cli.js list --limit 15
```

#### Get Generation Details

```bash
node cli/musicgen-cli.js get <generation-id> --download
```

#### Delete Generation

```bash
node cli/musicgen-cli.js delete <generation-id>
```

#### View Statistics

```bash
node cli/musicgen-cli.js stats
```

#### Show Available Models

```bash
node cli/musicgen-cli.js models
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate music from prompt |
| GET | `/api/generations` | List all generations |
| GET | `/api/generations/:id` | Get specific generation |
| GET | `/api/generations/:id/download` | Download audio file |
| DELETE | `/api/generations/:id` | Delete generation |
| GET | `/api/models` | Get model information |
| GET | `/api/stats` | Get storage statistics |
| POST | `/api/health` | Health check |

---

## Configuration Reference

### Generation Constraints

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

### Rate Limiting (Default)

- **Window**: 60 seconds
- **Max Requests**: 10 per window
- **Exemptions**: Health check endpoint

### Error Codes

```
400 - VALIDATION_ERROR: Invalid parameters
401 - AUTH_ERROR: Authentication failed
404 - NOT_FOUND: Resource not found
429 - RATE_LIMIT_ERROR: Too many requests
500 - GENERATION_ERROR: Generation failed
504 - TIMEOUT_ERROR: Request timeout
```

---

## Architecture

```
SoundWeave/
├── src/
│   ├── api/
│   │   └── routes.js              # REST endpoints
│   ├── services/
│   │   ├── musicgen.service.js    # Replicate API integration
│   │   └── storage.service.js     # Audio file & metadata management
│   ├── utils/
│   │   └── validation.js          # Input validation & error responses
│   ├── config/
│   │   └── environment.js         # Configuration management
│   └── index.js                   # Express server
├── cli/
│   └── musicgen-cli.js            # Command-line interface
├── .claude/                       # Claude Code configuration
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── README.md                      # This file
└── data/                          # Generated audio & metadata
    ├── generations/               # WAV audio files
    └── metadata.json              # Metadata index
```

---

## Integration Examples

### Node.js Integration

```javascript
import { MusicGenService } from './src/services/musicgen.service.js';
import { StorageService } from './src/services/storage.service.js';

const musicGen = new MusicGenService();
const storage = new StorageService();

// Generate music
const result = await musicGen.generate({
  prompt: 'ambient electronic music',
  duration: 20,
  model: 'large'
});

// Save metadata
await storage.saveMetadata(result);

// Download audio
const audioInfo = await storage.downloadAudio(result.id, result.audioUrl);
```

### Integration with Your Projects

**SoundWeave integrates seamlessly with:**

**Ut Queant Laxis** (Vocal Analysis)
```javascript
// Analyze vocals, then generate complementary music
const prompt = await utQueantLaxis.analyze(vocalFile);
const music = await soundweave.generate(prompt);
```

**NeuralMix** (DJ Platform)
```javascript
// Generate multiple tracks for mixing
const tracks = await Promise.all([
  soundweave.generate({prompt: "upbeat electronic 120bpm"}),
  soundweave.generate({prompt: "chill ambient 120bpm"})
]);
const mix = await neuralMix.blend(tracks);
```

**ButterFiles** (File Management)
```javascript
// Auto-categorize generated music
const generations = await soundweave.list();
await butterfiles.organize(generations);
```

---

## Error Handling

All errors follow consistent format:

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

---

## Security

✅ **Implemented:**
- API keys server-side only
- Rate limiting
- CORS configured
- Helmet security headers
- Request validation
- Timeout protection
- Graceful error responses

✅ **Production Considerations:**
- Use environment variables for secrets
- Enable HTTPS in production
- Increase rate limits if needed
- Monitor logs for suspicious activity

---

## Development

```bash
# Development mode (auto-reload)
npm run dev

# Linting
npm run lint

# Format code
npm run format
```

---

## License

MIT

---

## Support

For issues or questions:
1. Check error logs: `LOG_LEVEL=debug`
2. Verify Replicate API token is valid
3. Check rate limiting constraints
4. Ensure storage path is writable
