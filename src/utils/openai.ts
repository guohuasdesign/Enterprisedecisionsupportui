// Utility functions for OpenAI API
import { openaiClient, isOpenAIConfigured } from '../config/openai';

/**
 * Generate a response using OpenAI
 */
export async function generateAIResponse(prompt: string, systemPrompt?: string) {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system' as const, content: systemPrompt });
  }
  messages.push({ role: 'user' as const, content: prompt });

  try {
    const response = await openaiClient.chatCompletion(messages, {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

/**
 * Generate scenario analysis for decision support
 */
export async function generateScenarioAnalysis(context: string) {
  const systemPrompt = `You are an expert in logistics and supply chain risk management. 
Analyze the given situation and provide strategic recommendations for decision support.`;

  const prompt = `Analyze the following logistics situation and provide strategic recommendations:

${context}

Please provide:
1. Risk assessment
2. Recommended actions
3. Potential scenarios
4. Cost-benefit analysis`;

  return generateAIResponse(prompt, systemPrompt);
}

/**
 * Generate incident analysis
 */
export async function generateIncidentAnalysis(incidentDetails: string) {
  const systemPrompt = `You are an expert in maritime logistics and incident response. 
Provide detailed analysis of incidents affecting shipping operations.`;

  const prompt = `Analyze the following incident:

${incidentDetails}

Please provide:
1. Impact assessment
2. Affected assets
3. Recommended mitigation strategies
4. Timeline implications`;

  return generateAIResponse(prompt, systemPrompt);
}
