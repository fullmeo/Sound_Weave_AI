# SoundWeave Architecture

## System Overview

```
┌─────────────────────────────────────────────┐
│           CLIENT LAYER                      │
│  REST API        │         CLI              │
├─────────────────────────────────────────────┤
│      MIDDLEWARE (Validation, Rate Limit)    │
├─────────────────────────────────────────────┤
│    MusicGen Service   │   Storage Service   │
├─────────────────────────────────────────────┤
│  Replicate API   │    Local File System     │
└─────────────────────────────────────────────┘
```

## Layer-by-Layer Breakdown

### 1. Client Layer

#### REST API Endpoints
- `POST /api/generate` - Create generation
- `GET /api/generations` - List with pagination
- `GET /api/generations/:id` - Get details
- `GET /api/generations/:id/download` - Download audio
- `DELETE /api/generations/:id` - Delete
- `GET /api/models` - Model info
- `GET /api/stats` - Statistics
- `POST /api/health` - Health check

#### CLI Tool
- `generate` - Create with options
- `list` - List with filters
- `get <id>` - Fetch details
- `delete <id>` - Remove
- `stats` - Show statistics
- `models` - Display models

### 2. Middleware Layer

#### Rate Limiting
- 10 requests/minute (configurable)
- Per-client tracking
- Exponential backoff on excess

#### Input Validation
- Prompt: 10-500 characters
- Duration: 5-30 seconds
- Model: small|medium|large
- Return 400 for invalid input

#### Error Handling
- Catch all errors
- Standardized responses
- Meaningful messages
- HTTP status codes

#### CORS & Security
- Origin restriction
- Helmet headers
- XSS protection
- CSRF tokens

### 3. Application Layer

#### MusicGenService

**Responsibilities:**
- Validate generation parameters
- Create Replicate predictions
- Poll for completion
- Handle timeouts and retries
- Provide model information

**Key Methods:**
```javascript
validateGenerationParams(params) → {isValid, errors}
generate(params) → {id, status, audioUrl, ...}
createPrediction(input, model) → prediction
pollPrediction(id, generationId) → result
getModelInfo() → {models, limits, ...}
```

**Error Handling:**
- VALIDATION_ERROR (400)
- AUTH_ERROR (401)
- RATE_LIMIT_ERROR (429)
- TIMEOUT_ERROR (504)
- GENERATION_ERROR (500)

#### StorageService

**Responsibilities:**
- Download audio files
- Persist metadata
- CRUD operations
- File management
- Statistics tracking

**Key Methods:**
```javascript
downloadAudio(id, url) → {filePath, size}
saveMetadata(generation) → void
loadMetadata() → [generations]
getMetadata(id) → generation
list(options) → {data, pagination}
delete(id) → void
getStats() → {total, size, ...}
```

**Storage Structure:**
```
/data/
├── generations/
│   ├── {uuid}.wav
│   └── {uuid}.wav
└── metadata.json
```

### 4. External Services

#### Replicate API
- Model: meta/musicgen
- Input: {prompt, duration}
- Output: audio URL
- Polling: Check status
- Timeout: 2 minutes per request

#### Local File System
- Store: WAV audio files
- Index: JSON metadata
- Access: Direct file serving
- Cleanup: Manual deletion

## Data Flow

### Generation Request Flow

```
1. CLIENT REQUEST
   POST /api/generate
   {prompt, duration, model}
   │
   ▼
2. VALIDATION
   ├─ Prompt length
   ├─ Duration range
   └─ Model selection
   │
   ▼
3. CREATE PREDICTION
   POST /predictions (Replicate)
   │
   ▼
4. POLL FOR COMPLETION
   GET /predictions/:id
   Exponential backoff
   Max 5 minutes
   │
   ▼
5. DOWNLOAD AUDIO
   GET audioUrl
   Stream to /data/generations/
   │
   ▼
6. SAVE METADATA
   Append to metadata.json
   │
   ▼
7. RETURN RESPONSE
   {id, status, audioUrl, ...}
```

### Error Handling Flow

