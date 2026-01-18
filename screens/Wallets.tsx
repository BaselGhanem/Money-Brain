import React, { useState } from 'react';
import { Plus, CreditCard, Wallet, Pencil, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Account, Transaction, CategoryItem } from '../types';
import { formatCurrency } from '../services/storage';
import { ICON_MAP } from '../constants';

interface WalletsProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: CategoryItem[];
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onEditTransaction: (tx: Transaction) => void;
  currency: string;
}

const Wallets: React.FC<WalletsProps> = ({ accounts, transactions, categories, onAddAccount, onEditAccount, onEditTransaction, currency }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const getBalance = (accId: string, initial: number) => {
    const txs = transactions.filter(t => t.accountId === accId || t.toAccountId === accId);
    return txs.reduce((acc, t) => {
      if (t.accountId === accId) {
        if (t.type === 'expense' || t.type === 'transfer') return acc - t.amount;
        if (t.type === 'income') return acc + t.amount;
      }
      if (t.toAccountId === accId && t.type === 'transfer') {
        return acc + t.amount;
      }
      return acc;
    }, initial);
  };

  const selectedWallet = accounts.find(a => a.id === selectedWalletId);

  // --- DETAIL VIEW ---
  if (selectedWallet) {
    const walletTxs = transactions.filter(t => t.accountId === selectedWallet.id || t.toAccountId === selectedWallet.id);
    // Sort by date descending
    walletTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const currentBalance = getBalance(selectedWallet.id, selectedWallet.initialBalance);

    return (
      <div className="animate-slide-up space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedWalletId(null)}
            className="p-3 bg-surface border border-gray-800 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {selectedWallet.name}
              <button 
                onClick={() => onEditAccount(selectedWallet)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Pencil size={16} />
              </button>
            </h2>
            <p className="text-gray-400 text-sm">Transaction History</p>
          </div>
        </div>

        {/* Hero Card */}
        <div 
           className="relative h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
           style={{ background: selectedWallet.color }}
        >
           <div className="flex justify-between items-start text-white">
              <div>
                 <p className="font-medium opacity-80">{selectedWallet.type === 'cash' ? 'Cash Wallet' : 'Bank Card'}</p>
                 <h3 className="text-xl font-bold mt-1">Current Balance</h3>
              </div>
              {selectedWallet.type === 'cash' ? <Wallet size={32} /> : <CreditCard size={32} />}
           </div>

           <div className="text-white">
              <p className="text-4xl font-mono font-bold tracking-tight">
                 {formatCurrency(currentBalance, currency, false)}
              </p>
           </div>
           
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Transactions List */}
        <div>
          <h3 className="text-lg font-bold mb-4">Activity</h3>
          <div className="space-y-3">
            {walletTxs.map(tx => {
              const catInfo = categories.find(c => c.id === tx.category) || categories[0];
              const isTransfer = tx.type === 'transfer';
              const isIncome = tx.type === 'income' || (isTransfer && tx.toAccountId === selectedWallet.id);
              
              // Determine display logic for transfers
              let displayDesc = tx.desc;
              if (isTransfer) {
                 if (tx.accountId === selectedWallet.id) {
                    const toAcc = accounts.find(a => a.id === tx.toAccountId);
                    displayDesc = `Transfer to ${toAcc?.name || 'Unknown'}`;
                 } else {
                    const fromAcc = accounts.find(a => a.id === tx.accountId);
                    displayDesc = `Transfer from ${fromAcc?.name || 'Unknown'}`;
                 }
              }

              return (
                <div key={tx.id} className="bg-surface hover:bg-elevated transition-colors p-4 rounded-xl flex items-center justify-between group border border-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-black shadow-lg"
                      style={{ backgroundColor: catInfo?.color || '#333' }}
                    >
                      {catInfo ? (ICON_MAP[catInfo.icon] || <HelpCircle size={18}/>) : <HelpCircle size={18}/>}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-primary transition-colors">
                         {displayDesc}
                      </div>
                      <div className="text-xs text-gray-500">
                         {new Date(tx.date).toLocaleDateString()} • {catInfo?.label || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className={`font-bold text-lg ${isIncome ? 'text-success' : 'text-white'}`}>
                       {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency, false)}
                     </div>
                     <button 
                        onClick={() => onEditTransaction(tx)}
                        className="p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-primary rounded-full transition-all"
                     >
                        <Pencil size={14} />
                     </button>
                  </div>
                </div>
              );
            })}
            
            {walletTxs.length === 0 && (
              <div className="text-center py-10 text-gray-600 bg-surface rounded-2xl border border-gray-800 border-dashed">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p>No transactions found for this wallet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW (DEFAULT) ---
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">My Wallets</h2>
          <p className="text-gray-400">Manage your cards and bank accounts</p>
        </div>
        <button 
           onClick={onAddAccount}
           className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-transform active:scale-95"
        >
           <Plus size={18} /> Add New
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
           const currentBalance = getBalance(acc.id, acc.initialBalance);
           return (
              <div 
                 key={acc.id} 
                 onClick={() => setSelectedWalletId(acc.id)}
                 className="relative h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl group overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                 style={{ background: acc.color }}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditAccount(acc); }} 
                      className="p-2 bg-black/20 rounded-full hover:bg-black/40 text-white backdrop-blur-sm"
                    >
                       <Pencil size={16} />
                    </button>
                 </div>

                 <div className="flex justify-between items-start text-white relative z-10">
                    <div>
                       <p className="font-medium opacity-80">{acc.type === 'cash' ? 'Cash Wallet' : 'Bank Card'}</p>
                       <h3 className="text-xl font-bold mt-1 text-shadow">{acc.name}</h3>
                    </div>
                    {acc.type === 'cash' ? <Wallet /> : <CreditCard />}
                 </div>

                 <div className="text-white relative z-10">
                    <p className="text-xs opacity-70 mb-1">Current Balance</p>
                    <p className="text-3xl font-mono font-bold tracking-tight text-shadow">
                       {formatCurrency(currentBalance, currency, false)}
                    </p>
                 </div>
                 
                 {/* Decorative Circle */}
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              </div>
           );
        })}

        <button 
           onClick={onAddAccount}
           className="h-48 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2"
        >
           <Plus size={32} />
           <span className="font-bold">Add Another Wallet</span>
        </button>
      </div>
    </div>
  );
};

export default Wallets;