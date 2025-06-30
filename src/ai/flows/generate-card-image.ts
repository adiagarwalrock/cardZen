'use server';
/**
 * @fileOverview A Genkit flow for generating credit card images.
 *
 * - generateCardImage - A function that generates a credit card image.
 * - GenerateCardImageInput - The input type for the generateCardImage function.
 * - GenerateCardImageOutput - The return type for the generateCardImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCardImageInputSchema = z.object({
  provider: z.string().describe('The bank or provider of the credit card.'),
  cardName: z.string().describe('The name of the credit card.'),
  network: z.string().describe('The card network (e.g., Visa, Mastercard).'),
});
export type GenerateCardImageInput = z.infer<typeof GenerateCardImageInputSchema>;

const GenerateCardImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated credit card image."),
});
export type GenerateCardImageOutput = z.infer<typeof GenerateCardImageOutputSchema>;


export async function generateCardImage(input: GenerateCardImageInput): Promise<GenerateCardImageOutput> {
  return generateCardImageFlow(input);
}

const generateCardImageFlow = ai.defineFlow(
  {
    name: 'generateCardImageFlow',
    inputSchema: GenerateCardImageInputSchema,
    outputSchema: GenerateCardImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a photorealistic image of a credit card.
      The card should be for '${input.provider}' and the card name is '${input.cardName}'.
      The network is '${input.network}'.
      The style should be modern, sleek, and professional.
      The card should be visually appealing.
      Do not include any readable card numbers, member names, or expiration dates. Use placeholder text or symbols for those elements.
      The image should be a close-up of the card on a neutral background.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return { imageUrl: media.url };
  }
);
