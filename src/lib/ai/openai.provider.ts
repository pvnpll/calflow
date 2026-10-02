import OpenAI from 'openai';
import { AIProvider, AIMessage, AIToolDefinition, AIResponse } from './provider';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY is missing. AI features will not work.');
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.AI_MODEL || 'gpt-4o';
  }

  async chat(messages: AIMessage[], tools?: AIToolDefinition[]): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        tools: tools as any,
        tool_choice: tools?.length ? 'auto' : 'none',
      });

      const choice = response.choices[0];
      const message = choice.message;

      return {
        content: message.content,
        toolCalls: message.tool_calls
          ?.filter((tc: any) => tc.type === 'function' && tc.function)
          .map((tc: any) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            }
          })),
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to communicate with OpenAI provider');
    }
  }
}
