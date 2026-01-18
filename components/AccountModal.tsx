import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, CreditCard } from 'lucide-react';
import { Account } from '../types';
import { ACCOUNT_COLORS } from '../constants';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  onDelete?: (id: string) => void;
  editingAccount?: Account | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, onDelete, editingAccount }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'cash' | 'card'>('card');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setInitialBalance(editingAccount.initialBalance.toString());
      setColor(editingAccount.color);
    } else {
      setName('');
      setType('card');
      setInitialBalance('');
      setColor(ACCOUNT_COLORS[0]);
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    onSave({
      id: editingAccount?.id || Date.now().toString(),
      name,
      type,
      initialBalance: parseFloat(initialBalance) || 0,
      color,
      currency: 'JOD'
    });
    onClose();
  };

  const handleDelete = () => {
    if (editingAccount && onDelete) {
       if (window.confirm("Delete this account? All related transactions will remain but balance history may break.")) {
          onDelete(editingAccount.id);
          onClose();
       }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border border-gray-800 w-full max-w-md rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editingAccount ? 'Edit Wallet' : 'Add New Wallet'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 uppercase block mb-1">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arab Bank Visa"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
            />
          </div>

          <div className="flex gap-2">
             <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase block mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white">
                   <option value="card">Credit/Debit Card</option>
                   <option value="bank">Bank Account</option>
                   <option value="cash">Cash</option>
                </select>
             </div>
             <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase block mb-1">Initial Balance</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
                />
             </div>
          </div>

          <div>
             <label className="text-xs text-gray-500 uppercase block mb-2">Card Style</label>
             <div className="flex gap-2 overflow-x-auto pb-2">
                {ACCOUNT_COLORS.map(c => (
                   <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full flex-shrink-0 border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                      style={{ background: c }}
                   />
                ))}
             </div>
          </div>

          {/* Preview */}
          <div 
             className="h-32 rounded-xl p-4 flex flex-col justify-between shadow-lg"
             style={{ background: color }}
          >
             <div className="flex justify-between items-start text-white/90">
                <span className="font-bold">{name || 'Card Name'}</span>
                <CreditCard />
             </div>
             <div className="text-white font-mono text-xl">
                **** **** **** 1234
             </div>
          </div>

          <div className="flex gap-3">
             {editingAccount && onDelete && (
                <button
                   type="button"
                   onClick={handleDelete}
                   className="flex-1 bg-danger/10 text-danger border border-danger/20 font-bold py-4 rounded-xl hover:bg-danger/20 flex items-center justify-center gap-2"
                >
                   <Trash2 size={20} />
                </button>
             )}
             <button
               type="submit"
               className="flex-[4] bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:bg-gray-200 transform transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Check size={20} />
               Save Wallet
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;