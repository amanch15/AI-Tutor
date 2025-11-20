'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { generateVisualStory, type GenerateVisualStoryOutput } from '@/ai/flows/generate-visual-story';
import { generateStoryAudio } from '@/ai/flows/generate-story-audio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Sparkles, Bot, BookImage, Volume2, Loader, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StoryPageState = GenerateVisualStoryOutput & {
  error?: string;
};

type AudioState = {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  audioDataUri?: string;
  error?: string;
  currentPage: number;
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
    setAudioState({ status: 'idle', currentPage: -1 });
    try {
      const topic = formData.get('topic') as string;
      if (!topic) {
        return { title: '', pages: [], error: 'Please enter a topic.' };
      }
      const result = await generateVisualStory({ topic });
      return result;
    } catch (e: any) {
      console.error(e);
      const errorMessage = 'Failed to generate story. Please try again.';
      
      return { title: '', pages: [], error: errorMessage };
    }
  }, { title: '', pages: [] });

  const [audioState, setAudioState] = useState<AudioState>({ status: 'idle', currentPage: -1 });
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      const newPage = api.selectedScrollSnap() + 1;
      setCurrent(newPage);
      // If reading aloud, automatically fetch audio for the new page
      if (isReadingAloud) {
        handlePagePlayback(newPage - 1);
      } else {
        // If not reading aloud, just pause any existing audio
        audioRef.current?.pause();
        setAudioState(prev => ({...prev, status: 'paused'}));
      }
    });
  }, [api, isReadingAloud]);

  useEffect(() => {
    if (storyState.error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: storyState.error,
      });
    }
  }, [storyState.error, toast]);
  
  const handlePagePlayback = async (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= storyState.pages.length) {
        setIsReadingAloud(false);
        return;
    }

    setAudioState({ status: 'loading', currentPage: pageIndex });
    try {
      const pageText = storyState.pages[pageIndex].text;
      const result = await generateStoryAudio({ storyText: pageText });
      setAudioState({ status: 'playing', audioDataUri: result.audioDataUri, currentPage: pageIndex });
    } catch (e: any) {
      console.error(e);
      const error = 'Failed to generate audio for this page. Please try again.';
      setAudioState({ status: 'error', error, currentPage: pageIndex });
      toast({ variant: 'destructive', title: 'Audio Generation Failed', description: error });
      setIsReadingAloud(false);
    }
  };

  const handleListen = () => {
    if (isReadingAloud) {
        // If currently reading, stop everything
        setIsReadingAloud(false);
        audioRef.current?.pause();
        setAudioState(prev => ({...prev, status: 'paused'}));
    } else {
        // If not reading, start from the current page
        setIsReadingAloud(true);
        handlePagePlayback(current - 1);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.status === 'playing' && audioState.audioDataUri) {
        if (audio.src !== audioState.audioDataUri) {
            audio.src = audioState.audioDataUri;
        }
        audio.play().catch(e => console.error("Audio play failed:", e));
        audio.onended = () => {
            // If we were reading aloud, move to the next page
            if (isReadingAloud && api) {
                if (api.canScrollNext()) {
                    api.scrollNext();
                } else {
                    // Reached the end of the story
                    setIsReadingAloud(false);
                    setAudioState({ status: 'idle', currentPage: -1 });
                }
            } else {
              setAudioState(prev => ({...prev, status: 'idle'}));
            }
        };
    }
  }, [audioState, isReadingAloud, api]);


  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Storyteller</h1>
        <p className="text-muted-foreground mt-2">
          Turn any topic into an audio story.
        </p>
      </header>

      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
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
                    {isReadingAloud && <Pause className="mr-2 h-4 w-4" />}
                    {!isReadingAloud && <Play className="mr-2 h-4 w-4" />}
                    {isReadingAloud ? 'Stop Reading' : 'Read Aloud'}
                </Button>
                <audio ref={audioRef} className="hidden" />
            </div>

          <Carousel setApi={setApi} className="w-full max-w-2xl mx-auto">
            <CarouselContent>
              {storyState.pages.map((page, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
                    <div className="p-6 md:p-8 min-h-60 flex items-center justify-center">
                      <p className="text-muted-foreground text-lg text-center leading-relaxed">{page.text}</p>
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
