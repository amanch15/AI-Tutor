'use client';

import { useActionState } from 'react';
import { createAiCharacter, type CreateAiCharacterOutput } from '@/ai/flows/create-ai-character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type FormState = CreateAiCharacterOutput & {
  error?: string;
  photoUrl?: string;
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? 'Generating Character...' : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Create Character
        </>
      )}
    </Button>
  );
}

export default function CharacterCreatorPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      const name = formData.get('name') as string;
      const role = formData.get('role') as string;
      const backstory = formData.get('backstory') as string;

      if (!name || !role || !backstory) {
        return { name: '', role: '', personality: '', error: 'Please fill out all fields.' };
      }

      const result = await createAiCharacter({ name, role, backstory });
      return result;
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message.includes('BILLING') 
        ? 'Image generation is unavailable, but your character profile was created.'
        : 'Failed to create character. Please try again.';

      // Even if image fails, we might have partial data to return.
      if (e.result) {
        return { ...e.result, error: errorMessage };
      }
      
      return { name: '', role: '', personality: '', error: 'Failed to create character. Please try again.' };
    }
  }, { name: '', role: '', personality: '' });

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Character Creator</h1>
        <p className="text-muted-foreground mt-2">
          Design the personality of your AI tutor. Make learning more fun and engaging!
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Define Your AI's Personality</CardTitle>
            <CardDescription>Give your AI tutor a unique identity.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form action={formAction} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-lg font-semibold">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Professor Albus"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-lg font-semibold">Role</Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="e.g., A witty historian, a patient math tutor"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backstory" className="text-lg font-semibold">Backstory & Personality</Label>
                <Textarea
                  id="backstory"
                  name="backstory"
                  placeholder="e.g., 'A former explorer who loves to tell stories about ancient civilizations. Speaks with enthusiasm and uses vivid analogies.'"
                  className="min-h-40"
                  required
                />
              </div>
              <SubmitButton isPending={isPending} />
            </form>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>See your AI character's personality profile.</CardDescription>
                </CardHeader>
                <CardContent>
                {isPending && (
                    <div className="flex justify-center items-center flex-col text-center p-8">
                        <Bot className="h-12 w-12 text-primary animate-pulse"/>
                        <p className="mt-4 text-muted-foreground">Crafting a new persona...</p>
                    </div>
                )}

                {state?.error && <p className="text-destructive text-center mb-4">{state.error}</p>}
                
                {state?.personality && !isPending && (
                    <div className="animate-in fade-in space-y-4">
                         <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {state.photoUrl ? (
                                    <AvatarImage src={state.photoUrl} alt="AI Character" />
                                ) : (
                                    <AvatarFallback><User /></AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold font-headline">{state.name}</h3>
                                <p className="text-muted-foreground">{state.role}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Personality & Backstory</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.personality}</p>
                        </div>
                        {state.imagePrompt && (
                           <div>
                                <h4 className="font-semibold mb-2">Image Prompt</h4>
                                <p className="text-xs text-muted-foreground/80 bg-secondary p-2 rounded-md font-code">
                                    {state.imagePrompt}
                                </p>
                           </div>
                        )}
                    </div>
                )}

                {!state?.personality && !isPending && !state?.error && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>Your character's profile will appear here once created.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