```
ERROR DETECTED
    │
    ├─ Validation Error (400)
    ├─ Authentication Error (401)
    ├─ Rate Limit Error (429)
    ├─ Timeout Error (504)
    └─ Server Error (500)
    │
    ▼
LOG ERROR
    ├─ Timestamp
    ├─ Error code
    ├─ Request details
    └─ Stack trace
    │
    ▼
CREATE ERROR RESPONSE
    {
      success: false,
      error: {
        code,
        message,
        details (optional)
      }
    }
    │
    ▼
RETURN HTTP STATUS
```

## Configuration Management

```javascript
config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
    timeout: 120000
  },
  storage: {
    basePath: process.env.STORAGE_PATH || './data',
    maxFileSize: 52428800 // 50MB
  },
  generation: {
    maxPromptLength: 500,
    minDuration: 5,
    maxDuration: 30,
    allowedModels: ['small', 'medium', 'large']
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 10
  }
}
```

## Integration Points

### With Ut Queant Laxis

```
Vocal Audio
    ↓
Analyze (pitch, tempo, energy)
    ↓
Generate Prompt
    ↓
soundweave.generate(prompt)
    ↓
Download Audio
    ↓
Combine + Align
```

### With NeuralMix

```
DJ Requirements
    ↓
Multiple Prompts
    ↓
soundweave.batch(prompts)
    ↓
Download All
    ↓
Mix + Blend
```

### With ButterFiles

```
Generated Music Files
    ↓
Load Metadata
    ↓
Extract Metadata
    ↓
butterfiles.organize()
    ↓
Auto-categorized
```

## Performance Characteristics

### Generation Time
- Small model: 30-45s
- Medium model: 45-60s
- Large model: 60-90s

### Storage
- Per 10s audio: 2-3MB
- Per metadata entry: ~1KB
- Total overhead: ~2-3MB per generation

### API Response Time
- Validation: <10ms
- List/Filter: <100ms
- Download: Network dependent
- Health check: <5ms

### Scalability Limits
- Replicate API: Check account tier
- Storage: Disk capacity
- Concurrent: Limited by Replicate
- Memory: Node.js default

## Security Architecture

### Input Security
✓ Schema validation
✓ Length constraints
✓ Type checking
✓ Sanitization

### API Security
✓ Rate limiting
✓ CORS restriction
✓ Helmet headers
✓ Error masking

### Data Security
✓ Server-side API keys
✓ No credential logging
✓ Secure file permissions
✓ Timeout protection

## Error Recovery

### Timeout Handling
- Exponential backoff: 1s → 2s → 4s (max 10s)
- Max wait: 5 minutes
- Retry count: 120 attempts
- Circuit breaker ready

### Network Failures
- Retry with backoff
- Timeout fallback
- Graceful degradation
- User notification

### Storage Failures
- File not found handling
- Metadata corruption recovery
- Disk space check
- Cleanup on error

## Monitoring & Observability

### Logging
```javascript
logger.info() - Important events
logger.error() - Errors
logger.debug() - Development
logger.warn() - Warnings
```

### Metrics Tracked
- Generation success rate
- Average generation time
- Storage usage
- API response times
- Error rates
- Rate limit hits

### Health Check
```bash
POST /api/health
{
  success: true,
  status: "ok",
  uptime: 1234.5,
  timestamp: "..."
}
```

## Future Architecture Enhancements

### Phase 2
- MongoDB for metadata
- User authentication
- Advanced caching
- WebSocket for real-time updates

### Phase 3
- Distributed generation
- Queue management
- Load balancing
- Multi-region deployment

### Phase 4
- Machine learning pipeline
- Custom model training
- Advanced analytics
- Subscription management

---

## Key Design Decisions

1. **JSON Metadata** - Simple, human-readable, no DB required
2. **UUID for IDs** - Universally unique, collision-free
3. **Exponential Backoff** - Efficient polling, respects API
4. **Local Storage** - Full user control, no lock-in
5. **Modular Services** - Easy to test, replace, scale
6. **Structured Errors** - Better debugging and integration
7. **Rate Limiting** - Prevents abuse, fair usage

---

For integration details, see [Integration Guide](./docs/INTEGRATION.md)
