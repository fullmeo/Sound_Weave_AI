/**
 * Ut Queant Laxis Integration Example - SoundWeave
 *
 * This example demonstrates how to integrate SoundWeave with Ut Queant Laxis
 * to analyze vocal tracks and generate complementary instrumental music.
 *
 * Use case: Analyze a vocal performance and create matching backing music
 */

import { MusicGenService } from '../src/services/musicgen.service.js';
import { StorageService } from '../src/services/storage.service.js';

// Mock Ut Queant Laxis analysis (replace with actual implementation)
class MockUtQueantLaxis {
  async analyzeVocal(vocalFile) {
    console.log(`🎤 Analyzing vocal file: ${vocalFile}\n`);

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock analysis results
    return {
      bpm: 120,
      key: 'C Major',
      energy: 'medium-high',
      genre: 'pop',
      mood: 'uplifting',
      vocalRange: { min: 'C3', max: 'C5' },
      recommendedInstruments: ['piano', 'strings', 'light percussion'],
      peakIntensity: 0.75,
      dynamicRange: 0.6
    };
  }
}

async function utQueantLaxisIntegration() {
  console.log('🎤 SoundWeave + Ut Queant Laxis Integration Example\n');
  console.log('Use case: Generate instrumental backing for vocal performance\n');

  const musicGen = new MusicGenService();
  const storage = new StorageService();
  const vocalAnalyzer = new MockUtQueantLaxis();

  // Simulated vocal file
  const vocalFile = './path/to/vocal-performance.wav';

  try {
    // Step 1: Analyze the vocal track
    console.log('📊 Step 1: Vocal Analysis\n');
    const analysis = await vocalAnalyzer.analyzeVocal(vocalFile);

    console.log('✅ Analysis complete:');
    console.log(`   BPM: ${analysis.bpm}`);
    console.log(`   Key: ${analysis.key}`);
    console.log(`   Genre: ${analysis.genre}`);
    console.log(`   Mood: ${analysis.mood}`);
    console.log(`   Energy: ${analysis.energy}`);
    console.log(`   Vocal Range: ${analysis.vocalRange.min} - ${analysis.vocalRange.max}`);
    console.log(`   Recommended: ${analysis.recommendedInstruments.join(', ')}\n`);

    // Step 2: Generate prompt from analysis
    console.log('🎼 Step 2: Generating Complementary Music\n');

    const instrumentalPrompt = buildPromptFromAnalysis(analysis);
    console.log('📝 Generated prompt:');
    console.log(`   "${instrumentalPrompt}"\n`);

    // Step 3: Generate multiple variations
    const variations = [
      {
        name: 'Main Backing',
        prompt: instrumentalPrompt,
        duration: 30
      },
      {
        name: 'Minimal Version',
        prompt: `minimal ${analysis.genre} instrumental, ${analysis.recommendedInstruments[0]}, ${analysis.bpm}bpm, subtle`,
        duration: 30
      },
      {
        name: 'Full Arrangement',
        prompt: `full ${analysis.genre} production, ${analysis.recommendedInstruments.join(' and ')}, ${analysis.bpm}bpm, rich harmonies`,
        duration: 30
      }
    ];

    console.log(`🎵 Generating ${variations.length} variations...\n`);

    const generations = [];
    for (const variation of variations) {
      console.log(`🎹 Generating: ${variation.name}`);
      console.log(`   Prompt: "${variation.prompt}"`);

      const generation = await musicGen.generate({
        prompt: variation.prompt,
        duration: variation.duration,
        model: 'large'
      });

      // Add vocal analysis metadata
      const enrichedGeneration = {
        ...generation,
        vocalAnalysis: {
          originalVocal: vocalFile,
          analysis: analysis,
          variationType: variation.name,
          compatibility: calculateCompatibility(analysis, variation.name)
        }
      };

      generations.push(enrichedGeneration);
      await storage.saveMetadata(enrichedGeneration);

      console.log(`✅ Generated: ${generation.id}`);
      console.log(`   Compatibility: ${enrichedGeneration.vocalAnalysis.compatibility}/100\n`);
    }

    // Step 4: Download all variations
    console.log('📥 Downloading instrumental variations...\n');

    for (const generation of generations) {
      const audioFile = await storage.downloadAudio(
        generation.id,
        generation.audioUrl
      );

      await storage.saveMetadata({
        ...generation,
        localFile: audioFile.fileName,
        downloadedAt: new Date().toISOString()
      });

      console.log(`✅ Downloaded: ${generation.vocalAnalysis.variationType}`);
      console.log(`   File: ${audioFile.fileName}`);
      console.log(`   Size: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB\n`);
    }

    // Step 5: Display mixing recommendations
    console.log('=' + '='.repeat(70));
    console.log('🎚️  Mixing Recommendations');
    console.log('=' + '='.repeat(70) + '\n');

    console.log('📋 Vocal Processing:');
    console.log(`   - Key: ${analysis.key} (ensure pitch correction is aligned)`);
    console.log(`   - BPM: ${analysis.bpm} (use time-stretching if needed)`);
    console.log(`   - Dynamic Range: ${(analysis.dynamicRange * 100).toFixed(0)}% (moderate compression recommended)\n`);

    console.log('🎛️  Instrumental Mix Levels:');
    console.log('   Main Backing Track:');
    console.log('     - Volume: -6dB (leave headroom for vocals)');
    console.log('     - EQ: High-pass filter at 200Hz (clear low-mids for voice)');
    console.log('     - Compression: Light (2:1 ratio, -3dB threshold)');
    console.log('');
    console.log('   Minimal Version (for verses):');
    console.log('     - Volume: -8dB (more space for vocals)');
    console.log('     - Use during storytelling/emotional sections');
    console.log('');
    console.log('   Full Arrangement (for chorus):');
    console.log('     - Volume: -4dB (more energy for hooks)');
    console.log('     - Stereo width: Expand slightly for impact\n');

    console.log('🎵 Arrangement Suggestions:');
    console.log(`   Intro:  Minimal Version (8 bars)`);
    console.log(`   Verse:  Minimal Version or Main Backing`);
    console.log(`   Chorus: Full Arrangement`);
    console.log(`   Bridge: Main Backing (transition element)`);
    console.log(`   Outro:  Gradual fade with Minimal Version\n`);

    // Integration code
    console.log('📋 Ut Queant Laxis Integration Code:\n');
    console.log('```javascript');
    console.log('// 1. Analyze vocal');
    console.log(`const analysis = await utQueantLaxis.analyzeVocal('${vocalFile}');`);
    console.log('');
    console.log('// 2. Generate backing music');
    console.log('const prompt = buildPromptFromAnalysis(analysis);');
    console.log('const backing = await soundweave.generate({');
    console.log('  prompt,');
    console.log(`  duration: 30,`);
    console.log(`  model: 'large'`);
    console.log('});');
    console.log('');
    console.log('// 3. Combine and export');
    console.log('await utQueantLaxis.mixVocalWithBacking({');
    console.log(`  vocal: '${vocalFile}',`);
    console.log(`  backing: backing.localFile,`);
    console.log('  levels: { vocal: 0, backing: -6 },');
    console.log(`  output: 'final-mix.wav'`);
    console.log('});');
    console.log('```\n');

    console.log('🎉 Integration complete!');
    console.log('🎤 Ready to mix vocals with generated instrumentals\n');

  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Build a music generation prompt from vocal analysis
 */
function buildPromptFromAnalysis(analysis) {
  const parts = [
    analysis.genre,
    'instrumental',
    analysis.recommendedInstruments.join(' and '),
    `${analysis.bpm}bpm`,
    analysis.mood,
    analysis.energy
  ];

  return parts.join(', ');
}

/**
 * Calculate compatibility score between vocal and variation
 */
function calculateCompatibility(analysis, variationType) {
  const baseScore = 75;

  if (variationType === 'Main Backing') return baseScore + 15;
  if (variationType === 'Minimal Version') return baseScore + 10;
  if (variationType === 'Full Arrangement') return baseScore + 20;

  return baseScore;
}

// Run the example
utQueantLaxisIntegration();
