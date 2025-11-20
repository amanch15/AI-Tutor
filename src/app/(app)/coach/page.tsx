'use client';

import { useState, useRef } from 'react';
import { provideResumeAndInterviewCoaching } from '@/ai/flows/provide-resume-and-interview-coaching';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, Briefcase, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { getAvatarColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type Message = {
  role: 'user' | 'ai';
  content: string;
  attachmentUri?: string;
};

// A simple markdown to HTML converter
const MarkdownContent = ({ content }: { content: string }) => {
    const html = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>') // Basic list support
        .replace(/<\/ul>\n<ul>/g, '') // Fix for consecutive list items
        .replace(/\n/g, '<br />')
        .replace(/<\/ul><br \/>/g, '</ul>'); 

  return <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { user } = useUser();
  const avatarColor = getAvatarColor(user?.displayName?.charAt(0));
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<{ uri: string, type: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachment({ uri: e.target?.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() && !attachment) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      attachmentUri: attachment?.uri
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    setInput('');
    setAttachment(null);
    setIsPending(true);

    try {
      const chatHistoryForAI = newMessages.map(m => ({ role: m.role, content: m.content }));

      const result = await provideResumeAndInterviewCoaching({ 
        userRequest: input,
        attachmentDataUri: userMessage.attachmentUri,
        chatHistory: chatHistoryForAI,
      });
      const aiMessage: Message = { role: 'ai', content: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Coach Error",
        description: "There was a problem getting a response from the AI coach."
      })
    } finally {
      setIsPending(false);
       if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col max-w-3xl mx-auto">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold font-headline">Resume & Interview Coach</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Your personal coach for career preparation. Upload your resume, ask for mock interviews, and more.
        </p>
      </header>
      
      <ScrollArea className="flex-1 mb-4 pr-4">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
                <Briefcase className="h-12 w-12 mx-auto mb-4" />
                <p>Ask a question to get started. For example: "Review my resume for a software engineer role." or "Give me some common behavioral interview questions."</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-4 animate-in fade-in', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'ai' && (
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-primary/20">
                  <Bot className="h-5 w-5"/>
                </Avatar>
              )}
              <div className={cn('max-w-prose rounded-lg p-3 text-sm shadow-md', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}>
                 {message.attachmentUri && (
                    <div className="mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">Attachment:</p>
                        <Image 
                            src={message.attachmentUri} 
                            alt="User attachment"
                            width={200}
                            height={200}
                            className="rounded-md object-cover"
                        />
                    </div>
                )}
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <MarkdownContent content={message.content} />
                )}
              </div>
              {message.role === 'user' && user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={cn('font-bold', avatarColor)}>
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className='flex items-start gap-4 justify-start'>
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-primary/20">
                    <Bot className="h-5 w-5"/>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 bg-card rounded-bl-none shadow-md">
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
      
      <div className="mt-auto bg-background/80 backdrop-blur-sm p-2 rounded-lg border">
         {attachment && (
          <div className="p-2 relative">
            <div className="relative h-24 w-24">
                <Image
                src={attachment.uri}
                alt="Attachment preview"
                fill
                className="rounded-md object-cover"
                />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmission} className="flex items-center gap-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask your career coach...`}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isPending}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-coach"
            accept="image/*,application/pdf"
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => document.getElementById('file-upload-coach')?.click()} disabled={isPending}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" disabled={isPending || (!input.trim() && !attachment)}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
