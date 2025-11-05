'use server';
/**
 * @fileOverview Adjusts quiz difficulty based on student performance.
 *
 * - adaptQuizDifficultyBasedOnPerformance - A function that adjusts quiz difficulty based on performance.
 * - AdaptQuizDifficultyBasedOnPerformanceInput - The input type for the adaptQuizDifficultyBasedOnPerformance function.
 * - AdaptQuizDifficultyBasedOnPerformanceOutput - The return type for the adaptQuizDifficultyBasedOnPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptQuizDifficultyBasedOnPerformanceInputSchema = z.object({
  studentId: z.string().describe('The ID of the student taking the quiz.'),
  quizId: z.string().describe('The ID of the quiz being taken.'),
  previousPerformance: z
    .number()
    .describe(
      'The students previous performance on the quiz. Represented as a percentage between 0 and 100.'
    ),
  currentDifficulty: z
    .string()
    .describe(
      'The current difficulty level of the quiz, e.g., easy, medium, hard.'
    ),
});
export type AdaptQuizDifficultyBasedOnPerformanceInput = z.infer<
  typeof AdaptQuizDifficultyBasedOnPerformanceInputSchema
>;

const AdaptQuizDifficultyBasedOnPerformanceOutputSchema = z.object({
  newDifficulty: z
    .string()
    .describe(
      'The new difficulty level of the quiz, adjusted based on the students performance. e.g., easy, medium, hard.'
    ),
  explanation: z
    .string()
    .describe(
      'Explanation of why the difficulty was adjusted, based on performance.'
    ),
});
export type AdaptQuizDifficultyBasedOnPerformanceOutput = z.infer<
  typeof AdaptQuizDifficultyBasedOnPerformanceOutputSchema
>;

export async function adaptQuizDifficultyBasedOnPerformance(
  input: AdaptQuizDifficultyBasedOnPerformanceInput
): Promise<AdaptQuizDifficultyBasedOnPerformanceOutput> {
  return adaptQuizDifficultyBasedOnPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptQuizDifficultyBasedOnPerformancePrompt',
  input: {
    schema: AdaptQuizDifficultyBasedOnPerformanceInputSchema,
  },
  output: {
    schema: AdaptQuizDifficultyBasedOnPerformanceOutputSchema,
  },
  prompt: `You are an AI quiz master who can adaptively adjust the difficulty of a quiz based on student performance.

Student ID: {{{studentId}}}
Quiz ID: {{{quizId}}}
Previous Performance: {{{previousPerformance}}}%
Current Difficulty: {{{currentDifficulty}}}

Based on the student's previous performance, determine whether to increase, decrease, or maintain the quiz difficulty.
Explain your reasoning for the adjustment.

Consider these factors when determining new difficulty:
- If the student scored above 85%, increase the difficulty.
- If the student scored below 50%, decrease the difficulty.
- Otherwise, maintain the current difficulty.

Output the new difficulty level and a brief explanation.

Difficulty: {{newDifficulty}}
Explanation: {{explanation}}`,
});

const adaptQuizDifficultyBasedOnPerformanceFlow = ai.defineFlow(
  {
    name: 'adaptQuizDifficultyBasedOnPerformanceFlow',
    inputSchema: AdaptQuizDifficultyBasedOnPerformanceInputSchema,
    outputSchema: AdaptQuizDifficultyBasedOnPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
