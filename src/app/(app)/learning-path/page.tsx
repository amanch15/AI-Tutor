'use client';

import { useState, useActionState } from 'react';
import { generatePersonalizedLearningPath } from '@/ai/flows/generate-personalized-learning-path';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

type FormState = {
  learningPath: string;
  error?: string;
} | null;

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      <Sparkles className="mr-2 h-4 w-4" />
      Generate Path
    </Button>
  );
}


export default function LearningPathPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      const currentKnowledge = formData.get('currentKnowledge') as string;
      const learningGoals = formData.get('learningGoals') as string;

      if (!currentKnowledge || !learningGoals) {
        return { learningPath: '', error: 'Please fill out both fields.' };
      }

      const result = await generatePersonalizedLearningPath({ currentKnowledge, learningGoals });
      return { learningPath: result.learningPath };
    } catch (e) {
      return { learningPath: '', error: 'Failed to generate learning path. Please try again.' };
    }
  }, null);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Create Your Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Tell our AI what you know and what you want to learn, and we&apos;ll craft a unique plan just for you.
        </p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <form action={formAction} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="currentKnowledge" className="text-lg font-semibold">Your Current Knowledge</Label>
              <Textarea
                id="currentKnowledge"
                name="currentKnowledge"
                placeholder="e.g., 'I know basic algebra and geometry.' or 'I am a beginner in Python programming.'"
                className="min-h-32"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="learningGoals" className="text-lg font-semibold">Your Learning Goals</Label>
              <Textarea
                id="learningGoals"
                name="learningGoals"
                placeholder="e.g., 'I want to understand calculus for my university course.' or 'I want to build a web application with Django.'"
                className="min-h-32"
                required
              />
            </div>
            <SubmitButton isPending={isPending} />
          </form>
        </CardContent>
      </Card>
      
      {state?.error && <p className="text-destructive text-center mb-4">{state.error}</p>}
      
      {state?.learningPath && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Sparkles className="text-primary"/>
              Your Personalized Path
            </CardTitle>
            <CardDescription>Follow these steps to achieve your goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-stone dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-body text-sm bg-secondary p-4 rounded-md">
                    {state.learningPath}
                </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
