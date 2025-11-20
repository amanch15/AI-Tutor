'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { generateDiagram } from '@/ai/flows/generate-diagram-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GitGraph, Bot, Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';
import { useToast } from '@/hooks/use-toast';

type FormState = {
  diagramCode?: string;
  error?: string;
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? 'Generating...' : (
        <>
          <GitGraph className="mr-2 h-4 w-4" />
          Generate Diagram
        </>
      )}
    </Button>
  );
}

const MermaidPreview = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'forest' });
  }, []);

  useEffect(() => {
    if (chart && containerRef.current) {
      mermaid.render('mermaid-graph', chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch(e => {
            console.error(e)
            if (containerRef.current) {
                containerRef.current.innerHTML = `<p class="text-destructive">Error rendering diagram. Please check the syntax.</p>`;
            }
        });
    }
  }, [chart]);

  return <div ref={containerRef} key={chart} className="w-full min-h-64 flex items-center justify-center p-4" />;
};


export default function DiagramGeneratorPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      const description = formData.get('description') as string;

      if (!description) {
        return { error: 'Please enter a description for the diagram.' };
      }

      const result = await generateDiagram({ description });
      return result;
    } catch (e: any) {
      console.error(e);
      const errorMessage = 'Failed to generate diagram. Please try again.';
      toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: errorMessage
      })
      return { error: errorMessage };
    }
  }, {});

  const handleCopy = () => {
    if (state?.diagramCode) {
      navigator.clipboard.writeText(`\`\`\`mermaid\n${state.diagramCode}\n\`\`\``);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Diagram Generator</h1>
        <p className="text-muted-foreground mt-2">
          Describe a process, system, or idea, and the AI will generate a diagram for you.
        </p>
      </header>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <form action={formAction} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-lg font-semibold">Diagram Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="e.g., 'A flowchart for a user login process.' or 'An ER diagram for a blog with users, posts, and comments.'"
                  className="min-h-80"
                  required
                />
              </div>
              <SubmitButton isPending={isPending} />
            </form>
          </CardContent>
        </Card>

        <div className="min-h-[400px]">
          {isPending && (
            <div className="flex h-full justify-center items-center flex-col text-center border-2 border-dashed rounded-lg">
                <Bot className="h-12 w-12 text-primary animate-bounce"/>
                <p className="mt-4 text-muted-foreground">Our AI is drawing your diagram...</p>
            </div>
          )}

          {state?.error && <p className="text-destructive text-center">{state.error}</p>}
          
          {state?.diagramCode && (
            <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in">
                <CardContent className="p-4">
                    <MermaidPreview chart={state.diagramCode} />
                    <div className="bg-muted/50 p-4 rounded-md mt-4 relative">
                        <pre className="text-sm whitespace-pre-wrap"><code>{`graph TD\n${state.diagramCode}`}</code></pre>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
          )}

          {!isPending && !state?.diagramCode && !state?.error && (
            <div className="text-center h-full text-muted-foreground p-8 border-2 border-dashed rounded-lg flex flex-col justify-center items-center">
                <GitGraph className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your generated diagram will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
