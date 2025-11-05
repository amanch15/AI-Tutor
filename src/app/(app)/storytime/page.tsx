'use client';

import { useActionState, useState, useTransition, useEffect, useRef } from 'react';
import { generateVisualStory, type GenerateVisualStoryOutput } from '@/ai/flows/generate-visual-story';
import { generateStoryAudio } from '@/ai/flows/generate-story-audio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Sparkles, Bot, BookImage, Volume2, Loader, AlertTriangle, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type StoryPageState = GenerateVisualStoryOutput & {
  error?: string;
};

type AudioState = {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  audioDataUri?: string;
  error?: string;
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? 'Writing Story...' : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Story
        </>
      )}
    </Button>
  );
}

export default function StoryTimePage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [storyState, formAction, isStoryPending] = useActionState<StoryPageState, FormData>(async (prevState, formData) => {
    setAudioState({ status: 'idle' });
    try {
      const topic = formData.get('topic') as string;
      if (!topic) {
        return { title: '', pages: [], error: 'Please enter a topic.' };
      }
      const result = await generateVisualStory({ topic });
      return result;
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message.includes('BILLING') 
        ? 'Image generation is unavailable, but the story was created. Please enable billing to see images.'
        : 'Failed to generate story. Please try again.';
      
      // If partial results are available, show them.
      if (e.result) {
        return { ...e.result, error: errorMessage };
      }
      return { title: '', pages: [], error: 'Failed to generate story. Please try again.' };
    }
  }, { title: '', pages: [] });

  const [audioState, setAudioState] = useState<AudioState>({ status: 'idle' });

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (storyState.error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: storyState.error,
      });
    }
  }, [storyState.error, toast]);
  
  const handleListen = async () => {
    if (audioState.status === 'playing') {
      audioRef.current?.pause();
      setAudioState(prev => ({...prev, status: 'paused'}));
      return;
    }

    if (audioState.status === 'paused' || (audioState.status === 'idle' && audioState.audioDataUri)) {
      audioRef.current?.play();
      setAudioState(prev => ({...prev, status: 'playing'}));
      return;
    }

    setAudioState({ status: 'loading' });
    try {
      const storyText = storyState.pages.map(p => p.text).join('\n');
      const result = await generateStoryAudio({ storyText });
      setAudioState({ status: 'playing', audioDataUri: result.audioDataUri });
    } catch (e: any) {
      console.error(e);
      const error = 'Failed to generate audio. Please try again.';
      setAudioState({ status: 'error', error });
      toast({ variant: 'destructive', title: 'Audio Generation Failed', description: error });
    }
  };

  useEffect(() => {
    if (audioState.status === 'playing' && audioState.audioDataUri && audioRef.current) {
        if (audioRef.current.src !== audioState.audioDataUri) {
            audioRef.current.src = audioState.audioDataUri;
        }
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        audioRef.current.onended = () => setAudioState(prev => ({...prev, status: 'idle'}));
    }
  }, [audioState]);


  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Storyteller</h1>
        <p className="text-muted-foreground mt-2">
          Turn any topic into a beautifully illustrated story.
        </p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="topic" className="text-lg font-semibold">What do you want to learn about?</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Photosynthesis, The Roman Empire, Black Holes"
                required
              />
            </div>
            <SubmitButton isPending={isStoryPending} />
          </form>
        </CardContent>
      </Card>
      
      {isStoryPending && (
        <div className="flex justify-center items-center flex-col text-center">
          <Bot className="h-12 w-12 text-primary animate-bounce"/>
          <p className="mt-4 text-muted-foreground">Our AI is dreaming up a new story for you...</p>
        </div>
      )}
      
      {storyState?.pages && storyState.pages.length > 0 && (
        <div className="animate-in fade-in space-y-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline mb-2">{storyState.title}</h2>
                <Button onClick={handleListen} disabled={audioState.status === 'loading'}>
                    {audioState.status === 'loading' && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {audioState.status === 'playing' && <Pause className="mr-2 h-4 w-4" />}
                    {audioState.status === 'paused' && <Play className="mr-2 h-4 w-4" />}
                    {(audioState.status === 'idle' || audioState.status === 'error') && <Volume2 className="mr-2 h-4 w-4" />}
                    {audioState.status === 'playing' ? 'Pause' : audioState.status === 'paused' ? 'Resume' : 'Listen to Story'}
                </Button>
                <audio ref={audioRef} className="hidden" />
            </div>

          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {storyState.pages.map((page, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <div className="grid md:grid-cols-2">
                      <div className="relative aspect-square bg-secondary flex items-center justify-center">
                        {page.imageUrl ? (
                           <Image 
                           src={page.imageUrl}
                           alt={page.imagePrompt}
                           fill
                           className="object-cover"
                           unoptimized
                        />
                        ) : (
                          <div className='flex flex-col items-center text-muted-foreground text-center p-4'>
                            <AlertTriangle className='h-8 w-8 mb-2' />
                            <p className='text-sm font-semibold'>Image generation failed</p>
                            <p className='text-xs'>Billing may be required.</p>
                          </div>
                        )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="flex flex-col p-6 md:p-8">
                        <p className="flex-1 text-muted-foreground">{page.text}</p>
                        <p className="text-xs text-muted-foreground/60 mt-4 font-code bg-secondary/50 p-2 rounded-md">
                          <span className="font-semibold">Image Prompt:</span> {page.imagePrompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
          <div className="py-2 text-center text-sm text-muted-foreground">
            Page {current} of {count}
          </div>
        </div>
      )}

      {!isStoryPending && (!storyState?.pages || storyState.pages.length === 0) && !storyState.error && (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <BookImage className="h-12 w-12 mx-auto text-muted-foreground/50"/>
            <p className="mt-4">Your generated story will appear here.</p>
        </div>
      )}

    </div>
  );
}
