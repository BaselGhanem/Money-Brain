export type TransactionType = 'income' | 'expense' | 'transfer';
export type MoodType = 'happy' | 'neutral' | 'stressed' | 'impulsive';
export type Category = string; // Changed from union type to string to support dynamic categories

export interface CategoryItem {
  id: string;
  label: string;
  icon: string; // The key name of the icon in the icon map
  color: string;
  type: 'expense' | 'income' | 'both'; // Optional, for future filtering
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'card';
  color: string;
  initialBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: TransactionType;
  category: Category;
  mood: MoodType;
  date: string; // ISO string
  isRecurring?: boolean;
  accountId: string; // The account money comes from (or goes to for income)
  toAccountId?: string; // For transfers: the destination account
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