'use server';
/**
 * @fileOverview Converts story text to an audio file using a text-to-speech model.
 *
 * - generateStoryAudio - A function that handles the text-to-speech conversion.
 * - GenerateStoryAudioInput - The input type for the generateStoryAudio function.
 * - GenerateStoryAudioOutput - The return type for the generateStoryAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const GenerateStoryAudioInputSchema = z.object({
  storyText: z.string().describe('The full text of the story to be converted to audio.'),
});
export type GenerateStoryAudioInput = z.infer<typeof GenerateStoryAudioInputSchema>;

const GenerateStoryAudioOutputSchema = z.object({
  audioDataUri: z.string().describe("A data URI of the generated audio file in WAV format. Format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateStoryAudioOutput = z.infer<typeof GenerateStoryAudioOutputSchema>;

export async function generateStoryAudio(input: GenerateStoryAudioInput): Promise<GenerateStoryAudioOutput> {
  return generateStoryAudioFlow(input);
}

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const generateStoryAudioFlow = ai.defineFlow(
  {
    name: 'generateStoryAudioFlow',
    inputSchema: GenerateStoryAudioInputSchema,
    outputSchema: GenerateStoryAudioOutputSchema,
  },
  async ({ storyText }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: storyText,
    });

    if (!media?.url) {
      throw new Error('Text-to-speech generation failed: no media returned.');
    }
    
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
