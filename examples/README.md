# SoundWeave Examples

Complete examples demonstrating how to use SoundWeave for various use cases.

## 📁 Examples Overview

### 1. **basic-usage.js** - Getting Started
The simplest way to generate music with SoundWeave.

**What it demonstrates:**
- ✅ Initializing services
- ✅ Generating music from a text prompt
- ✅ Saving metadata
- ✅ Downloading audio files
- ✅ Error handling

**Run it:**
```bash
node examples/basic-usage.js
```

**Expected output:**
- Generated audio file in `data/generations/`
- Metadata entry in `data/metadata.json`
- Console output with generation details

---

### 2. **batch-generation.js** - Multiple Tracks
Generate multiple music tracks in parallel with different styles.

**What it demonstrates:**
- ✅ Parallel generation with `Promise.all()`
- ✅ Handling multiple prompts simultaneously
- ✅ Error recovery (continue if one fails)
- ✅ Performance measurement
- ✅ Batch metadata operations

**Run it:**
```bash
node examples/batch-generation.js
```

**Use cases:**
- Creating a playlist of varied music
- Generating stock music library
- A/B testing different prompts
- Building a music catalog

**Performance:**
- 4 tracks in ~60-90 seconds (vs 240-360s sequential)
- ~75% time savings with parallel processing

---

### 3. **integration-neuralmix.js** - DJ Mixing
Create a DJ set with BPM-matched tracks for live mixing.

**What it demonstrates:**
- ✅ Generating tracks with matching BPM
- ✅ Energy flow management (opener → peak → closer)
- ✅ DJ-specific metadata (energy, position, mixability)
- ✅ Mix point recommendations
- ✅ NeuralMix integration code

**Run it:**
```bash
node examples/integration-neuralmix.js
```

**Output:**
- 4 DJ-ready tracks (all 120 BPM)
- Mix suggestions and transition points
- NeuralMix-compatible track list
- Integration code example

**DJ Set Flow:**
```
Opening Track (high energy)
    ↓ 16-bar gradual mix
Mid Set Groover (medium energy)
    ↓ 8-bar fast mix
Peak Time Banger (peak energy)
    ↓ 32-bar extended mix
Closing Track (medium energy)
```

---

### 4. **integration-utqueantlaxis.js** - Vocal Backing
Analyze vocals and generate complementary instrumental music.

**What it demonstrates:**
- ✅ Vocal analysis integration
- ✅ Prompt building from musical analysis
- ✅ Generating multiple variations
- ✅ Compatibility scoring
- ✅ Mixing recommendations

**Run it:**
```bash
node examples/integration-utqueantlaxis.js
```

**Workflow:**
```
1. Analyze Vocal Track
   ↓
2. Extract: BPM, Key, Genre, Mood, Energy
   ↓
3. Generate Backing Variations:
   - Main Backing (balanced)
   - Minimal Version (verses)
   - Full Arrangement (chorus)
   ↓
4. Mix with Vocals
```

**Output:**
- 3 instrumental variations
- Vocal analysis metadata
- Mixing level recommendations
- Integration code

---

## 🚀 Running Examples

### Prerequisites

1. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env and add your REPLICATE_API_TOKEN
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Verify Configuration:**
   ```bash
   npm start
   # Should show: ✅ Configuration validated successfully
   # Press Ctrl+C to stop
   ```

### Running Individual Examples

```bash
# Basic usage
node examples/basic-usage.js

# Batch generation (generates 4 tracks)
node examples/batch-generation.js

# DJ set creation
node examples/integration-neuralmix.js

# Vocal backing generation
node examples/integration-utqueantlaxis.js
```

### Running All Examples

```bash
# Create a script to run all examples
for file in examples/*.js; do
  echo "Running $file..."
  node "$file"
  echo ""
done
```

---

## 💡 Customization Tips

### Modifying Prompts

All examples use descriptive prompts. Customize them for your needs:

```javascript
// Original
prompt: 'uplifting orchestral music with strings'

// More specific
prompt: 'epic cinematic orchestra, powerful brass, heroic theme, 120bpm'

// Genre-specific
prompt: 'lo-fi hip hop beats, jazzy piano, vinyl crackle, chill'

// Mood-based
prompt: 'dark ambient soundscape, mysterious, tension-building'
```

