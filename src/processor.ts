import OpenAI from 'openai';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { documentationElements } from './config/documentationElements';
import { OasisTrainingService } from './services/oasisTraining';

// Load environment variables
dotenv.config();

// Check for API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables. Please create a .env file with your API key.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

// Initialize OASIS training service
const oasisTraining = new OasisTrainingService(apiKey);

export async function processTranscript(
  input: string,
  isFile: boolean = false
): Promise<Record<string, any>> {
  try {
    // Read transcript from file if specified
    let transcript: string;
    if (isFile) {
      try {
        transcript = await fs.readFile(input, 'utf-8');
        if (!transcript.trim()) {
          throw new Error('Transcript file is empty');
        }
      } catch (error) {
        throw new Error(`Failed to read transcript file: ${error}`);
      }
    } else {
      transcript = input;
    }

    // Get the trained system message
    const systemMessage = await oasisTraining.getTrainedSystemMessage();

    // Create the expected response structure
    const expectedStructure = documentationElements.reduce((acc, element) => {
      acc[element.id] = {
        answer: "Information not found in transcript",
        confidence: "low",
        context: "No information found"
      };
      return acc;
    }, {} as Record<string, any>);

    // Prepare the prompt for GPT-4
    const prompt = `Analyze the following clinical transcript and extract information according to the documentation elements.

Transcript:
${transcript}

You must respond with a JSON object that follows this exact structure:
${JSON.stringify(expectedStructure, null, 2)}

For each element:
1. If you find relevant information, update the "answer" field with the extracted information
2. Set "confidence" to "high", "medium", or "low" based on the clarity of information
3. Update "context" with a brief explanation of why this answer was provided
4. If no information is found, keep the default values

IMPORTANT: Your response must be a valid JSON object matching the structure above. Do not include any text outside the JSON structure.`;

    // Call GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    // Parse and return the results
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GPT-4');
    }

    try {
      const parsedResponse = JSON.parse(response);
      
      // Validate the response structure
      for (const element of documentationElements) {
        if (!(element.id in parsedResponse)) {
          parsedResponse[element.id] = {
            answer: "Information not found in transcript",
            confidence: "low",
            context: "Element not found in GPT-4 response"
          };
        }
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Raw GPT-4 response:', response);
      throw new Error(`Failed to parse GPT-4 response as JSON: ${error}`);
    }
  } catch (error) {
    console.error('Error in processTranscript:', error);
    throw error;
  }
}

// Export the training service for use in the CLI
export { oasisTraining }; 