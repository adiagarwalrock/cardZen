'use client';

import { useMemo, useState, useEffect } from 'react';
import { Grid, List, PlusCircle, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { differenceInDays, isAfter, startOfDay, format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useCreditCards } from '@/hooks/use-credit-cards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CardForm } from '@/components/card-form';
import { CreditCardItem } from '@/components/credit-card-item';
import type { CreditCard } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCardListItem } from '@/components/credit-card-list-item';
import { useAlertSettings } from '@/hooks/use-alert-settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserProfile } from '@/hooks/use-user-profile';

interface UpcomingPayment extends CreditCard {
  daysRemaining: number;
  actualDueDate: Date;
}

export default function DashboardPage() {
  const { cards, addCard, updateCard, deleteCard, isLoaded } = useCreditCards();
  const { alertDays, isLoaded: alertSettingsLoaded } = useAlertSettings();
  const { userName, isLoaded: userLoaded } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cardName');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [greeting, setGreeting] = useState('');

  const isFullyLoaded = isLoaded && alertSettingsLoaded && userLoaded;

  useEffect(() => {
    if (!cards || !alertSettingsLoaded) return;

    const getNextDateForDay = (day: number): Date => {
      const today = startOfDay(new Date());
      const year = today.getFullYear();
      const month = today.getMonth();

      let potentialDueDate = new Date(year, month, day);
      if (potentialDueDate.getMonth() !== month) {
        potentialDueDate = new Date(year, month + 1, 0);
      }
      
      if (isAfter(today, potentialDueDate)) {
        const nextMonth = new Date(year, month + 1, 1);
        let nextMonthDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
        if (nextMonthDueDate.getMonth() !== nextMonth.getMonth()) {
            nextMonthDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
        }
        return nextMonthDueDate;
      } else {
        return potentialDueDate;
      }
    }

    const today = startOfDay(new Date());

    const payments = cards
      .filter(card => card.enableAlerts && card.dueDate)
      .map(card => {
        const nextDueDate = getNextDateForDay(card.dueDate);
        const daysRemaining = differenceInDays(nextDueDate, today);
        
        if (daysRemaining >= 0 && daysRemaining <= alertDays) {
          return {
            ...card,
            daysRemaining: daysRemaining,
            actualDueDate: nextDueDate,
          };
        }
        return null;
      })
      .filter((p): p is UpcomingPayment => p !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
      
    setUpcomingPayments(payments);
  }, [cards, alertDays, alertSettingsLoaded]);
  
  useEffect(() => {
    if (userLoaded) {
      const hour = new Date().getHours();
      let timeOfDay = 'Hello';
      let emoji = '👋';

      if (hour < 12) {
        timeOfDay = 'Good morning';
        emoji = '☀️';
      } else if (hour < 18) {
        timeOfDay = 'Good afternoon';
        emoji = '👋';
      } else {
        timeOfDay = 'Good evening';
        emoji = '🌙';
      }
      
      const namePart = userName ? `, ${userName}` : '';
      setGreeting(`${timeOfDay}${namePart}! ${emoji}`);
    }
  }, [userName, userLoaded]);


  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCard(undefined);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Omit<CreditCard, 'id'>) => {
    if (editingCard) {
      updateCard({ ...editingCard, ...data });
    } else {
      addCard(data);
    }
    setIsFormOpen(false);
  };
  
  const handleDelete = (cardId: string) => {
    deleteCard(cardId);
  }

  const filteredAndSortedCards = useMemo(() => {
    return cards
      .filter(card =>
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.provider.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return a.dueDate - b.dueDate;
        }
        if (sortBy === 'limit') {
          return b.limit - a.limit;
        }
        if (sortBy === 'annualFee') {
          return b.annualFee - a.annualFee;
        }
        // Default to cardName
        return a.cardName.localeCompare(b.cardName);
      });
  }, [cards, searchTerm, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          {isFullyLoaded ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
                <p className="text-muted-foreground">
                  Here's an overview of your credit cards.
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
          )}
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Edit Card' : 'Add a New Card'}</DialogTitle>
              <DialogDescription>
                Fill in the details of your credit card. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <CardForm
              card={editingCard}
              onSave={handleSave}
              onDone={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

       {isFullyLoaded && upcomingPayments.length > 0 && (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Upcoming Payments</h2>
            <div className="grid gap-4 md:grid-cols-2">
            {upcomingPayments.map(card => {
                const daysRemaining = card.daysRemaining;
                return (
                    <Alert key={card.id} variant="destructive">
                        <Bell className="h-4 w-4" />
                        <AlertTitle>Due Soon: {card.cardName}</AlertTitle>
                        <AlertDescription>
                            Payment is due in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} on {format(card.actualDueDate, 'PPP')}.
                        </AlertDescription>
                    </Alert>
                )
            })}
            </div>
        </div>
      )}

      {isFullyLoaded && cards.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Filter by name or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardName">Card Name</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="limit">Credit Limit (High-Low)</SelectItem>
                <SelectItem value="annualFee">Annual Fee (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 self-end">
             <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
             </Button>
             <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
             </Button>
          </div>
        </div>
      )}

      {!isFullyLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
        </div>
      )}
      
      {isFullyLoaded && filteredAndSortedCards.length === 0 && (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center mt-8">
            <h3 className="text-2xl font-bold tracking-tight">
              {searchTerm ? 'No matching cards' : 'No cards yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search or filter.' : 'Add your first credit card to get started.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            )}
        </div>
      )}
      
      {isFullyLoaded && filteredAndSortedCards.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {filteredAndSortedCards.map((card) => (
                    <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CreditCardItem
                            card={card}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      )}
      {isFullyLoaded && filteredAndSortedCards.length > 0 && viewMode === 'list' && (
         <div className="space-y-4">
            <AnimatePresence>
                {filteredAndSortedCards.map((card) => (
                     <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CreditCardListItem
                            card={card}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
         </div>
      )}
    </div>
  );
}
