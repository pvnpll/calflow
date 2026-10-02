export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIResponse {
  content: string | null;
  toolCalls?: AIToolCall[];
  finishReason: string;
}

export interface AIProvider {
  name: string;
  chat(messages: AIMessage[], tools?: AIToolDefinition[]): Promise<AIResponse>;
}
