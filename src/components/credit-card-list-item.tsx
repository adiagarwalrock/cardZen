'use client';

import {
  CreditCard as CreditCardIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { CreditCard } from '@/lib/types';
import {
  Card,
} from '@/components/ui/card';
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

interface CreditCardListItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: string) => void;
}

export function CreditCardListItem({ card, onEdit, onDelete }: CreditCardListItemProps) {
  
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
  const formattedAnnualFee = formatCurrency(card.annualFee, card.currency);

  return (
    <Card>
      <div className="flex items-center justify-between p-3 gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative aspect-[1.586] w-20 bg-muted rounded flex-shrink-0">
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
            <p className="font-semibold truncate">{card.cardName}</p>
            <p className="text-sm text-muted-foreground">{card.provider}</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-x-6 text-sm text-center">
            <div>
                <p className="text-muted-foreground text-xs">Limit</p>
                <p className="font-medium">{formattedLimit}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs">Due Date</p>
                <p className="font-medium">{format(new Date(card.dueDate), 'MMM dd')}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs">Annual Fee</p>
                <p className="font-medium">{formattedAnnualFee}</p>
            </div>
             <div>
                <p className="text-muted-foreground text-xs">APR</p>
                <p className="font-medium">{card.apr}%</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
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
