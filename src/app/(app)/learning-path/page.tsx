'use client';

import { useActionState } from 'react';
import { generatePersonalizedLearningPath, type GeneratePersonalizedLearningPathOutput } from '@/ai/flows/generate-personalized-learning-path';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Bot, BookOpen, Video, Newspaper } from 'lucide-react';
import Link from 'next/link';

type FormState = GeneratePersonalizedLearningPathOutput & {
  error?: string;
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? 'Generating...' : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Path
        </>
      )}
    </Button>
  );
}

const getIconForResource = (resource: string) => {
    const lowerCaseResource = resource.toLowerCase();
    if (lowerCaseResource.includes('video') || lowerCaseResource.includes('youtube')) {
      return <Video className="h-4 w-4 text-accent-foreground" />;
    }
    if (lowerCaseResource.includes('article') || lowerCaseResource.includes('blog')) {
      return <Newspaper className="h-4 w-4 text-accent-foreground" />;
    }
    if (lowerCaseResource.includes('book') || lowerCaseResource.includes('textbook')) {
      return <BookOpen className="h-4 w-4 text-accent-foreground" />;
    }
    return <BookOpen className="h-4 w-4 text-accent-foreground" />;
  };

const pinColors = [
    'bg-pink-500',
    'bg-teal-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-sky-500',
    'bg-rose-500',
    'bg-green-500',
];

export default function LearningPathPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      const currentKnowledge = formData.get('currentKnowledge') as string;
      const learningGoals = formData.get('learningGoals') as string;

      if (!currentKnowledge || !learningGoals) {
        return { learningPath: [], error: 'Please fill out both fields.' };
      }

      const result = await generatePersonalizedLearningPath({ currentKnowledge, learningGoals });
      return result;
    } catch (e) {
      console.error(e);
      return { learningPath: [], error: 'Failed to generate learning path. Please try again.' };
    }
  }, { learningPath: [] });

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Create Your Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Tell our AI what you know and what you want to learn, and we&apos;ll craft a unique plan just for you.
        </p>
      </header>

      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
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
      
      {isPending && (
        <div className="flex justify-center items-center flex-col text-center">
            <Bot className="h-12 w-12 text-primary animate-bounce"/>
            <p className="mt-4 text-muted-foreground">Our AI is crafting your personalized roadmap...</p>
        </div>
      )}

      {state?.error && <p className="text-destructive text-center mb-4">{state.error}</p>}
      
      {state?.learningPath && state.learningPath.length > 0 && (
        <div>
            <h2 className="text-3xl font-bold font-headline mb-12 text-center">Your Personalized Roadmap</h2>
            <div className="flow-root">
                <ul className="-mb-8">
                {state.learningPath.map((step, index) => (
                    <li key={index} className="animate-in fade-in" style={{ animationFillMode: 'backwards', animationDelay: `${index * 250}ms` }}>
                    <div className="relative pb-8">
                        {index !== state.learningPath.length - 1 ? (
                        <span className="absolute left-9 top-9 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-6">
                            {/* Pin */}
                            <div className="relative">
                                <div className={`h-18 w-18 ${pinColors[index % pinColors.length]} rounded-full flex items-center justify-center text-white ring-8 ring-background`}>
                                    <div className="text-center">
                                        <div className="font-bold text-2xl">{index + 1}</div>
                                    </div>
                                </div>
                            </div>
                             <Card className="flex-1 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow min-w-0">
                                <CardHeader>
                                <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                                <CardDescription>{step.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold mb-3">Recommended Resources</h4>
                                    <div className="grid gap-3">
                                        {step.resources.map((resource, resIndex) => (
                                            <Link href="#" key={resIndex} className="group/resource flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground">
                                                    {getIconForResource(resource)}
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground group-hover/resource:text-foreground">{resource}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    </li>
                ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
}
