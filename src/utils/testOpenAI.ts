// Test utility for OpenAI API connection
import { openaiClient, isOpenAIConfigured, OPENAI_API_KEY } from '../config/openai';

/**
 * Test OpenAI API connection
 * Returns a detailed test result
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  configured: boolean;
  message: string;
  details?: any;
  error?: string;
}> {
  // Check if API key is configured
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      configured: false,
      message: '❌ API key is not configured',
      error: 'Please set VITE_OPENAI_API_KEY in your .env file',
    };
  }

  // Check API key format (should start with sk-)
  if (!OPENAI_API_KEY.startsWith('sk-')) {
    return {
      success: false,
      configured: true,
      message: '⚠️ API key format appears incorrect',
      error: 'OpenAI API keys typically start with "sk-"',
      details: {
        keyPrefix: OPENAI_API_KEY.substring(0, 10) + '...',
      },
    };
  }

  try {
    // Make a simple test request
    const testPrompt = 'Say "API connection successful" if you can read this.';
    
    const response = await openaiClient.chatCompletion(
      [
        {
          role: 'user',
          content: testPrompt,
        },
      ],
      {
        model: 'gpt-3.5-turbo', // Use cheaper model for testing
        temperature: 0.7,
        max_tokens: 50,
      }
    );

    const aiResponse = response.choices[0]?.message?.content || '';

    return {
      success: true,
      configured: true,
      message: '✅ OpenAI API connection successful!',
      details: {
        model: response.model,
        response: aiResponse,
        usage: response.usage,
      },
    };
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    let errorDetails = {};

    if (error.message) {
      errorMessage = error.message;
    }

    // Parse common error scenarios
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'Invalid API key. Please check your API key.';
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection.';
    }

    return {
      success: false,
      configured: true,
      message: '❌ API connection failed',
      error: errorMessage,
      details: {
        fullError: error.toString(),
      },
    };
  }
}

/**
 * Quick test function that logs results to console
 */
export async function quickTestOpenAI() {
  console.log('🔍 Testing OpenAI API connection...');
  console.log('API Key configured:', isOpenAIConfigured());
  
  if (isOpenAIConfigured()) {
    console.log('API Key prefix:', OPENAI_API_KEY.substring(0, 10) + '...');
  }

  const result = await testOpenAIConnection();
  
  console.log('Test Result:', result.message);
  if (result.success) {
    console.log('✅ Success! Details:', result.details);
  } else {
    console.error('❌ Failed! Error:', result.error);
    if (result.details) {
      console.error('Details:', result.details);
    }
  }

  return result;
}
