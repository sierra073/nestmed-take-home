import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { documentationElements } from '../config/documentationElements';
import fetch from 'node-fetch';

export class OasisTrainingService {
  private openai: OpenAI;
  private readonly TRAINING_DIR = path.join(process.cwd(), 'training');
  private readonly SYSTEM_MESSAGE_PATH = path.join(this.TRAINING_DIR, 'system_message.txt');
  private readonly OASIS_MANUAL_URL = 'https://www.cms.gov/files/document/draft-oasis-e1-manual-04-28-2024.pdf';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  private async ensureTrainingDirectory(): Promise<void> {
    await fs.mkdir(this.TRAINING_DIR, { recursive: true });
  }

  private async fetchOasisManual(): Promise<string | null> {
    try {
      const response = await fetch(this.OASIS_MANUAL_URL);
      if (!response.ok) {
        console.warn('Failed to fetch OASIS manual, falling back to basic training');
        return null;
      }
      return await response.text();
    } catch (error) {
      console.warn('Error fetching OASIS manual, falling back to basic training:', error);
      return null;
    }
  }

  private async extractRelevantSections(manualContent: string): Promise<string | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical documentation expert. Extract only the relevant sections from the OASIS manual that pertain to the following documentation elements. Be concise and focus on the key guidelines."
          },
          {
            role: "user",
            content: `Please extract relevant sections from the OASIS manual for these elements:
${documentationElements.map(e => `- ${e.id}: ${e.question}`).join('\n')}

Manual content:
${manualContent}`
          }
        ],
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('Error extracting relevant sections, falling back to basic training:', error);
      return null;
    }
  }

  async trainModel(): Promise<void> {
    try {
      await this.ensureTrainingDirectory();

      // Try to fetch and process the OASIS manual
      const manualContent = await this.fetchOasisManual();
      const relevantSections = manualContent ? await this.extractRelevantSections(manualContent) : null;

      // Create the system message with or without OASIS guidelines
      const systemMessage = `You are a medical documentation assistant trained to extract specific information from clinical transcripts according to OASIS guidelines.

${relevantSections ? `OASIS Guidelines:
${relevantSections}

` : ''}Your task is to analyze clinical transcripts and extract information for the following documentation elements:
${documentationElements.map(e => `- ${e.id}: ${e.question}
  Context: ${e.context}`).join('\n')}

Instructions:
1. Analyze the transcript thoroughly to identify relevant information for each documentation element
2. For each element:
   - Only provide an answer if there is sufficient information in the transcript
   - If information is unclear or incomplete, respond with "Information not found in transcript"
3. Format the response as a JSON object with element IDs as keys
4. Include confidence level (high/medium/low) for each answer based on the clarity and completeness of information found`;

      // Store the system message
      await fs.writeFile(this.SYSTEM_MESSAGE_PATH, systemMessage);
      console.log('Model training completed successfully');
    } catch (error) {
      throw new Error(`Failed to train model: ${error}`);
    }
  }

  async getTrainedSystemMessage(): Promise<string> {
    try {
      // Check if training file exists
      await fs.access(this.SYSTEM_MESSAGE_PATH);
      return await fs.readFile(this.SYSTEM_MESSAGE_PATH, 'utf-8');
    } catch (error) {
      // If training file doesn't exist, run training
      await this.trainModel();
      return this.getTrainedSystemMessage();
    }
  }
} 