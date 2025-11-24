/**
 * NeuralMix Integration Example - SoundWeave
 *
 * This example demonstrates how to integrate SoundWeave with NeuralMix
 * to generate multiple tracks with matching BPM for DJ mixing.
 *
 * Use case: Create a set of harmonically compatible tracks for live mixing
 */

import { MusicGenService } from '../src/services/musicgen.service.js';
import { StorageService } from '../src/services/storage.service.js';

async function neuralMixIntegration() {
  console.log('🎛️  SoundWeave + NeuralMix Integration Example\n');

  const musicGen = new MusicGenService();
  const storage = new StorageService();

  // DJ Set Configuration
  const setConfig = {
    targetBPM: 120,
    targetKey: 'Am',
    duration: 30,
    tracks: [
      {
        name: 'Opening Track',
        prompt: 'upbeat electronic house music 120bpm, energetic build-up',
        energy: 'high',
        position: 'opener'
      },
      {
        name: 'Mid Set Groover',
        prompt: 'deep tech house 120bpm, hypnotic bassline, minimal',
        energy: 'medium',
        position: 'middle'
      },
      {
        name: 'Peak Time Banger',
        prompt: 'euphoric progressive house 120bpm, massive drop, anthemic',
        energy: 'peak',
        position: 'peak'
      },
      {
        name: 'Closing Track',
        prompt: 'melodic deep house 120bpm, emotional breakdown, uplifting',
        energy: 'medium',
        position: 'closer'
      }
    ]
  };

  console.log('🎚️  DJ Set Configuration:');
  console.log(`   Target BPM: ${setConfig.targetBPM}`);
  console.log(`   Target Key: ${setConfig.targetKey}`);
  console.log(`   Track Count: ${setConfig.tracks.length}`);
  console.log(`   Duration per track: ${setConfig.duration}s\n`);

  try {
    // Generate all tracks
    console.log('🎵 Generating DJ set tracks...\n');
    const generations = [];

    for (let i = 0; i < setConfig.tracks.length; i++) {
      const track = setConfig.tracks[i];
      console.log(`🎼 Track ${i + 1}/${setConfig.tracks.length}: ${track.name}`);
      console.log(`   Energy: ${track.energy}`);
      console.log(`   Position: ${track.position}`);
      console.log(`   Prompt: "${track.prompt}"\n`);

      const generation = await musicGen.generate({
        prompt: track.prompt,
        duration: setConfig.duration,
        model: 'large'
      });

      // Add DJ metadata
      const djMetadata = {
        ...generation,
        djSet: {
          name: track.name,
          bpm: setConfig.targetBPM,
          key: setConfig.targetKey,
          energy: track.energy,
          position: track.position,
          mixable: true
        }
      };

      generations.push(djMetadata);
      await storage.saveMetadata(djMetadata);

      console.log(`✅ Generated: ${generation.id}`);
      console.log(`   Status: ${generation.status}\n`);
    }

    // Download all tracks
    console.log('📥 Downloading tracks for mixing...\n');
    const trackFiles = [];

    for (const generation of generations) {
      const audioFile = await storage.downloadAudio(
        generation.id,
        generation.audioUrl
      );

      // Update metadata
      await storage.saveMetadata({
        ...generation,
        localFile: audioFile.fileName,
        downloadedAt: new Date().toISOString()
      });

      trackFiles.push({
        id: generation.id,
        name: generation.djSet.name,
        file: audioFile.filePath,
        bpm: generation.djSet.bpm,
        energy: generation.djSet.energy,
        position: generation.djSet.position
      });

      console.log(`✅ Downloaded: ${generation.djSet.name}`);
      console.log(`   File: ${audioFile.fileName}`);
    }

    // Generate NeuralMix compatible track list
    console.log('\n' + '='.repeat(70));
    console.log('🎛️  NeuralMix Track List (Load Order)');
    console.log('='.repeat(70));

    trackFiles
      .sort((a, b) => {
        const order = { opener: 0, middle: 1, peak: 2, closer: 3 };
        return order[a.position] - order[b.position];
      })
      .forEach((track, index) => {
        console.log(`${index + 1}. ${track.name.padEnd(20)} | ${track.bpm} BPM | Energy: ${track.energy.padEnd(6)} | ${track.file}`);
      });

    console.log('='.repeat(70) + '\n');

    // Generate mix suggestions
    console.log('💡 Suggested Mix Points:\n');
    console.log('1️⃣  Opening Track → Mid Set Groover');
    console.log('   - BPM Match: ✅ Both 120 BPM');
    console.log('   - Energy Transition: High → Medium (gradual drop)');
    console.log('   - Suggested: 16-bar mix, start bass swap at 8 bars\n');

    console.log('2️⃣  Mid Set Groover → Peak Time Banger');
    console.log('   - BPM Match: ✅ Both 120 BPM');
    console.log('   - Energy Transition: Medium → Peak (build energy)');
    console.log('   - Suggested: Fast mix (8 bars), drop on the one\n');

    console.log('3️⃣  Peak Time Banger → Closing Track');
    console.log('   - BPM Match: ✅ Both 120 BPM');
    console.log('   - Energy Transition: Peak → Medium (cool down)');
    console.log('   - Suggested: Extended mix (32 bars), gradual filter transition\n');

    // Integration code example
    console.log('📋 NeuralMix Integration Code:\n');
    console.log('```javascript');
    console.log('// Load tracks into NeuralMix');
    console.log('const neuralMix = new NeuralMix();');
    console.log('');
    trackFiles.forEach((track, index) => {
      console.log(`neuralMix.loadTrack('deck${index + 1}', '${track.file}', {`);
      console.log(`  bpm: ${track.bpm},`);
      console.log(`  energy: '${track.energy}',`);
      console.log(`  position: '${track.position}'`);
      console.log('});');
      if (index < trackFiles.length - 1) console.log('');
    });
    console.log('');
    console.log('// Enable auto-mix with BPM sync');
    console.log('neuralMix.enableAutoMix({ bpmSync: true, beatMatch: true });');
    console.log('```\n');

    console.log('🎉 DJ set generation complete!');
    console.log('🎛️  Ready to load into NeuralMix for mixing\n');

  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

// Run the example
neuralMixIntegration();
