'use client';

import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

export default function DashboardPage() {
  const { cards, addCard, updateCard, deleteCard, isLoaded } = useCreditCards();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cardName');

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
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'limit') {
          return b.limit - a.limit;
        }
        // Default to cardName
        return a.cardName.localeCompare(b.cardName);
      });
  }, [cards, searchTerm, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cards</h1>
          <p className="text-muted-foreground">
            An overview of your credit cards.
          </p>
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

      {isLoaded && cards.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Filter by name or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardName">Card Name</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="limit">Credit Limit (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
        </div>
      )}
      
      {isLoaded && filteredAndSortedCards.length === 0 && (
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
      
      {isLoaded && filteredAndSortedCards.length > 0 && (
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
    </div>
  );
}
