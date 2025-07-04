'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

import { getSmartRecommendation } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSpendingHabits } from '@/hooks/use-spending-habits';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Get Recommendation
    </Button>
  );
}

export default function RecommendPage() {
  const [state, formAction] = useFormState(getSmartRecommendation, {});
  const { cards, isLoaded: cardsLoaded } = useCreditCards();
  const { habits, isLoaded: habitsLoaded } = useSpendingHabits();

  const isDataLoaded = cardsLoaded && habitsLoaded;
  const hasNoCards = cards.length === 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Recommend</h1>
        <p className="text-muted-foreground">
          Let AI help you choose the best card for your next purchase.
        </p>
      </div>
      
      {!isDataLoaded && (
        <Card>
          <CardHeader>
            <CardTitle>New Purchase</CardTitle>
            <CardDescription>Describe your purchase to get a recommendation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      )}

      {isDataLoaded && hasNoCards && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Add a Credit Card</AlertTitle>
          <AlertDescription>
            You need to add a credit card before you can get a recommendation.
            <Button variant="link" asChild className="p-1 h-auto">
              <Link href="/dashboard">Go to My Cards</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isDataLoaded && !hasNoCards && habits.length === 0 && (
        <Alert variant="default">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Set Your Spending Habits</AlertTitle>
          <AlertDescription>
            For more accurate recommendations, add your monthly spending habits.
            <Button variant="link" asChild className="p-1 h-auto">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isDataLoaded && (
        <Card>
          <CardHeader>
            <CardTitle>New Purchase</CardTitle>
            <CardDescription>Describe your purchase to get a recommendation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <Input
                name="purchaseDescription"
                placeholder="e.g., Dinner at a restaurant, new laptop, flight tickets"
                required
                disabled={hasNoCards}
              />
              <input type="hidden" name="cardDetails" value={JSON.stringify(cards)} />
              <input type="hidden" name="spendingHabits" value={JSON.stringify(habits)} />
              <SubmitButton disabled={hasNoCards} />
            </form>
          </CardContent>
        </Card>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.recommendedCard && (
        <Card className="bg-gradient-to-br from-accent/20 to-background">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-accent rounded-full">
              <Lightbulb className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Recommendation</p>
                <CardTitle>{state.recommendedCard}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{state.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
