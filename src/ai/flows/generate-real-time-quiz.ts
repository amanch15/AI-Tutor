'use server';
/**
 * @fileOverview Generates a real-time quiz based on a user-provided topic.
 *
 * - generateRealTimeQuiz - A function that creates a quiz with a specified number of questions.
 * - GenerateRealTimeQuizInput - The input type for the generateRealTimeQuiz function.
 * - GenerateRealTimeQuizOutput - The return type for the generateRealTimeQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('A list of multiple-choice options.'),
  answer: z.string().describe('The correct answer from the options.'),
});

export const GenerateRealTimeQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateRealTimeQuizInput = z.infer<
  typeof GenerateRealTimeQuizInputSchema
>;

export const GenerateRealTimeQuizOutputSchema = z.object({
  title: z.string().describe('The title of the quiz.'),
  questions: z.array(QuestionSchema),
});
export type GenerateRealTimeQuizOutput = z.infer<
  typeof GenerateRealTimeQuizOutputSchema
>;

export async function generateRealTimeQuiz(
  input: GenerateRealTimeQuizInput
): Promise<GenerateRealTimeQuizOutput> {
  return generateRealTimeQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRealTimeQuizPrompt',
  input: {schema: GenerateRealTimeQuizInputSchema},
  output: {schema: GenerateRealTimeQuizOutputSchema},
  prompt: `You are an AI assistant that generates quizzes for students.

Generate a quiz with exactly {{{numberOfQuestions}}} questions on the given topic.
The quiz should have a clear title.
For each question, provide 4 multiple-choice options and specify the correct answer.

Topic: {{{topic}}}
`,
});

const generateRealTimeQuizFlow = ai.defineFlow(
  {
    name: 'generateRealTimeQuizFlow',
    inputSchema: GenerateRealTimeQuizInputSchema,
    outputSchema: GenerateRealTimeQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
