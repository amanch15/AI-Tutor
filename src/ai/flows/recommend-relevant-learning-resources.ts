'use server';

/**
 * @fileOverview Recommends relevant learning resources such as videos, articles, and books based on the study area.
 *
 * - recommendRelevantLearningResources - A function that recommends learning resources.
 * - RecommendRelevantLearningResourcesInput - The input type for the recommendRelevantLearningResources function.
 * - RecommendRelevantLearningResourcesOutput - The return type for the recommendRelevantLearningResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRelevantLearningResourcesInputSchema = z.object({
  studyArea: z.string().describe('The area of study for which to recommend resources.'),
  learningHistory: z.string().optional().describe('A summary of the user learning history'),
});
export type RecommendRelevantLearningResourcesInput = z.infer<
  typeof RecommendRelevantLearningResourcesInputSchema
>;

const RecommendRelevantLearningResourcesOutputSchema = z.object({
  resources: z
    .array(z.string())
    .describe(
      'A list of relevant learning resources, including videos, articles, and books.'
    ),
});
export type RecommendRelevantLearningResourcesOutput = z.infer<
  typeof RecommendRelevantLearningResourcesOutputSchema
>;

export async function recommendRelevantLearningResources(
  input: RecommendRelevantLearningResourcesInput
): Promise<RecommendRelevantLearningResourcesOutput> {
  return recommendRelevantLearningResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRelevantLearningResourcesPrompt',
  input: {schema: RecommendRelevantLearningResourcesInputSchema},
  output: {schema: RecommendRelevantLearningResourcesOutputSchema},
  prompt: `You are an AI assistant designed to recommend learning resources to students.

  Based on the student's study area, suggest a list of relevant learning resources, including videos, articles, and books.

  Consider the student's learning history when making recommendations to avoid recommending already-covered material.

  Study Area: {{{studyArea}}}
  Learning History: {{{learningHistory}}}

  Please provide the resources in a list.
  `,
});

const recommendRelevantLearningResourcesFlow = ai.defineFlow(
  {
    name: 'recommendRelevantLearningResourcesFlow',
    inputSchema: RecommendRelevantLearningResourcesInputSchema,
    outputSchema: RecommendRelevantLearningResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
