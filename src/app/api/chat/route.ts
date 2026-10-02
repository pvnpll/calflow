import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai/factory';
import { calflowTools } from '@/lib/ai/tools';
import { executeTool } from '@/lib/ai/tool-executor';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { getProfile } from '@/lib/services/profile.service';
import { getActiveGoals } from '@/lib/services/goals.service';
import type { AIMessage } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    // Get user context for system prompt
    const [profile, goals] = await Promise.all([
      getProfile(user.id).catch(() => null),
      getActiveGoals(user.id).catch(() => null),
    ]);

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(profile, goals);

    // Prepare messages for AI
    const aiMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as AIMessage['role'],
        content: m.content,
      })),
    ];

    const provider = getAIProvider();
    let response = await provider.chat(aiMessages, calflowTools);

    // Handle tool calls - execute tools and feed results back
    const maxIterations = 5;
    let iteration = 0;

    while (response.toolCalls && response.toolCalls.length > 0 && iteration < maxIterations) {
      iteration++;

      // Add assistant message with tool calls
      aiMessages.push({
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.toolCalls,
      });

      // Execute each tool call
      for (const toolCall of response.toolCalls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeTool(toolCall.function.name, args, user.id);

          aiMessages.push({
            role: 'tool',
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
          });
        } catch (toolError) {
          aiMessages.push({
            role: 'tool',
            content: JSON.stringify({ error: String(toolError) }),
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
          });
        }
      }

      // Call AI again with tool results
      response = await provider.chat(aiMessages, calflowTools);
    }

    return NextResponse.json({
      role: 'assistant',
      content: response.content || 'I processed your request.',
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    // If OpenAI key is not configured, return a helpful message
    if (String(error).includes('API key') || String(error).includes('OPENAI_API_KEY') || String(error).includes('OLLAMA_API_KEY')) {
      return NextResponse.json({
        role: 'assistant',
        content: 'The AI provider is not configured yet. Please configure your OLLAMA_API_KEY or OPENAI_API_KEY in environment variables.',
      });
    }

    return NextResponse.json({
      role: 'assistant',
      content: `Error communicating with AI assistant: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
