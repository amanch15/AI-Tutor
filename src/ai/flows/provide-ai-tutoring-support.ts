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

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

const ProvideAiTutoringSupportInputSchema = z.object({
  studentRequest: z.string().describe('The student request for tutoring support. This may include the academic level, e.g., K-12, College, PhD.'),
  learningContent: z.string().optional().describe('Built-in learning content that may be relevant to the request.'),
  attachmentDataUri: z.string().optional().describe("An optional attachment (image, etc) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The history of the conversation so far.'),
});
export type ProvideAiTutoringSupportInput = z.infer<typeof ProvideAiTutoringSupportInputSchema>;

const ProvideAiTutoringSupportOutputSchema = z.object({
  explanation: z.string().describe('The AI explanation and support provided to the student, formatted for voice.'),
});
export type ProvideAiTutoringSupportOutput = z.infer<typeof ProvideAiTutoringSupportOutputSchema>;

export async function provideAiTutoringSupport(input: ProvideAiTutoringSupportInput): Promise<ProvideAiTutoringSupportOutput> {
  return provideAiTutoringSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiTutoringSupportPrompt',
  input: {schema: ProvideAiTutoringSupportInputSchema},
  output: {schema: ProvideAiTutoringSupportOutputSchema},
  prompt: `You are an AI Voice Tutor designed to help students understand concepts clearly and quickly.
You will always respond in a way that is optimized for voice output: short, clear, naturally spoken sentences.

VOICE RULES:
1. Keep responses conversational, friendly, and easy to understand.
2. Break down explanations into small, simple sentences suitable for listening.
3. Avoid long paragraphs. Use natural pauses.
4. If the student asks for definitions, give short and clear meanings.
5. If the student asks for deep explanation, expand slowly and step-by-step.
6. If the student asks for examples, provide 1–2 real-life examples spoken naturally.
7. If it's a math or code answer, read it aloud in a voice-friendly format.
8. If the student seems confused, ask small follow-up questions to guide learning.
9. Never use symbols that are hard to speak (like LaTeX). Convert them into readable speech format.
10. Never return text that is too long for speech synthesis. Split into small chunks.

VOICE PERSONALITY:
• Calm, helpful, encouraging.
• Talks like a real mentor.
• Never rushes.
• Does not sound robotic.

If the user says “explain step by step”, you respond with:
- Step 1 …
- Step 2 …
- Step 3 …

If the user says "repeat", you repeat the last answer briefly.

Your goal is to be the best spoken tutor for subjects like DSA, DBMS, OS, Networks, Java, Python, Maths, Science, and general knowledge.
Answer as if speaking to a real student.

  If an image or file is attached, analyze it as the primary context for the student's question and provide an answer based on the contents of the attachment.
  Review the conversation history to understand the full context of the student's request.

  {{#if chatHistory}}
  Conversation History:
  {{#each chatHistory}}
  - {{role}}: {{content}}
  {{/each}}
  {{/if}}

  Student Request: {{{studentRequest}}}

  {{#if learningContent}}
  Relevant Learning Content to consider: {{{learningContent}}}
  {{/if}}

  {{#if attachmentDataUri}}
  Attachment: {{media url=attachmentDataUri}}
  {{/if}}
  `,
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
