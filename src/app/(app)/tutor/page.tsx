'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { provideAiTutoringSupport } from '@/ai/flows/provide-ai-tutoring-support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

type ChatState = {
  messages: Message[];
  error?: string;
};

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  
  const avatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  const handleSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsPending(true);

    try {
      const result = await provideAiTutoringSupport({ studentRequest: input });
      const aiMessage: Message = { role: 'ai', content: result.explanation };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col max-w-3xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Tutor</h1>
        <p className="text-muted-foreground mt-2">
          Stuck on a problem? Ask me anything!
        </p>
      </header>
      
      <ScrollArea className="flex-1 mb-4 pr-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'ai' && (
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-5 w-5"/>
                </Avatar>
              )}
              <div className={cn('max-w-md rounded-lg p-3', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar?.imageUrl} alt="User" data-ai-hint={avatar?.imageHint} />
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className='flex items-start gap-4 justify-start'>
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-5 w-5"/>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 bg-secondary">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-auto">
        <form onSubmit={handleSubmission} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Explain the Pythagorean theorem"
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
