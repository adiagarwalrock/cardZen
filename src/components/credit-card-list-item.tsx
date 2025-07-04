'use client';

import {
  AlarmClock,
  CircleDollarSign,
  Pencil,
  ShieldCheck,
  Trash2,
  CreditCard as CreditCardIcon,
  CalendarDays,
} from 'lucide-react';
import Image from 'next/image';

import { CreditCard } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSafeSpend } from '@/hooks/use-safe-spend';
import { getOrdinal } from '@/lib/utils';

interface CreditCardListItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: string) => void;
}

export function CreditCardListItem({ card, onEdit, onDelete }: CreditCardListItemProps) {
  const { safeSpendPercentage } = useSafeSpend();

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `${amount.toLocaleString()} ${currency}`;
    }
  };

  const formattedLimit = formatCurrency(card.limit, card.currency);
  const safeSpendTarget = formatCurrency(
    (card.limit * safeSpendPercentage) / 100,
    card.currency
  );

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_auto] items-center gap-4 p-4">
        {/* Image and Name */}
        <div className="flex flex-row md:flex-col items-center md:items-start gap-4">
          <div className="relative aspect-[1.586] w-24 md:w-full bg-muted rounded flex-shrink-0">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={`${card.cardName} card image`}
                fill
                className="object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded bg-gradient-to-br from-card to-secondary">
                <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate md:whitespace-normal">{card.cardName}</p>
            <p className="text-sm text-muted-foreground">{card.provider}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm w-full">
            <div className="flex items-center text-muted-foreground">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              <span>Limit: {formattedLimit}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
              <span>Safe Spend: {safeSpendTarget}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Statement on {getOrdinal(card.statementDate)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <AlarmClock className="mr-2 h-4 w-4" />
              <span>Due on {getOrdinal(card.dueDate)}</span>
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-self-end md:justify-self-start gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Card</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    card "{card.cardName}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(card.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="icon" onClick={() => onEdit(card)} className="text-muted-foreground hover:text-primary">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Card</span>
            </Button>
        </div>
      </div>
    </Card>
  );
}
