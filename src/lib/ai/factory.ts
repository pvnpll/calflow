import { AIProvider } from './provider';
import { OpenAIProvider } from './openai.provider';
import { OllamaProvider } from './ollama.provider';

export function getAIProvider(): AIProvider {
  const providerStr = (process.env.AI_PROVIDER || (process.env.OLLAMA_API_KEY ? 'ollama' : 'openai')).toLowerCase();

  switch (providerStr) {
    case 'ollama':
      return new OllamaProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      throw new Error('Gemini provider not yet implemented');
    default:
      return new OllamaProvider();
  }
}

