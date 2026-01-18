import React, { useState, useEffect } from 'react';
import { X, Mic, Check, ArrowRightLeft, Trash2, HelpCircle } from 'lucide-react';
import { MOODS, ICON_MAP } from '../constants';
import { Transaction, TransactionType, Category, MoodType, Account, CategoryItem } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'date'> & { id?: string, date?: string }) => void;
  onDelete?: (id: string) => void;
  accounts: Account[];
  categories: CategoryItem[];
  editingTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, accounts, categories, editingTransaction 
}) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>(categories[0]?.id || 'food');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setDesc(editingTransaction.desc);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setMood(editingTransaction.mood);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setIsRecurring(!!editingTransaction.isRecurring);
    } else {
      // Reset defaults
      setDesc('');
      setAmount('');
      setType('expense');
      setCategory(categories[0]?.id || 'food');
      setMood('neutral');
      setAccountId(accounts[0]?.id || '');
      setToAccountId('');
      setIsRecurring(false);
    }
  }, [editingTransaction, isOpen, accounts, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !accountId) return;
    if (type === 'transfer' && !toAccountId) return;
    if (type === 'transfer' && accountId === toAccountId) {
      alert("Cannot transfer to the same account!");
      return;
    }
    
    onSave({
      id: editingTransaction?.id,
      date: editingTransaction?.date,
      desc,
      amount: parseFloat(amount),
      type,
      category: type === 'transfer' ? 'transfer' : category,
      mood,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      isRecurring
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (editingTransaction && onDelete) {
      if(window.confirm("Delete this transaction?")) {
        onDelete(editingTransaction.id);
        onClose();
      }
    }
  };

  const toggleListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setDesc('Coffee with friends');
      setAmount('15');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border border-gray-800 w-full max-w-md rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex bg-elevated p-1 rounded-xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-danger text-white' : 'text-gray-400'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-success text-black' : 'text-gray-400'}`}>Income</button>
            <button type="button" onClick={() => setType('transfer')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'transfer' ? 'bg-primary text-white' : 'text-gray-400'}`}>Transfer</button>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:border-primary focus:ring-1 outline-none transition-all"
              autoFocus={!editingTransaction}
            />
          </div>

          {/* Accounts Selection */}
          <div className="space-y-3">
             <div>
                <label className="text-xs text-gray-500 uppercase block mb-1">
                   {type === 'income' ? 'Deposit To' : type === 'transfer' ? 'From Account' : 'Pay With'}
                </label>
                <select 
                   value={accountId} 
                   onChange={(e) => setAccountId(e.target.value)}
                   className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
                >
                   <option value="" disabled>Select Account</option>
                   {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                   ))}
                </select>
             </div>

             {type === 'transfer' && (
                <div className="animate-slide-up">
                   <div className="flex justify-center my-2 text-primary"><ArrowRightLeft size={16}/></div>
                   <label className="text-xs text-gray-500 uppercase block mb-1">To Account</label>
                   <select 
                      value={toAccountId} 
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
                   >
                      <option value="" disabled>Select Destination</option>
                      {accounts.filter(a => a.id !== accountId).map(acc => (
                         <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                      ))}
                   </select>
                </div>
             )}
          </div>

          {/* Description */}
          <div className="relative">
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
            />
            <button type="button" onClick={toggleListening} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-danger text-white animate-pulse' : 'text-primary'}`}>
              <Mic size={18} />
            </button>
          </div>

          {/* Category Grid (Hidden for transfers) */}
          {type !== 'transfer' && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {categories.filter(c => c.id !== 'transfer').map((cat) => (
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
                    {ICON_MAP[cat.icon] || <HelpCircle size={14}/>}
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood Selector */}
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
                      mood === m.id ? 'bg-accent/20 border-accent scale-110' : 'bg-elevated border-transparent'
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
               className="w-4 h-4 rounded bg-elevated border-gray-600 text-primary"
             />
             <label htmlFor="recurring" className="text-sm text-gray-400">Recurring monthly payment</label>
          </div>

          <div className="flex gap-3">
             {editingTransaction && (
                <button
                   type="button"
                   onClick={handleDelete}
                   className="flex-1 bg-danger/10 text-danger border border-danger/20 font-bold py-4 rounded-xl hover:bg-danger/20 flex items-center justify-center gap-2"
                >
                   <Trash2 size={20} />
                   Delete
                </button>
             )}
             <button
                type="submit"
                className="flex-[2] bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/25 transform transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <Check size={20} />
                {editingTransaction ? 'Update' : 'Save'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;