'use server';

/**
 * @fileOverview Creates a unique AI character with a defined personality and backstory.
 *
 * - createAiCharacter - A function that generates an AI character profile.
 * - CreateAiCharacterInput - The input type for the createAiCharacter function.
 * - CreateAiCharacterOutput - The return type for the createAiCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAiCharacterInputSchema = z.object({
  name: z.string().describe('The name of the AI character.'),
  role: z.string().describe('The role or profession of the AI character (e.g., historian, scientist).'),
  backstory: z.string().describe('The detailed backstory and personality traits of the character.'),
});
export type CreateAiCharacterInput = z.infer<typeof CreateAiCharacterInputSchema>;

const CreateAiCharacterOutputSchema = z.object({
  name: z.string().describe("The character's name."),
  role: z.string().describe("The character's role."),
  personality: z.string().describe('A summary of the AI character\'s personality, written in the first person from the character\'s perspective.'),
  photoUrl: z.string().describe('A URL for a photorealistic portrait of the character.'),
});
export type CreateAiCharacterOutput = z.infer<typeof CreateAiCharacterOutputSchema>;

export async function createAiCharacter(
  input: CreateAiCharacterInput
): Promise<CreateAiCharacterOutput> {
  return createAiCharacterFlow(input);
}

const characterSystemPrompt = `You are an AI character creation assistant. Your task is to take a user's input for a character's name, role, and backstory, and transform it into a cohesive and engaging character profile.

Based on the user's input, you will:
1.  Generate a brief, first-person summary of the character's personality and backstory. This should capture the essence of the character and be written from their point of view.
2.  Generate a prompt for an image generation model to create a photorealistic portrait of the character. The prompt should be descriptive and reflect the character's role, personality, and any physical attributes mentioned in the backstory.

User Input:
Name: {{{name}}}
Role: {{{role}}}
Backstory: {{{backstory}}}
`;

const characterPrompt = ai.definePrompt({
  name: 'createAiCharacterPrompt',
  input: {schema: CreateAiCharacterInputSchema},
  output: {schema: CreateAiCharacterOutputSchema},
  prompt: characterSystemPrompt,
  model: 'googleai/gemini-2.5-flash',
});


const createAiCharacterFlow = ai.defineFlow(
  {
    name: 'createAiCharacterFlow',
    inputSchema: CreateAiCharacterInputSchema,
    outputSchema: CreateAiCharacterOutputSchema,
  },
  async (input) => {
    const { output: characterData } = await characterPrompt(input);
    if (!characterData) {
      throw new Error('Failed to generate character data.');
    }

    // Since Gemini can't generate images and text in the same call in this version, we make a second call for the image.
    // A more advanced implementation might use a tool.
    const { text: imagePrompt } = await ai.generate({
        prompt: `Based on the following character, create a concise image generation prompt for a photorealistic portrait: Name: ${characterData.name}, Role: ${characterData.role}, Personality: ${characterData.personality}`,
    });

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: imagePrompt,
    });
    
    return {
        ...characterData,
        photoUrl: media.url,
    };
  }
);
