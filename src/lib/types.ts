export interface Benefit {
  id: string;
  name: string;
  value: number;
  type: 'cashback' | 'points';
}

export interface CreditCard {
  id:string;
  provider: string;
  network: string;
  cardName: string;
  benefits: Benefit[];
  dueDate: string;
  statementDate: string;
  limit: number;
  currency: string;
  imageUrl?: string;
  enableAlerts: boolean;
}

export interface SpendingHabit {
  id: string;
  category: string;
  amount: number;
}

export interface CustomListItem {
  id: string;
  name: string;
}
