import { Transaction, SavingsGoal, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const KEYS = {
  TRANSACTIONS: 'mb_transactions',
  GOALS: 'mb_goals',
  SETTINGS: 'mb_settings',
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

export const loadGoals = (): SavingsGoal[] => {
  try {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Emergency Fund', target: 1000, current: 350, color: '#00ff9d' },
      { id: '2', name: 'New Laptop', target: 2000, current: 500, color: '#00d2ff' }
    ];
  } catch { return []; }
};

export const saveGoals = (goals: SavingsGoal[]) => {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
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