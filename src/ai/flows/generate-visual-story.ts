'use server';

/**
 * @fileOverview Generates a visual story to explain a topic.
 *
 * - generateVisualStory - A function that generates a story with text and image prompts.
 * - GenerateVisualStoryInput - The input type for the generateVisualStory function.
 * - GenerateVisualStoryOutput - The return type for the generateVisualStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StoryPageSchema = z.object({
  text: z.string().describe('The text for this page of the story. Should be simple and easy to understand for a young audience.'),
  imagePrompt: z.string().describe('A detailed prompt for a text-to-image model to generate an illustration for this page. The style should be like a childrens storybook illustration, vibrant and engaging.'),
  imageUrl: z.string().optional().describe('The URL of the generated image for this page.'),
});

const GenerateVisualStoryInputSchema = z.object({
  topic: z.string().describe('The topic to explain in a story.'),
});
export type GenerateVisualStoryInput = z.infer<typeof GenerateVisualStoryInputSchema>;

const GenerateVisualStoryOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(StoryPageSchema).describe('The pages of the story.'),
});
export type GenerateVisualStoryOutput = z.infer<typeof GenerateVisualStoryOutputSchema>;


export async function generateVisualStory(
  input: GenerateVisualStoryInput
): Promise<GenerateVisualStoryOutput> {
  return generateVisualStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualStoryPrompt',
  input: { schema: GenerateVisualStoryInputSchema },
  output: { schema: GenerateVisualStoryOutputSchema },
  prompt: `You are an expert storyteller and educator for children. Your task is to create a short, engaging, and simple visual story to explain a complex topic.

The story should be broken down into 5-7 pages. Each page needs:
1.  A short paragraph of text (2-3 sentences) that explains one part of the topic in a way a child can understand.
2.  A creative and detailed image prompt that an AI image generation model can use to create a beautiful, storybook-style illustration for that page.

The topic is: {{{topic}}}

Generate a title and the pages for the storybook.`,
});

const generateVisualStoryFlow = ai.defineFlow(
  {
    name: 'generateVisualStoryFlow',
    inputSchema: GenerateVisualStoryInputSchema,
    outputSchema: GenerateVisualStoryOutputSchema,
  },
  async (input) => {
    const { output: storyData } = await prompt(input);
    if (!storyData) {
        throw new Error('Failed to generate story data.');
    }

    const imageGenerationPromises = storyData.pages.map(async (page) => {
        try {
            const { media } = await ai.generate({
                model: 'googleai/imagen-4.0-fast-generate-001',
                prompt: page.imagePrompt,
            });
            return {
                ...page,
                imageUrl: media.url,
            };
        } catch (error) {
            console.error(`Failed to generate image for prompt: "${page.imagePrompt}"`, error);
            // Return page without image URL if generation fails
            return page;
        }
    });

    const pagesWithImages = await Promise.all(imageGenerationPromises);
    
    return {
        ...storyData,
        pages: pagesWithImages,
    };
  }
);
