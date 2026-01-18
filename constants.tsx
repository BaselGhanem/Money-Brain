import React from 'react';
import { 
  Utensils, Car, Receipt, Gamepad2, ShoppingBag, 
  HeartPulse, Briefcase, GraduationCap, TrendingUp 
} from 'lucide-react';
import { Category, MoodType } from './types';

export const CATEGORIES: { id: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'food', label: 'Food & Dining', icon: <Utensils size={18} />, color: '#ffcc00' },
  { id: 'transport', label: 'Transport', icon: <Car size={18} />, color: '#3a86ff' },
  { id: 'bills', label: 'Bills & Utils', icon: <Receipt size={18} />, color: '#ff0055' },
  { id: 'entertainment', label: 'Entertainment', icon: <Gamepad2 size={18} />, color: '#7000ff' },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={18} />, color: '#00d2ff' },
  { id: 'health', label: 'Health', icon: <HeartPulse size={18} />, color: '#00ff9d' },
  { id: 'work', label: 'Business', icon: <Briefcase size={18} />, color: '#ffffff' },
  { id: 'education', label: 'Education', icon: <GraduationCap size={18} />, color: '#f97316' },
  { id: 'investment', label: 'Investment', icon: <TrendingUp size={18} />, color: '#10b981' },
];

export const MOODS: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'happy', label: 'Confident', emoji: '🤩' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'stressed', label: 'Stressed', emoji: '🤯' },
  { id: 'impulsive', label: 'Impulsive', emoji: '💸' },
];

export const DEFAULT_SETTINGS = {
  currency: 'JOD',
  userName: 'User',
  pin: '1234',
  theme: 'dark' as const,
  privacyMode: false,
  budgetLimit: 2000,
};