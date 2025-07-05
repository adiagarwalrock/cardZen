'use server';

import { smartCardRecommendation } from '@/ai/flows/smart-card-recommendation';

export interface RecommendationState {
  recommendedCard?: string;
  reasoning?: string;
  error?: string;
}

export async function getSmartRecommendation(
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
  const purchaseDescription = formData.get('purchaseDescription') as string;
  const cardDetails = formData.get('cardDetails') as string;
  const spendingHabits = formData.get('spendingHabits') as string;

  if (!purchaseDescription) {
    return { error: 'Please describe your purchase.' };
  }
  if (!cardDetails || cardDetails === '[]') {
    return { error: 'No credit cards found. Please add a card first.' };
  }
  if (!spendingHabits || spendingHabits === '[]') {
    return { error: 'No spending habits found. Please add your spending habits in settings.' };
  }

  try {
    const result = await smartCardRecommendation({
      purchaseDescription,
      cardDetails,
      spendingHabits,
    });

    if (result.recommendedCard === 'Error') {
      return { error: result.reasoning };
    }

    return {
      recommendedCard: result.recommendedCard,
      reasoning: result.reasoning,
    };
  } catch (e) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Initialize the database on application startup
 * This is a server action that can be called from a client component
 */
export async function initDbOnStartup() {
  try {
    // Use a relative URL instead of trying to construct an absolute URL
    // This avoids issues with URL parsing and environment variables
    const response = await fetch('/api/init-db');
    if (!response.ok) {
      console.error('Failed to initialize database:', await response.text());
    } else {
      console.log('Database initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
