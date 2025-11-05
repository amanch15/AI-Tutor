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
  studentRequest: z.string().describe('The student request for tutoring support.'),
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
  prompt: `You are an AI tutoring tool that provides explanations and support to students based on their requests.

You will use the student's request to provide a helpful and informative explanation. If relevant, incorporate the learning content provided to enhance your explanation.

Student Request: {{{studentRequest}}}

{{#if learningContent}}
Relevant Learning Content: {{{learningContent}}}
{{/if}}

Explanation: `,
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
