# OpenAI API Configuration

## Setup Steps

1. **Create `.env` file**
   Create a `.env` file in the project root directory with the following content:
   ```
   VITE_OPENAI_API_KEY=

2. **Restart Development Server**
   After creating or modifying the `.env` file, you need to restart the Vite development server for changes to take effect.

## Usage

### Basic Usage

```typescript
import { openaiClient, isOpenAIConfigured } from './config/openai';

// Check if API key is configured
if (isOpenAIConfigured()) {
  // Use OpenAI API
  const response = await openaiClient.generateText('Hello, how are you?');
  console.log(response);
}
```

### Using Utility Functions

```typescript
import { generateAIResponse, generateScenarioAnalysis } from './utils/openai';

// Generate AI response
const response = await generateAIResponse('Analyze this logistics situation...');

// Generate scenario analysis
const analysis = await generateScenarioAnalysis('Suez Canal strike incident...');
```

## Security Notes

⚠️ **Important**: The `.env` file has been added to `.gitignore` and will not be committed to the Git repository.

- Do not commit API keys to version control systems
- Production environments should use backend services to call OpenAI API instead of using API keys directly in the frontend
- Current configuration is for development and testing only, and should be replaced with a more secure solution later

## API Client Features

- `openaiClient.chatCompletion()` - Full chat completion API
- `openaiClient.generateText()` - Simplified text generation
- `generateAIResponse()` - Utility function: Generate AI response
- `generateScenarioAnalysis()` - Utility function: Generate scenario analysis
- `generateIncidentAnalysis()` - Utility function: Generate incident analysis
