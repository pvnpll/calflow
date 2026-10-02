'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled }: { onSend: (val: string) => void, disabled?: boolean }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="relative flex items-end gap-2 bg-background">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (e.g. 'I had 2 eggs and toast for breakfast')"
        className="min-h-[60px] max-h-[200px] resize-none pb-12 pr-12 rounded-xl"
        rows={2}
        disabled={disabled}
      />
      <Button 
        size="icon" 
        className="absolute right-3 bottom-3 h-8 w-8 rounded-full" 
        onClick={handleSend}
        disabled={!input.trim() || disabled}
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
