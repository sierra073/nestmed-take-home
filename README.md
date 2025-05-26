# Clinical Transcript Analyzer

A CLI tool that uses GPT-4 to analyze clinical transcripts and extract specific documentation elements according to OASIS E1 guidelines.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Usage

The tool can analyze clinical transcripts in two ways:

### 1. Analyze text directly:

```bash
npm run dev -- analyze "Patient presents with difficulty bathing and mobility issues. Lives alone in a two-story house."
```

### 2. Analyze a file:

```bash
npm run dev -- analyze transcripts/test.txt -f   
```

The tool will output a JSON object containing the extracted information for each documentation element, including confidence levels and context.

## Documentation Elements

The tool is configured to extract the following information from clinical transcripts:

1. **Social Isolation (D0700)**

   - Identifies patient's actual or perceived lack of contact with other people

2. **Bathing (M1830)**

   - Assesses patient's ability to bathe their entire body
   - Includes assistance requirements for safe bathing

3. **Mobility (GG0170)**

   - Evaluates patient's ability to perform self-care and mobility activities

4. **Vital Signs**

   - Extracts current vital signs including:
     - Heart rate
     - Blood pressure
     - Respiratory rate
     - Blood sugar level

5. **Clinical Statement of Summary**
   - Provides a concise overview of:
     - Medical history
     - Diagnoses
     - Medications
     - Relevant test results

## Error Handling

If you encounter the error "Trained system message not found", ensure you have:

1. Created the `.env` file with your OpenAI API key
2. Run the training command with a valid OASIS manual PDF
3. Check that the `training` directory exists and contains the necessary files
