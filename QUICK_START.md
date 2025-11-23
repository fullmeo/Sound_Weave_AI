# SoundWeave - Quick Start Guide

Get up and running with SoundWeave in 5 minutes.

## Prerequisites

- Node.js 18+
- Replicate API account (free)

## Installation

```bash
# 1. Clone
git clone https://github.com/fullmeo/SoundWeave.git
cd SoundWeave

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env: add REPLICATE_API_TOKEN from https://replicate.com/account/api-tokens

# 4. Start
npm start
```

## First Generation (API)

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "lo-fi hip hop chill beats",
    "duration": 10,
    "model": "large"
  }'
```

## First Generation (CLI)

```bash
node cli/musicgen-cli.js generate \
  --prompt "ambient electronic music" \
  --duration 15 \
  --download
```

## Next Steps

- Read [API Documentation](./API.md)
- Check [Integration Guide](./INTEGRATION.md)
- Explore [CLI Commands](./CLI.md)

---

That's it! 🎵
