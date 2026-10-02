import { AIProvider } from './provider';
import { OpenAIProvider } from './openai.provider';

export function getAIProvider(): AIProvider {
  const providerStr = process.env.AI_PROVIDER?.toLowerCase() || 'openai';

  switch (providerStr) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      throw new Error('Gemini provider not yet implemented');
    default:
      return new OpenAIProvider();
  }
}
