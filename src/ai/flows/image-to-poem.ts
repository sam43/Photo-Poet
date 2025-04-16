// use server'

'use server';
/**
 * @fileOverview An AI agent that generates a poem based on an image.
 *
 * - imageToPoem - A function that handles the image to poem generation process.
 * - ImageToPoemInput - The input type for the imageToPoem function.
 * - ImageToPoemOutput - The return type for the imageToPoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImageToPoemInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the image.'),
});
export type ImageToPoemInput = z.infer<typeof ImageToPoemInputSchema>;

const ImageToPoemOutputSchema = z.object({
  poem: z.string().describe('The poem generated from the image.'),
});
export type ImageToPoemOutput = z.infer<typeof ImageToPoemOutputSchema>;

export async function imageToPoem(input: ImageToPoemInput): Promise<ImageToPoemOutput> {
  return imageToPoemFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the image.'),
    }),
  },
  output: {
    schema: z.object({
      description: z.string().describe('A textual description of the image, including key objects, scenes, and emotions.'),
    }),
  },
  prompt: `You are an AI vision model that can describe an image.

  Describe the image at the following URL, including key objects, scenes, and emotions:

  {{media url=photoUrl}}
  `,
});

const generatePoemPrompt = ai.definePrompt({
  name: 'generatePoemPrompt',
  input: {
    schema: z.object({
      imageDescription: z.string().describe('A textual description of the image, including key objects, scenes, and emotions.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('A poem inspired by the image description.'),
    }),
  },
  prompt: `You are a poet laureate.  Write a poem inspired by the following image description:\n\n  {{{imageDescription}}}`,
});

const imageToPoemFlow = ai.defineFlow<
  typeof ImageToPoemInputSchema,
  typeof ImageToPoemOutputSchema
>({
  name: 'imageToPoemFlow',
  inputSchema: ImageToPoemInputSchema,
  outputSchema: ImageToPoemOutputSchema,
}, async input => {
  const {output: analyzeImageOutput} = await analyzeImagePrompt(input);
  const {output: generatePoemOutput} = await generatePoemPrompt({
    imageDescription: analyzeImageOutput!.description,
  });

  return {
    poem: generatePoemOutput!.poem,
  };
});
