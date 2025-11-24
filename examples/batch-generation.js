/**
 * Batch Generation Example - SoundWeave
 *
 * This example shows how to generate multiple music tracks
 * in parallel with different prompts and settings.
 */

import { MusicGenService } from '../src/services/musicgen.service.js';
import { StorageService } from '../src/services/storage.service.js';

async function batchGenerationExample() {
  console.log('🎵 SoundWeave - Batch Generation Example\n');

  const musicGen = new MusicGenService();
  const storage = new StorageService();

  // Define multiple tracks to generate
  const tracks = [
    {
      prompt: 'upbeat electronic dance music 120bpm',
      duration: 15,
      model: 'large',
      genre: 'Electronic'
    },
    {
      prompt: 'chill ambient atmospheric soundscape',
      duration: 15,
      model: 'large',
      genre: 'Ambient'
    },
    {
      prompt: 'energetic rock guitar riff with drums',
      duration: 15,
      model: 'large',
      genre: 'Rock'
    },
    {
      prompt: 'smooth jazz piano with upright bass',
      duration: 15,
      model: 'large',
      genre: 'Jazz'
    }
  ];

  console.log(`📋 Generating ${tracks.length} tracks in parallel...\n`);

  try {
    // Generate all tracks in parallel
    const startTime = Date.now();
    const generations = await Promise.all(
      tracks.map(async (track, index) => {
        console.log(`🎼 Track ${index + 1}: ${track.genre}`);
        console.log(`   Prompt: "${track.prompt}"`);

        try {
          const generation = await musicGen.generate({
            prompt: track.prompt,
            duration: track.duration,
            model: track.model
          });

          console.log(`✅ Track ${index + 1} generated: ${generation.id}\n`);

          return {
            ...generation,
            genre: track.genre
          };
        } catch (error) {
          console.error(`❌ Track ${index + 1} failed: ${error.message}\n`);
          return null;
        }
      })
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Total generation time: ${duration}s\n`);

    // Filter out failed generations
    const successful = generations.filter(g => g !== null);
    console.log(`✅ Successfully generated: ${successful.length}/${tracks.length} tracks\n`);

    if (successful.length === 0) {
      console.log('❌ No tracks were generated successfully');
      process.exit(1);
    }

    // Save metadata for all successful generations
    console.log('💾 Saving metadata...');
    await Promise.all(
      successful.map(generation => storage.saveMetadata(generation))
    );
    console.log('✅ All metadata saved\n');

    // Download all audio files in parallel
    console.log('📥 Downloading audio files...');
    const downloads = await Promise.all(
      successful.map(async (generation, index) => {
        try {
          const audioFile = await storage.downloadAudio(
            generation.id,
            generation.audioUrl
          );

          // Update metadata with download info
          await storage.saveMetadata({
            ...generation,
            localFile: audioFile.fileName,
            downloadedAt: new Date().toISOString()
          });

          console.log(`✅ Downloaded ${generation.genre}: ${audioFile.fileName}`);
          return audioFile;
        } catch (error) {
          console.error(`❌ Download failed for ${generation.id}: ${error.message}`);
          return null;
        }
      })
    );

    const downloadedCount = downloads.filter(d => d !== null).length;
    console.log(`\n✅ Downloaded: ${downloadedCount}/${successful.length} files`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Batch Generation Summary');
    console.log('='.repeat(60));
    console.log(`Total tracks requested:  ${tracks.length}`);
    console.log(`Successfully generated:  ${successful.length}`);
    console.log(`Successfully downloaded: ${downloadedCount}`);
    console.log(`Total time:              ${duration}s`);
    console.log(`Average per track:       ${(duration / successful.length).toFixed(1)}s`);
    console.log('='.repeat(60) + '\n');

    console.log('🎉 Batch generation complete!');

  } catch (error) {
    console.error('❌ Batch generation failed:', error.message);
    process.exit(1);
  }
}

// Run the example
batchGenerationExample();
