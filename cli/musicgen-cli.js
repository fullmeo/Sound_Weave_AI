#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { MusicGenService } from '../src/services/musicgen.service.js';
import { StorageService } from '../src/services/storage.service.js';
import pino from 'pino';

const logger = pino();
const musicGenService = new MusicGenService();
const storageService = new StorageService();

yargs(hideBin(process.argv))
  // Generate command
  .command(
    'generate',
    'Generate music from prompt',
    yargs =>
      yargs
        .option('prompt', {
          alias: 'p',
          describe: 'Music description prompt',
          type: 'string',
          demandOption: true,
        })
        .option('duration', {
          alias: 'd',
          describe: 'Duration in seconds (5-30)',
          type: 'number',
          default: 10,
        })
        .option('model', {
          alias: 'm',
          describe: 'Model variant (small, medium, large)',
          type: 'string',
          default: 'large',
        })
        .option('download', {
          describe: 'Automatically download audio file',
          type: 'boolean',
          default: true,
        }),
    async argv => {
      try {
        console.log(
          chalk.blue('🎵 Starting music generation...')
        );

        const result = await musicGenService.generate({
          prompt: argv.prompt,
          duration: argv.duration,
          model: argv.model,
        });

        await storageService.saveMetadata(result);

        console.log(chalk.green('✓ Generation completed'));
        console.log(chalk.cyan('\nGeneration Details:'));
        console.log(`  ID: ${result.id}`);
        console.log(`  Prompt: ${result.prompt}`);
        console.log(`  Duration: ${result.duration}s`);
        console.log(`  Model: ${result.model}`);
        console.log(`  Status: ${result.status}`);
        console.log(`  Created: ${result.createdAt}`);

        if (argv.download && result.audioUrl) {
          console.log(chalk.blue('\n📥 Downloading audio...'));
          const audioInfo = await storageService.downloadAudio(
            result.id,
            result.audioUrl
          );
          console.log(chalk.green('✓ Audio downloaded'));
          console.log(`  File: ${audioInfo.fileName}`);
          console.log(`  Size: ${(audioInfo.size / 1024 / 1024).toFixed(2)}MB`);

          await storageService.saveMetadata({
            ...result,
            localFile: audioInfo.fileName,
            downloadedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        if (error.details) {
          error.details.forEach(detail =>
            console.error(chalk.red(`  - ${detail}`))
          );
        }
        process.exit(1);
      }
    }
  )

  // List command
  .command(
    'list',
    'List all generations',
    yargs =>
      yargs
        .option('limit', {
          alias: 'l',
          describe: 'Number of results',
          type: 'number',
          default: 10,
        })
        .option('offset', {
          alias: 'o',
          describe: 'Offset for pagination',
          type: 'number',
          default: 0,
        })
        .option('status', {
          alias: 's',
          describe: 'Filter by status',
          type: 'string',
        }),
    async argv => {
      try {
        const result = await storageService.list({
          limit: argv.limit,
          offset: argv.offset,
          status: argv.status,
        });

        if (result.data.length === 0) {
          console.log(chalk.yellow('No generations found'));
          return;
        }

        console.log(chalk.cyan('📚 Generations List\n'));
        console.log(
          chalk.bold('ID').padEnd(38),
          chalk.bold('Prompt').padEnd(40),
          chalk.bold('Status').padEnd(10),
          chalk.bold('Created')
        );
        console.log('─'.repeat(120));

        result.data.forEach(gen => {
          const statusColor =
            gen.status === 'completed' ? chalk.green : chalk.yellow;
          console.log(
            gen.id.padEnd(38),
            gen.prompt.substring(0, 40).padEnd(40),
            statusColor(gen.status).padEnd(10),
            new Date(gen.createdAt).toLocaleString().padEnd(20)
          );
        });

        console.log(`\nShowing ${result.data.length} of ${result.pagination.total}`);
        if (result.pagination.hasMore) {
          console.log(
            `Use --offset ${result.pagination.offset + result.pagination.limit} to see more`
          );
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )

  // Get command
  .command(
    'get <id>',
    'Get generation details',
    yargs =>
      yargs
        .positional('id', {
          describe: 'Generation ID',
          type: 'string',
        })
        .option('download', {
          alias: 'd',
          describe: 'Download audio file',
          type: 'boolean',
          default: false,
        }),
    async argv => {
      try {
        const metadata = await storageService.getMetadata(argv.id);

        if (!metadata) {
          console.error(chalk.red(`Generation ${argv.id} not found`));
          process.exit(1);
        }

        console.log(chalk.cyan('\n📊 Generation Details\n'));
        console.log(`ID: ${metadata.id}`);
        console.log(`Prompt: ${metadata.prompt}`);
        console.log(`Duration: ${metadata.duration}s`);
        console.log(`Model: ${metadata.model}`);
        console.log(`Status: ${metadata.status}`);
        console.log(`Created: ${new Date(metadata.createdAt).toLocaleString()}`);

        if (metadata.localFile) {
          console.log(`Local File: ${metadata.localFile}`);
          console.log(`Downloaded: ${metadata.downloadedAt}`);
        }

        if (argv.download && metadata.audioUrl) {
          console.log(chalk.blue('\n📥 Downloading audio...'));
          const audioInfo = await storageService.downloadAudio(
            metadata.id,
            metadata.audioUrl
          );
          console.log(chalk.green('✓ Audio downloaded'));
          console.log(`  File: ${audioInfo.fileName}`);
          console.log(`  Path: ${audioInfo.filePath}`);
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )

  // Delete command
  .command(
    'delete <id>',
    'Delete generation',
    yargs =>
      yargs.positional('id', {
        describe: 'Generation ID',
        type: 'string',
      }),
    async argv => {
      try {
        await storageService.delete(argv.id);
        console.log(chalk.green(`✓ Generation ${argv.id} deleted`));
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )

  // Stats command
  .command(
    'stats',
    'Show storage and usage statistics',
    {},
    async argv => {
      try {
        const stats = await storageService.getStats();

        console.log(chalk.cyan('\n📈 Storage Statistics\n'));
        console.log(`Total Generations: ${stats.totalGenerations}`);
        console.log(`Completed: ${stats.completedCount}`);
        console.log(
          `Storage Used: ${(stats.totalStorageUsed / 1024 / 1024).toFixed(2)}MB`
        );
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )

  // Models command
  .command(
    'models',
    'Show available models',
    {},
    argv => {
      const modelInfo = musicGenService.getModelInfo();
      console.log(chalk.cyan('\n🎛️  Available Models\n'));
      console.log('Models:', modelInfo.models.join(', '));
      console.log(`Default: ${modelInfo.defaults.model}`);
      console.log(`\nConstraints:`);
      console.log(`  Duration: ${modelInfo.limits.minDuration}-${modelInfo.limits.maxDuration}s`);
      console.log(`  Max Prompt: ${modelInfo.limits.maxPromptLength} chars`);
    }
  )

  .strict()
  .alias('help', 'h')
  .alias('version', 'v')
  .demandCommand()
  .parse();
