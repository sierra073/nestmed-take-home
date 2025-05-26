#!/usr/bin/env node

import { Command } from 'commander';
import { processTranscript } from './processor';
import { OasisTrainingService } from './services/oasisTraining';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('clinical-transcript-analyzer')
  .description('CLI tool to analyze clinical transcripts using GPT-4')
  .version('1.0.0');

// Internal command for training during build
program
  .command('train')
  .description('Train the model with the OASIS manual')
  .action(async () => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not found in environment variables');
      }
      
      const oasisTraining = new OasisTrainingService(apiKey);
      await oasisTraining.trainModel();
      console.log('Training completed successfully');
    } catch (error) {
      console.error('Error during training:', error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze a clinical transcript')
  .argument('<transcript>', 'Path to the transcript file or transcript text')
  .option('-f, --file', 'Treat the argument as a file path')
  .action(async (transcript: string, options: { file?: boolean }) => {
    try {
      // If it's a file, resolve the path relative to the current working directory
      const input = options.file ? path.resolve(process.cwd(), transcript) : transcript;
      const result = await processTranscript(input, options.file);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error processing transcript:', error);
      process.exit(1);
    }
  });

program.parse(); 