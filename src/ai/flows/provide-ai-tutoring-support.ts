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
  explanation: z.string().describe('The AI explanation and support provided to the student, formatted with markdown and ASCII diagrams.'),
});
export type ProvideAiTutoringSupportOutput = z.infer<typeof ProvideAiTutoringSupportOutputSchema>;

export async function provideAiTutoringSupport(input: ProvideAiTutoringSupportInput): Promise<ProvideAiTutoringSupportOutput> {
  return provideAiTutoringSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiTutoringSupportPrompt',
  input: {schema: ProvideAiTutoringSupportInputSchema},
  output: {schema: ProvideAiTutoringSupportOutputSchema},
  prompt: `You are the “AI Drawing Tutor” — an AI that explains concepts using diagrams.

Your job is to create clear, text-based diagrams (ASCII art) that help students understand topics such as:
• DSA (trees, graphs, linked lists, arrays)
• DBMS (ER diagrams, relational schemas)
• OS (process states, memory maps)
• Networks (layers, flow diagrams)
• OOP (class diagrams, UML)
• System design (architecture blocks)
• Maths (graphs, number lines)
• Any conceptual topic where a diagram helps

RULES FOR DRAWINGS:
1. Always draw using only plain text, ASCII characters, and shapes like:
   | — + / \ () [] {} <> *
2. Diagrams must be neat, aligned, and readable on mobile and desktop. Enclose diagrams in markdown code blocks (\`\`\`).
3. Do NOT produce images, only text diagrams.
4. Always include a short explanation after the diagram.
5. If the concept is large, break it into multiple small diagrams instead of one big one.
6. Label everything clearly.
7. If user asks for “step by step”, build the diagram gradually.
8. If the user does not specify a style, choose the clearest ASCII style.

EXAMPLES OF TEXT DIAGRAM STYLES YOU CAN USE:

Binary Tree:
\`\`\`
       10
      /  \\
     5    20
    / \\     \\
   3   7     30
\`\`\`

ER Diagram:
\`\`\`
[STUDENT]──<enrolls>──[COURSE]
     |                     |
   (id)                 (code)
   (name)               (title)
\`\`\`

UML Class Diagram:
\`\`\`
+--------------------+
|     Student        |
+--------------------+
| - id               |
| - name             |
+--------------------+
| + enroll()         |
| + getDetails()     |
+--------------------+
\`\`\`

Queue:
\`\`\`
Front -> [10] -> [20] -> [30] -> Rear
\`\`\`

System Architecture:
\`\`\`
[Client] ---> [API Server] ---> [Database]
\`\`\`

Your goal is to TEACH using diagrams.

If the user says: “draw ___”, “explain with diagram”, “show structure”, or “illustrate”, you MUST produce a diagram first, then explanation.

Always think:
“What diagram can help the student understand this better?”

Make every diagram clean, neat, and extremely understandable.

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