### Adjusting Duration

```javascript
// Short clips (5-10s) for sound effects
duration: 5

// Standard tracks (10-20s) for testing
duration: 15

// Full segments (20-30s) for production
duration: 30
```

### Choosing Models

```javascript
// Fast generation, lower quality
model: 'small'

// Balanced (recommended)
model: 'medium'

// Best quality, slower
model: 'large'
```

---

## 🔧 Common Patterns

### Error Handling

```javascript
try {
  const generation = await musicGen.generate({ /*...*/ });
} catch (error) {
  if (error.code === 'AUTH_ERROR') {
    console.error('Invalid API token');
  } else if (error.code === 'TIMEOUT_ERROR') {
    console.error('Generation timed out - try shorter duration');
  } else {
    console.error('Generation failed:', error.message);
  }
}
```

### Progress Tracking

```javascript
const tracks = [/* ... */];

for (let i = 0; i < tracks.length; i++) {
  console.log(`Generating track ${i + 1}/${tracks.length}...`);
  const generation = await musicGen.generate(tracks[i]);
  console.log(`✅ Complete: ${generation.id}`);
}
```

### Metadata Enrichment

```javascript
// Add custom metadata
await storage.saveMetadata({
  ...generation,
  customTags: ['uplifting', 'orchestral'],
  project: 'My Album',
  album: 'Vol 1',
  trackNumber: 3
});
```

---

## 📊 Performance Benchmarks

Based on testing with `model: 'large'`:

| Operation | Duration | Notes |
|-----------|----------|-------|
| Single generation (10s) | ~45-60s | Includes API processing |
| Single generation (30s) | ~60-90s | Longer audio = longer processing |
| Batch (4 tracks) parallel | ~60-90s | Same as 1 track (parallel) |
| Batch (4 tracks) sequential | ~240-360s | 4x slower than parallel |
| Metadata save | <10ms | Cached after first load |
| Audio download (10s) | ~2-5s | Network dependent |

**Recommendation:** Always use parallel generation for multiple tracks.

---

## 🐛 Troubleshooting

### "AUTH_ERROR: Invalid API token"

**Solution:**
1. Get token from https://replicate.com/account
2. Add to `.env`: `REPLICATE_API_TOKEN=r8_your_token_here`
3. Restart the example

### "TIMEOUT_ERROR: Generation timeout"

**Solution:**
1. Try shorter duration (10-15s instead of 30s)
2. Use `model: 'small'` for faster processing
3. Check Replicate API status

### "File download failed"

**Solution:**
1. Check internet connection
2. Verify `STORAGE_PATH` is writable
3. Check disk space

### Examples run but no audio files

**Solution:**
1. Check `data/generations/` directory exists
2. Verify permissions: `chmod 755 data/generations`
3. Check storage service logs for errors

---

## 🎯 Next Steps

After running these examples:

1. **Build Your Own Use Case**
   - Combine patterns from multiple examples
   - Add your own metadata schema
   - Implement custom workflows

2. **Integrate with Your Project**
   - Use SoundWeave as a library
   - Build on top of the services
   - Create your own API wrapper

3. **Explore Advanced Features**
   - Implement caching strategies
   - Add queue management
   - Build a web interface
   - Create automation scripts

4. **Contribute Back**
   - Share your use case as an example
   - Improve existing examples
   - Add new integration examples

---

## 📚 Additional Resources

- **Main Documentation:** [../README.md](../README.md)
- **Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **API Reference:** [../MUSICGEN_COMPLETE_GUIDE.md](../MUSICGEN_COMPLETE_GUIDE.md)
- **Testing:** [../tests/README.md](../tests/README.md)

---

## 🤝 Contributing Examples

Have a cool use case? Add it!

1. Create `examples/your-example.js`
2. Follow the existing format
3. Add documentation to this README
4. Test thoroughly
5. Submit a pull request

**Good example topics:**
- Game sound effect generation
- Podcast background music
- Video soundtrack creation
- Meditation/relaxation music
- Custom genre experiments

---

**Questions?** Open an issue or check the main documentation!
