'use client';
import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you log meals, check your progress, or answer nutrition questions. What did you have for lunch?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore messages from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calflow_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to restore chat messages:', e);
    }
  }, []);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    try {
      localStorage.setItem('calflow_chat_messages', JSON.stringify(msgs));
    } catch (e) {
      console.error('Failed to persist chat messages:', e);
    }
  };

  const clearChat = () => {
    const initial: Message[] = [
      { role: 'assistant', content: 'Hi! I can help you log meals, check your progress, or answer nutrition questions. What did you have for lunch?' }
    ];
    saveMessages(initial);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const newMessages = [...messages, { role: 'user', content } as Message];
    saveMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = [...newMessages, { role: 'assistant', content: data.content } as Message];
        saveMessages(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full relative">
      <div className="sticky top-14 md:top-0 z-30 p-3 md:p-4 border-b flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Nutrition Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by {process.env.NEXT_PUBLIC_AI_MODEL || 'gemma4:31b'}</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border hover:bg-muted transition-colors active:scale-95"
        >
          Clear Chat
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 flex flex-col">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-3 text-muted-foreground text-sm items-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">AI</div>
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>
      
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 p-4 md:p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 mt-auto">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
