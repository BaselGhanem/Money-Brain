import { Transaction, SavingsGoal, AppSettings, Account, CategoryItem } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES } from '../constants';

const KEYS = {
  TRANSACTIONS: 'mb_transactions',
  GOALS: 'mb_goals',
  SETTINGS: 'mb_settings',
  ACCOUNTS: 'mb_accounts',
  CATEGORIES: 'mb_categories',
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveTransactions = (txs: Transaction[]) => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
};

export const loadAccounts = (): Account[] => {
  try {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    if (data) return JSON.parse(data);
    // Default accounts for new users - ZERO BALANCES
    return [
      { id: '1', name: 'Cash Wallet', type: 'cash', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', initialBalance: 0, currency: 'JOD' },
      { id: '2', name: 'Arab Bank Visa', type: 'card', color: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', initialBalance: 0, currency: 'JOD' }
    ];
  } catch { return []; }
};

export const saveAccounts = (accounts: Account[]) => {
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const loadGoals = (): SavingsGoal[] => {
  try {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveGoals = (goals: SavingsGoal[]) => {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
};

export const loadCategories = (): CategoryItem[] => {
  try {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
};

export const saveCategories = (categories: CategoryItem[]) => {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const exportData = () => {
  const data = {
    transactions: loadTransactions(),
    goals: loadGoals(),
    settings: loadSettings(),
    accounts: loadAccounts(),
    categories: loadCategories(),
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MoneyBrain_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
};

export const formatCurrency = (amount: number, currency: string, privacy: boolean) => {
  if (privacy) return '******';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};