import React, { useState } from 'react';
import { X, Mic, Check } from 'lucide-react';
import { CATEGORIES, MOODS } from '../constants';
import { Transaction, TransactionType, Category, MoodType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'date'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('food');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    onSave({
      desc,
      amount: parseFloat(amount),
      type,
      category,
      mood,
      isRecurring
    });
    
    // Reset
    setDesc('');
    setAmount('');
    onClose();
  };

  const toggleListening = () => {
    setIsListening(true);
    // Mock voice input
    setTimeout(() => {
      setIsListening(false);
      setDesc('Coffee with friends');
      setAmount('15');
      setCategory('entertainment');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border border-gray-800 w-full max-w-md rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          New Transaction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex bg-elevated p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                type === 'expense' ? 'bg-danger text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                type === 'income' ? 'bg-success text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Description & Voice */}
          <div className="relative">
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening ? 'bg-danger text-white animate-pulse' : 'text-primary hover:bg-white/10'
              }`}
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Category Grid */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${
                    category === cat.id 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-elevated border-transparent text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {cat.icon}
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector (Behavioral Finance) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">How do you feel?</label>
              <div className="flex gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`flex-1 py-2 rounded-xl border text-xl transition-all ${
                      mood === m.id 
                        ? 'bg-accent/20 border-accent scale-110' 
                        : 'bg-elevated border-transparent hover:bg-white/5'
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
             <input 
               type="checkbox" 
               id="recurring" 
               checked={isRecurring}
               onChange={(e) => setIsRecurring(e.target.checked)}
               className="w-4 h-4 rounded bg-elevated border-gray-600 text-primary focus:ring-primary"
             />
             <label htmlFor="recurring" className="text-sm text-gray-400">Recurring monthly payment</label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/25 transform transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;