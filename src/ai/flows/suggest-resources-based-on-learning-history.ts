'use server';
/**
 * @fileOverview Suggests learning resources based on the user's learning history.
 *
 * - suggestResourcesBasedOnLearningHistory - A function that suggests resources based on the user's learning history.
 * - SuggestResourcesBasedOnLearningHistoryInput - The input type for the suggestResourcesBasedOnLearningHistory function.
 * - SuggestResourcesBasedOnLearningHistoryOutput - The return type for the suggestResourcesBasedOnLearningHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResourcesBasedOnLearningHistoryInputSchema = z.object({
  learningHistory: z
    .string()
    .describe('The user learning history as a string.'),
  topic: z.string().describe('The topic for which to suggest resources.'),
});
export type SuggestResourcesBasedOnLearningHistoryInput = z.infer<
  typeof SuggestResourcesBasedOnLearningHistoryInputSchema
>;

const SuggestResourcesBasedOnLearningHistoryOutputSchema = z.object({
  suggestedResources: z
    .string()
    .describe('A list of suggested resources based on the learning history.'),
});
export type SuggestResourcesBasedOnLearningHistoryOutput = z.infer<
  typeof SuggestResourcesBasedOnLearningHistoryOutputSchema
>;

export async function suggestResourcesBasedOnLearningHistory(
  input: SuggestResourcesBasedOnLearningHistoryInput
): Promise<SuggestResourcesBasedOnLearningHistoryOutput> {
  return suggestResourcesBasedOnLearningHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourcesBasedOnLearningHistoryPrompt',
  input: {schema: SuggestResourcesBasedOnLearningHistoryInputSchema},
  output: {schema: SuggestResourcesBasedOnLearningHistoryOutputSchema},
  prompt: `Based on the following learning history:\n\n{{{learningHistory}}}\n\nSuggest some learning resources for the topic: {{{topic}}}.`,
});

const suggestResourcesBasedOnLearningHistoryFlow = ai.defineFlow(
  {
    name: 'suggestResourcesBasedOnLearningHistoryFlow',
    inputSchema: SuggestResourcesBasedOnLearningHistoryInputSchema,
    outputSchema: SuggestResourcesBasedOnLearningHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
