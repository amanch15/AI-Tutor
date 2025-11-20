'use client';

import { useState, useEffect, useRef } from 'react';
import { provideAiTutoringSupport } from '@/ai/flows/provide-ai-tutoring-support';
import { generateAudio } from '@/ai/flows/generate-audio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export default function VoiceAssistantPage() {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Your browser does not support voice recognition.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        handleUserQuery(finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
        toast({
            variant: 'destructive',
            title: 'Voice Recognition Error',
            description: event.error === 'not-allowed' ? 'Microphone access denied.' : `An error occurred: ${event.error}`,
        });
        setStatus('error');
    };

    recognitionRef.current = recognition;
  }, [toast]);

  const handleMicClick = () => {
    if (status === 'listening') {
      recognitionRef.current?.stop();
      setStatus('idle');
    } else {
      setTranscript('');
      setAiResponse('');
      setInterimTranscript('');
      try {
        recognitionRef.current?.start();
        setStatus('listening');
      } catch (e) {
        // This can happen if start() is called while it's already running
        console.error("Error starting recognition:", e);
      }
    }
  };

  const handleUserQuery = async (query: string) => {
    if (!query.trim()) return;
    setStatus('thinking');
    recognitionRef.current?.stop();

    try {
      const textResult = await provideAiTutoringSupport({ studentRequest: query });
      setAiResponse(textResult.explanation);

      const audioResult = await generateAudio({ text: textResult.explanation });
      
      setStatus('speaking');
      
      const audio = audioRef.current;
      if (audio) {
          audio.src = audioResult.audioDataUri;
          audio.play().catch(e => {
            console.error("Audio play failed:", e);
            setStatus('error');
          });
          audio.onended = () => setStatus('idle');
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Tutor Error',
        description: 'There was a problem getting a response from the AI.',
      });
      setStatus('error');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Here is my response...';
      case 'error':
        return 'An error occurred. Please try again.';
      default:
        return 'Press the button and ask me a question.';
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Voice Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Your hands-free learning partner.
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Button
          onClick={handleMicClick}
          size="icon"
          className={cn(
            'h-32 w-32 rounded-full mb-8 transition-all duration-300 shadow-xl',
            status === 'listening' && 'bg-destructive hover:bg-destructive/90 scale-110',
            status === 'thinking' && 'bg-primary animate-pulse',
            status === 'speaking' && 'bg-green-600'
          )}
        >
          {status === 'thinking' ? (
            <Loader2 className="h-16 w-16 animate-spin" />
          ) : status === 'listening' ? (
            <MicOff className="h-16 w-16" />
          ) : (
            <Mic className="h-16 w-16" />
          )}
        </Button>
        
        <p className="text-lg text-muted-foreground h-12">{getStatusText()}</p>
      </div>

      {(transcript || interimTranscript || aiResponse) && (
        <Card className="w-full mt-8 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            {transcript && (
                <div className="text-left">
                    <p className="font-semibold">You asked:</p>
                    <p className="text-muted-foreground">{transcript} <span className="italic opacity-70">{interimTranscript}</span></p>
                </div>
            )}
            {aiResponse && (
                <div className="text-left">
                    <p className="font-semibold flex items-center gap-2"><Bot className="h-5 w-5" /> AI Response:</p>
                    <p className="text-muted-foreground">{aiResponse}</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
