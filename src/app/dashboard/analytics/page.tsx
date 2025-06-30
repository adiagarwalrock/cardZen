'use client';

import { useMemo } from 'react';
import { CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { useCreditCards } from '@/hooks/use-credit-cards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useSafeSpend } from '@/hooks/use-safe-spend';

export default function AnalyticsPage() {
  const { cards, isLoaded: cardsLoaded } = useCreditCards();
  const { safeSpendPercentage, isLoaded: spendLimitLoaded } = useSafeSpend();

  const isLoaded = cardsLoaded && spendLimitLoaded;

  const { totalCards, limitsByCurrency } = useMemo(() => {
    if (!isLoaded || cards.length === 0) {
      return { totalCards: 0, limitsByCurrency: {} };
    }

    const limits = cards.reduce(
      (acc, card) => {
        if (!acc[card.currency]) {
          acc[card.currency] = 0;
        }
        acc[card.currency] += card.limit;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCards: cards.length,
      limitsByCurrency: limits,
    };
  }, [cards, isLoaded]);

  const { formattedLimits, safeSpendTargets } = useMemo(() => {
     const format = (amount: number, currency: string) => {
        try {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
          }).format(amount);
        } catch {
          return `${amount.toLocaleString()} ${currency}`;
        }
      }

      const formatted = Object.entries(limitsByCurrency).map(
        ([currency, total]) => format(total, currency)
      );

      const targets = Object.entries(limitsByCurrency).map(
        ([currency, total]) => format((total * safeSpendPercentage) / 100, currency)
      )

      return { formattedLimits: formatted, safeSpendTargets: targets };

  }, [limitsByCurrency, safeSpendPercentage])


  const cardsByProvider = useMemo(() => {
    if (!isLoaded || cards.length === 0) return [];
    const counts = cards.reduce(
      (acc, card) => {
        acc[card.provider] = (acc[card.provider] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cards, isLoaded]);

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Your financial overview.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Your financial overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credit Limit
            </CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {formattedLimits.length > 0 ? (
              formattedLimits.map((limit, index) => (
                <div key={index} className="text-2xl font-bold">
                  {limit}
                </div>
              ))
            ) : (
              <div className="text-2xl font-bold">$0</div>
            )}
            <p className="text-xs text-muted-foreground">Across all your cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credit Cards
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Currently managed in CardZen
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Safe Spend Target
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {safeSpendTargets.length > 0 ? (
                safeSpendTargets.map((target, index) => (
                  <div key={index} className="text-2xl font-bold">
                    {target}
                  </div>
                ))
              ) : (
                <div className="text-2xl font-bold">$0</div>
              )}
            <p className="text-xs text-muted-foreground">Based on your {safeSpendPercentage}% utilization goal</p>
          </CardContent>
        </Card>
      </div>

      {cards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cards by Provider</CardTitle>
            <CardDescription>
              Distribution of your credit cards across different providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-sm">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={cardsByProvider}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {cardsByProvider.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
