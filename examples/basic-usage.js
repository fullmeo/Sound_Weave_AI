/**
 * Basic Usage Example - SoundWeave
 *
 * This example demonstrates the simplest way to use SoundWeave
 * to generate music from a text prompt.
 */

import { MusicGenService } from '../src/services/musicgen.service.js';
import { StorageService } from '../src/services/storage.service.js';

async function basicExample() {
  console.log('🎵 SoundWeave - Basic Usage Example\n');

  // Initialize services
  const musicGen = new MusicGenService();
  const storage = new StorageService();

  try {
    // Step 1: Generate music from prompt
    console.log('1️⃣  Generating music...');
    const generation = await musicGen.generate({
      prompt: 'uplifting orchestral music with strings and piano',
      duration: 10,
      model: 'large'
    });

    console.log('✅ Generation created:');
    console.log(`   ID: ${generation.id}`);
    console.log(`   Status: ${generation.status}`);
    console.log(`   Audio URL: ${generation.audioUrl}\n`);

    // Step 2: Save metadata
    console.log('2️⃣  Saving metadata...');
    await storage.saveMetadata(generation);
    console.log('✅ Metadata saved\n');

    // Step 3: Download audio file
    console.log('3️⃣  Downloading audio file...');
    const audioFile = await storage.downloadAudio(
      generation.id,
      generation.audioUrl
    );

    console.log('✅ Audio downloaded:');
    console.log(`   File: ${audioFile.fileName}`);
    console.log(`   Path: ${audioFile.filePath}`);
    console.log(`   Size: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB\n`);

    // Step 4: Update metadata with download info
    await storage.saveMetadata({
      ...generation,
      localFile: audioFile.fileName,
      downloadedAt: new Date().toISOString()
    });

    console.log('🎉 Success! Music generated and saved locally.');
    console.log(`📁 Listen to your music: ${audioFile.filePath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'AUTH_ERROR') {
      console.error('\n💡 Tip: Make sure REPLICATE_API_TOKEN is set in your .env file');
      console.error('   Get your token at: https://replicate.com/account');
    }

    process.exit(1);
  }
}

// Run the example
basicExample();
