'use server';
/**
 * @fileOverview A Diagram Generator AI agent.
 *
 * - generateDiagram - A function that converts text descriptions into diagrams.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramInputSchema = z.object({
  description: z.string().describe('The text description to be converted into a diagram.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  diagramCode: z.string().describe('The generated diagram code, primarily in MermaidJS format.'),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  input: {schema: GenerateDiagramInputSchema},
  output: {schema: GenerateDiagramOutputSchema},
  prompt: `You are a Diagram Generator AI.
Your job is to convert text descriptions into clear, structured diagrams using MermaidJS, unless the user specifically asks for ASCII.

RULES:
1. Always generate diagrams in MermaidJS format. The code should be wrapped in \`\`\`mermaid ... \`\`\`.
2. Keep diagrams clean, readable, and well-structured.
3. Include labels, arrows, hierarchy, and relationships as appropriate.
4. Only output the diagram code. DO NOT add any explanations unless the user explicitly asks for them.
5. Support: Flowcharts, ER diagrams, Class diagrams, Sequence diagrams, Use-case diagrams, Network diagrams, Mindmaps.
6. If the user gives a topic, automatically choose the best diagram type.
7. If the user gives raw text/notes, convert them into a structured diagram.

Description to convert:
{{{description}}}
`,
});

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.diagramCode) {
      throw new Error('Failed to generate diagram.');
    }
    // Clean up the output to ensure it's just the Mermaid code block
    const mermaidBlock = output.diagramCode.match(/```mermaid([\s\S]*?)```/);
    if (mermaidBlock && mermaidBlock[1]) {
        return { diagramCode: mermaidBlock[1].trim() };
    }
    return { diagramCode: output.diagramCode.replace(/```(mermaid)?/g, '').trim() };
  }
);
