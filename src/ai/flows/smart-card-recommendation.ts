'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending the best credit card to use for a specific purchase.
 *
 * - smartCardRecommendation - A function that handles the smart card recommendation process.
 * - SmartCardRecommendationInput - The input type for the smartCardRecommendation function.
 * - SmartCardRecommendationOutput - The return type for the smartCardRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCardRecommendationInputSchema = z.object({
  cardDetails: z
    .string()
    .describe(
      'A JSON string containing details of available credit cards, including provider, network, card name, benefits (name, percentage/points), due date, statement date, limits.'
    ),
  purchaseDescription: z.string().describe('A description of the intended purchase.'),
  spendingHabits: z
    .string()
    .describe(
      'A JSON string containing the users spending habits, including categories, amounts, and frequency.'
    ),
});
export type SmartCardRecommendationInput = z.infer<typeof SmartCardRecommendationInputSchema>;

const SmartCardRecommendationOutputSchema = z.object({
  recommendedCard: z.string().describe('The name of the recommended credit card.'),
  reasoning: z.string().describe('The reasoning behind the recommendation.'),
});
export type SmartCardRecommendationOutput = z.infer<typeof SmartCardRecommendationOutputSchema>;

export async function smartCardRecommendation(input: SmartCardRecommendationInput): Promise<SmartCardRecommendationOutput> {
  return smartCardRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartCardRecommendationPrompt',
  input: {schema: SmartCardRecommendationInputSchema},
  output: {schema: SmartCardRecommendationOutputSchema},
  prompt: `You are an expert financial advisor specializing in credit card rewards optimization.

  Given the following credit card details, purchase description, and spending habits, recommend the best credit card to use for the purchase to maximize rewards and benefits.

  Credit Card Details:
  {{cardDetails}}

  Purchase Description:
  {{purchaseDescription}}

  Spending Habits:
  {{spendingHabits}}

  Consider factors such as cashback percentages, points multipliers, category bonuses, and spending limits.

  Ensure that the output is well-reasoned and easy to understand.
  Make sure that the card details and the spending habits are valid JSON objects.
  If the card details or the spending habits are invalid, return an error message.
  If you cannot recommend a card return that there are no cards that are benefical given the current situation.
  `,
});

const smartCardRecommendationFlow = ai.defineFlow(
  {
    name: 'smartCardRecommendationFlow',
    inputSchema: SmartCardRecommendationInputSchema,
    outputSchema: SmartCardRecommendationOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.cardDetails);
      JSON.parse(input.spendingHabits);
    } catch (e) {
      return {recommendedCard: 'Error', reasoning: 'Invalid JSON format for card details or spending habits.'};
    }
    const {output} = await prompt(input);
    return output!;
  }
);
