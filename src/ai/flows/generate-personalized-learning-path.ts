'use server';

/**
 * @fileOverview Generates a personalized learning path based on the user's current knowledge and learning goals.
 *
 * - generatePersonalizedLearningPath - A function that generates a personalized learning path.
 * - GeneratePersonalizedLearningPathInput - The input type for the generatePersonalizedLearningPath function.
 * - GeneratePersonalizedLearningPathOutput - The return type for the generatePersonalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedLearningPathInputSchema = z.object({
  currentKnowledge: z
    .string()
    .describe('The current knowledge of the student in the subject.'),
  learningGoals: z.string().describe('The learning goals of the student.'),
});

export type GeneratePersonalizedLearningPathInput = z.infer<
  typeof GeneratePersonalizedLearningPathInputSchema
>;

const LearningStepSchema = z.object({
    title: z.string().describe('The title of the learning step.'),
    description: z.string().describe('A brief description of what this step covers.'),
    resources: z.array(z.string()).describe('A list of recommended resources (videos, articles, books) for this step.'),
});

const GeneratePersonalizedLearningPathOutputSchema = z.object({
  learningPath: z.array(LearningStepSchema).describe('A personalized learning path with multiple steps.'),
});

export type GeneratePersonalizedLearningPathOutput = z.infer<
  typeof GeneratePersonalizedLearningPathOutputSchema
>;

export async function generatePersonalizedLearningPath(
  input: GeneratePersonalizedLearningPathInput
): Promise<GeneratePersonalizedLearningPathOutput> {
  return generatePersonalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedLearningPathPrompt',
  input: {schema: GeneratePersonalizedLearningPathInputSchema},
  output: {schema: GeneratePersonalizedLearningPathOutputSchema},
  prompt: `You are an expert tutor specialized in creating personalized learning paths for students.

  Based on the student's current knowledge and learning goals, generate a detailed and structured learning path.
  The path should consist of several logical steps. For each step, provide a clear title, a concise description, and a list of 2-3 specific, high-quality learning resources (e.g., 'Video: Khan Academy - Intro to Derivatives', 'Article: Wikipedia - Fundamental Theorem of Calculus', 'Book: "Calculus" by James Stewart, Chapter 3').

  Current Knowledge: {{{currentKnowledge}}}
  Learning Goals: {{{learningGoals}}}

  Generate the learning path now.`,
});

const generatePersonalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedLearningPathFlow',
    inputSchema: GeneratePersonalizedLearningPathInputSchema,
    outputSchema: GeneratePersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
