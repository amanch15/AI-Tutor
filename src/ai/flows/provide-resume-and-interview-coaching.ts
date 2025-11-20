'use server';
/**
 * @fileOverview An AI Resume & Interview Coach.
 *
 * - provideResumeAndInterviewCoaching - A function that provides coaching for resumes and interviews.
 * - ProvideResumeAndInterviewCoachingInput - The input type for the function.
 * - ProvideResumeAndInterviewCoachingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

const ProvideResumeAndInterviewCoachingInputSchema = z.object({
  userRequest: z.string().describe('The user request for coaching.'),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The history of the conversation so far.'),
});
export type ProvideResumeAndInterviewCoachingInput = z.infer<typeof ProvideResumeAndInterviewCoachingInputSchema>;

const ProvideResumeAndInterviewCoachingOutputSchema = z.object({
  response: z.string().describe('The AI coach\'s response, formatted with markdown.'),
});
export type ProvideResumeAndInterviewCoachingOutput = z.infer<typeof ProvideResumeAndInterviewCoachingOutputSchema>;

export async function provideResumeAndInterviewCoaching(input: ProvideResumeAndInterviewCoachingInput): Promise<ProvideResumeAndInterviewCoachingOutput> {
  return provideResumeAndInterviewCoachingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideResumeAndInterviewCoachingPrompt',
  input: {schema: ProvideResumeAndInterviewCoachingInputSchema},
  output: {schema: ProvideResumeAndInterviewCoachingOutputSchema},
  prompt: `You are an expert Resume & Interview Coach. 
Your job is to help users create ATS-friendly resumes, prepare for interviews, and improve their answers.

When the user asks anything, provide:
1. Clear, personalized guidance
2. Examples and templates
3. Bullet points for quick reading
4. Professional tone

You can perform:
- Resume rewriting in ATS-friendly format
- Resume summary generation
- Skills extraction based on user background
- STAR method interview answers (Situation, Task, Action, Result)
- HR mock interview questions
- Technical interview questions (DSA, OOPS, DBMS, OS, CN, Java)
- Feedback and improvement suggestions

Always keep responses:
- Simple
- Well-structured
- Actionable
- Fit for students and job seekers

Review the conversation history to understand the full context of the user's request.

  {{#if chatHistory}}
  Conversation History:
  {{#each chatHistory}}
  - {{role}}: {{content}}
  {{/each}}
  {{/if}}

  User Request: {{{userRequest}}}
  `,
});

const provideResumeAndInterviewCoachingFlow = ai.defineFlow(
  {
    name: 'provideResumeAndInterviewCoachingFlow',
    inputSchema: ProvideResumeAndInterviewCoachingInputSchema,
    outputSchema: ProvideResumeAndInterviewCoachingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
