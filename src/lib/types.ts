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
  perks: string[];
  dueDate: number;
  statementDate: number;
  limit: number;
  currency: string;
  annualFee: number;
  apr: number;
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

export enum CustomListType {
  Provider = 'provider',
  Network = 'network',
  Perk = 'perk',
}
