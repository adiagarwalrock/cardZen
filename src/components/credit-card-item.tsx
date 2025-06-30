'use client';

import {
  AlarmClock,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  CreditCard as CreditCardIcon,
  DollarSign,
  Landmark,
  Pencil,
  Percent,
  Star,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { CreditCard, Benefit } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from './ui/separator';

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: string) => void;
}

const BenefitIcon = ({ type }: { type: Benefit['type'] }) => {
  if (type === 'cashback') {
    return <Banknote className="h-4 w-4 text-green-500" />;
  }
  return <Star className="h-4 w-4 text-yellow-500" />;
};

export function CreditCardItem({ card, onEdit, onDelete }: CreditCardItemProps) {
  const nextDueDate = new Date(card.dueDate);
  const today = new Date();
  const isPastDue = nextDueDate < today;
  
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
    <Card className="flex flex-col">
       <div className="relative aspect-[1.586/1] w-full bg-muted rounded-t-lg">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={`${card.cardName} card image`}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-t-lg bg-gradient-to-br from-card to-secondary">
            <CreditCardIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{card.cardName}</CardTitle>
                <CardDescription>
                {card.provider} &middot; {card.network}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
            <h4 className="font-semibold text-sm">Key Info</h4>
            <div className="flex items-center text-sm text-muted-foreground">
                <CircleDollarSign className="mr-2 h-4 w-4" />
                <span>Limit: {formattedLimit}</span>
            </div>
             <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Annual Fee: {formattedAnnualFee}</span>
            </div>
             <div className="flex items-center text-sm text-muted-foreground">
                <Percent className="mr-2 h-4 w-4" />
                <span>APR: {card.apr}%</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Statement on {format(new Date(card.statementDate), 'do')} of month</span>
            </div>
             <div className="flex items-center text-sm">
                <AlarmClock className="mr-2 h-4 w-4" />
                <span className={isPastDue ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                    Due on {format(new Date(card.dueDate), 'PPP')}
                </span>
            </div>
        </div>
        <Separator/>
         <div className="space-y-2">
            <h4 className="font-semibold text-sm">Perks</h4>
            <div className="flex flex-wrap gap-2">
            {card.perks?.length > 0 ? (
                card.perks.map((perk, index) => (
                <Badge key={index} variant="outline">
                    {perk}
                </Badge>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No perks added.</p>
            )}
            </div>
        </div>
        <Separator/>
        <div className="space-y-2">
            <h4 className="font-semibold text-sm">Rewards</h4>
            <div className="flex flex-wrap gap-2">
            {card.benefits.length > 0 ? (
                card.benefits.map((benefit) => (
                <Badge key={benefit.id} variant="secondary" className="flex items-center gap-1">
                    <BenefitIcon type={benefit.type} />
                    <span>{benefit.name}: {benefit.value}{benefit.type === 'cashback' ? '%' : 'x'}</span>
                </Badge>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No rewards added.</p>
            )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
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

        <Button variant="outline" size="icon" onClick={() => onEdit(card)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Card</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
