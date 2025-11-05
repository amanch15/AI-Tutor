'use server';
/**
 * @fileOverview An AI tutoring support agent.
 *
 * - provideAiTutoringSupport - A function that provides AI tutoring support based on student requests.
 * - ProvideAiTutoringSupportInput - The input type for the provideAiTutoringSupport function.
 * - ProvideAiTutoringSupportOutput - The return type for the provideAiTutoringSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiTutoringSupportInputSchema = z.object({
  studentRequest: z.string().describe('The student request for tutoring support. This may include the academic level, e.g., K-12, College, PhD.'),
  learningContent: z.string().optional().describe('Built-in learning content that may be relevant to the request.'),
});
export type ProvideAiTutoringSupportInput = z.infer<typeof ProvideAiTutoringSupportInputSchema>;

const ProvideAiTutoringSupportOutputSchema = z.object({
  explanation: z.string().describe('The AI explanation and support provided to the student.'),
});
export type ProvideAiTutoringSupportOutput = z.infer<typeof ProvideAiTutoringSupportOutputSchema>;

export async function provideAiTutoringSupport(input: ProvideAiTutoringSupportInput): Promise<ProvideAiTutoringSupportOutput> {
  return provideAiTutoringSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiTutoringSupportPrompt',
  input: {schema: ProvideAiTutoringSupportInputSchema},
  output: {schema: ProvideAiTutoringSupportOutputSchema},
  prompt: `You are an expert AI tutor. A student needs help, and you must provide a clear, accurate, and helpful explanation.

  It is crucial that you tailor the depth, tone, and complexity of your explanation to the student's specified academic level.
  - For K-12, use simple language, analogies, and a very encouraging tone.
  - For College/University, provide a more detailed and structured explanation, assuming some foundational knowledge.
  - For PhD/Professional, offer a nuanced, in-depth analysis, referencing complex concepts and potential areas of further research.

  Student Request (including academic level): {{{studentRequest}}}

  {{#if learningContent}}
  Relevant Learning Content to consider: {{{learningContent}}}
  {{/if}}

  Provide your explanation now.`,
});

const provideAiTutoringSupportFlow = ai.defineFlow(
  {
    name: 'provideAiTutoringSupportFlow',
    inputSchema: ProvideAiTutoringSupportInputSchema,
    outputSchema: ProvideAiTutoringSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
