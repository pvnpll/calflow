import OpenAI from 'openai';
import { AIProvider, AIMessage, AIToolDefinition, AIResponse } from './provider';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OLLAMA_API_KEY || process.env.OPENAI_API_KEY || 'ollama';
    const baseURL = process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1';
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
    this.model = process.env.NEXT_PUBLIC_AI_MODEL || process.env.OLLAMA_MODEL || process.env.AI_MODEL || 'nemotron-3-ultra';
  }

  async chat(messages: AIMessage[], tools?: AIToolDefinition[]): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        tools: tools && tools.length > 0 ? (tools as any) : undefined,
        tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
      });

      const choice = response.choices[0];
      const message = choice?.message;

      return {
        content: message?.content || null,
        toolCalls: message?.tool_calls
          ?.filter((tc: any) => tc.type === 'function' && tc.function)
          .map((tc: any) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            }
          })),
        finishReason: choice?.finish_reason || 'stop',
      };
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw error;
    }
  }
}
