'use client';

import { useFormState } from 'react-dom';
import { recommendRelevantLearningResources } from '@/ai/flows/recommend-relevant-learning-resources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, Video, Newspaper, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type FormState = {
  resources: string[];
  error?: string;
} | null;

function SubmitButton() {
  const [isPending, setIsPending] = useState(false);
  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto" onClick={() => setIsPending(true)}>
      Find Resources
    </Button>
  );
}

const getIconForResource = (resource: string) => {
  const lowerCaseResource = resource.toLowerCase();
  if (lowerCaseResource.includes('video') || lowerCaseResource.includes('youtube')) {
    return <Video className="h-5 w-5 text-accent" />;
  }
  if (lowerCaseResource.includes('article') || lowerCaseResource.includes('blog')) {
    return <Newspaper className="h-5 w-5 text-accent" />;
  }
  if (lowerCaseResource.includes('book') || lowerCaseResource.includes('textbook')) {
    return <Book className="h-5 w-5 text-accent" />;
  }
  return <BookOpen className="h-5 w-5 text-accent" />;
};


export default function ResourcesPage() {
  const [state, formAction] = useFormState<FormState, FormData>(async (prevState, formData) => {
    try {
      const studyArea = formData.get('studyArea') as string;
      if (!studyArea) {
        return { resources: [], error: 'Please enter a study area.' };
      }
      const result = await recommendRelevantLearningResources({ studyArea });
      return { resources: result.resources };
    } catch (e) {
      return { resources: [], error: 'Failed to find resources. Please try again.' };
    }
  }, null);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Find Learning Resources</h1>
        <p className="text-muted-foreground mt-2">
          Enter a topic, and our AI will suggest videos, articles, and books to help you learn.
        </p>
      </header>
      
      <Card className="mb-8">
        <CardContent className="p-6">
            <form action={formAction} className="flex flex-col sm:flex-row items-end gap-4">
                <div className="grid gap-2 w-full">
                    <Label htmlFor="studyArea" className="font-semibold">Study Area</Label>
                    <Input id="studyArea" name="studyArea" placeholder="e.g., Quantum Physics, Renaissance Art" required />
                </div>
                <SubmitButton />
            </form>
        </CardContent>
      </Card>

      {state?.error && <p className="text-destructive text-center mb-4">{state.error}</p>}

      {state?.resources && state.resources.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">Recommended for you</h2>
          <div className="grid gap-4">
            {state.resources.map((resource, index) => (
              <Card key={index} className="hover:bg-secondary/50 transition-colors">
                 <Link href="#" className="block p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getIconForResource(resource)}
                            <p className="font-medium">{resource}</p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
