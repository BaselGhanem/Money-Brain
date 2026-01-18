export type TransactionType = 'income' | 'expense';
export type MoodType = 'happy' | 'neutral' | 'stressed' | 'impulsive';
export type Category = 'food' | 'transport' | 'bills' | 'entertainment' | 'shopping' | 'health' | 'work' | 'education' | 'investment';

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: TransactionType;
  category: Category;
  mood: MoodType;
  date: string; // ISO string
  isRecurring?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

export interface AppSettings {
  currency: string;
  userName: string;
  pin: string;
  theme: 'dark' | 'light';
  privacyMode: boolean; // Blurs balances
  budgetLimit: number;
}

export interface FinancialSnapshot {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  score: number;
}