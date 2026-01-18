import React from 'react';
import { 
  Utensils, Car, Receipt, Gamepad2, ShoppingBag, 
  HeartPulse, Briefcase, GraduationCap, TrendingUp, ArrowRightLeft,
  Coffee, Home, Plane, Wifi, Smartphone, Gift, Music,
  Zap, Anchor, Wrench, Book, Camera, Dumbbell, Star, 
  ShoppingCart, Truck, Umbrella, Watch, Sun, Moon
} from 'lucide-react';
import { MoodType, CategoryItem } from './types';

// Map of icon names to components for dynamic rendering
export const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={18} />,
  Car: <Car size={18} />,
  Receipt: <Receipt size={18} />,
  Gamepad2: <Gamepad2 size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  Briefcase: <Briefcase size={18} />,
  GraduationCap: <GraduationCap size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  ArrowRightLeft: <ArrowRightLeft size={18} />,
  Coffee: <Coffee size={18} />,
  Home: <Home size={18} />,
  Plane: <Plane size={18} />,
  Wifi: <Wifi size={18} />,
  Smartphone: <Smartphone size={18} />,
  Gift: <Gift size={18} />,
  Music: <Music size={18} />,
  Zap: <Zap size={18} />,
  Anchor: <Anchor size={18} />,
  Tool: <Wrench size={18} />,
  Book: <Book size={18} />,
  Camera: <Camera size={18} />,
  Dumbbell: <Dumbbell size={18} />,
  Star: <Star size={18} />,
  ShoppingCart: <ShoppingCart size={18} />,
  Truck: <Truck size={18} />,
  Umbrella: <Umbrella size={18} />,
  Watch: <Watch size={18} />,
  Sun: <Sun size={18} />,
  Moon: <Moon size={18} />,
};

// Default initial categories
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: '#ffcc00', type: 'expense' },
  { id: 'transport', label: 'Transport', icon: 'Car', color: '#3a86ff', type: 'expense' },
  { id: 'bills', label: 'Bills & Utils', icon: 'Receipt', color: '#ff0055', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#7000ff', type: 'expense' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#00d2ff', type: 'expense' },
  { id: 'health', label: 'Health', icon: 'HeartPulse', color: '#00ff9d', type: 'expense' },
  { id: 'work', label: 'Business', icon: 'Briefcase', color: '#ffffff', type: 'income' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', color: '#f97316', type: 'expense' },
  { id: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#10b981', type: 'both' },
  { id: 'transfer', label: 'Transfer', icon: 'ArrowRightLeft', color: '#888888', type: 'both' },
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

export const ACCOUNT_COLORS = [
  'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', // Blue
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Gold/Orange
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Teal
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Green
  'linear-gradient(135deg, #232526 0%, #414345 100%)', // Black
];

export const CATEGORY_COLORS = [
  '#ffcc00', '#3a86ff', '#ff0055', '#7000ff', '#00d2ff', '#00ff9d', 
  '#ffffff', '#f97316', '#10b981', '#888888', '#ec4899', '#6366f1'
];