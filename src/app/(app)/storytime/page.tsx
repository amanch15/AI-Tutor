'use client';

import { useActionState } from 'react';
import { generateVisualStory, type GenerateVisualStoryOutput } from '@/ai/flows/generate-visual-story';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Sparkles, Bot, BookImage } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type FormState = GenerateVisualStoryOutput & {
  error?: string;
};

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

  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      const topic = formData.get('topic') as string;
      if (!topic) {
        return { title: '', pages: [], error: 'Please enter a topic.' };
      }
      const result = await generateVisualStory({ topic });
      return result;
    } catch (e) {
      console.error(e);
      return { title: '', pages: [], error: 'Failed to generate story. Please try again.' };
    }
  }, { title: '', pages: [] });

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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
            <SubmitButton isPending={isPending} />
          </form>
        </CardContent>
      </Card>
      
      {isPending && (
        <div className="flex justify-center items-center flex-col text-center">
          <Bot className="h-12 w-12 text-primary animate-bounce"/>
          <p className="mt-4 text-muted-foreground">Our AI is dreaming up a new story for you...</p>
        </div>
      )}

      {state?.error && <p className="text-destructive text-center mb-4">{state.error}</p>}
      
      {state?.pages && state.pages.length > 0 && (
        <div className="animate-in fade-in">
          <h2 className="text-3xl font-bold font-headline mb-2 text-center">{state.title}</h2>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {state.pages.map((page, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <div className="grid md:grid-cols-2">
                      <div className="relative aspect-square bg-secondary flex items-center justify-center">
                        {/* In a real app, we'd generate this image */}
                        <Image 
                           src={`https://picsum.photos/seed/${state.title.replace(/\s/g, '-')}-${index}/600/600`}
                           alt={page.imagePrompt}
                           fill
                           className="object-cover"
                           data-ai-hint="story illustration"
                        />
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

      {!isPending && (!state?.pages || state.pages.length === 0) && !state?.error && (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <BookImage className="h-12 w-12 mx-auto text-muted-foreground/50"/>
            <p className="mt-4">Your generated story will appear here.</p>
        </div>
      )}

    </div>
  );
}
