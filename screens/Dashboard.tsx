import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Eye, EyeOff, Search, BrainCircuit, Pencil, HelpCircle } from 'lucide-react';
import { Transaction, AppSettings, Account, CategoryItem } from '../types';
import { formatCurrency } from '../services/storage';
import { ICON_MAP } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: CategoryItem[];
  settings: AppSettings;
  onTogglePrivacy: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, categories, settings, onTogglePrivacy, onEditTransaction }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((a, c) => a + c.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + c.amount, 0);
  
  // Calculate Total Net Worth (Sum of all account balances)
  const totalBalance = accounts.reduce((total, acc) => {
     const accTx = transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id);
     const accBal = accTx.reduce((bal, t) => {
        if (t.accountId === acc.id) {
           return t.type === 'income' ? bal + t.amount : bal - t.amount;
        }
        if (t.toAccountId === acc.id && t.type === 'transfer') return bal + t.amount;
        return bal;
     }, acc.initialBalance);
     return total + accBal;
  }, 0);
  
  // Calculate Score
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  let score = 50;
  if (savingsRate > 20) score = 90;
  else if (savingsRate > 10) score = 75;
  else if (savingsRate > 0) score = 60;
  else score = 40;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Good Morning, {settings.userName}</h1>
          <p className="text-gray-500 text-sm">Here is your financial overview.</p>
        </div>
        <button onClick={onTogglePrivacy} className="p-2 bg-elevated rounded-full hover:bg-gray-800 transition">
          {settings.privacyMode ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-primary" />}
        </button>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-elevated to-surface border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <span className="text-gray-400 text-sm font-medium">Total Net Worth</span>
            <div className="text-4xl font-bold mt-2 text-white">
              {formatCurrency(totalBalance, settings.currency, settings.privacyMode)}
            </div>
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2 text-success">
                <div className="p-1 bg-success/10 rounded-lg"><ArrowUpRight size={16} /></div>
                <span className="text-sm font-bold">{formatCurrency(income, settings.currency, settings.privacyMode)}</span>
              </div>
              <div className="flex items-center gap-2 text-danger">
                <div className="p-1 bg-danger/10 rounded-lg"><ArrowDownRight size={16} /></div>
                <span className="text-sm font-bold">{formatCurrency(expense, settings.currency, settings.privacyMode)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-elevated border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent rounded-2xl" />
          <div className="relative z-10 text-center">
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              {score}
            </div>
            <span className="text-sm text-gray-400 uppercase tracking-widest mt-2 block">Financial Health</span>
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${score > 70 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {score > 80 ? 'Excellent' : score > 50 ? 'Stable' : 'Needs Work'}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
         {accounts.map(acc => (
            <div key={acc.id} className="min-w-[150px] p-4 rounded-xl bg-elevated border border-gray-800 flex flex-col justify-between h-24 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
               <span className="text-xs text-gray-400 font-bold z-10 relative">{acc.name}</span>
               <div className="w-full h-1 bg-gray-700 rounded-full mt-2 mb-auto relative z-10">
                  <div className="h-full rounded-full" style={{ background: acc.color, width: '60%' }}></div>
               </div>
            </div>
         ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search..." 
               className="bg-elevated border-none rounded-full py-2 pl-9 pr-4 text-sm text-white focus:ring-1 focus:ring-primary w-32 md:w-48 transition-all focus:w-64"
             />
          </div>
        </div>
        
        <div className="space-y-3">
          {transactions.slice(0, 5).map(tx => {
            const catInfo = categories.find(c => c.id === tx.category) || categories[0];
            const accountName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
            
            return (
              <div key={tx.id} className="bg-surface hover:bg-elevated transition-colors p-4 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: catInfo?.color || '#333' }}
                  >
                    {catInfo ? (ICON_MAP[catInfo.icon] || <HelpCircle size={18}/>) : <HelpCircle size={18}/>}
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                       {tx.desc}
                       {tx.type === 'transfer' && <span className="text-[10px] bg-primary/20 text-primary px-2 rounded-full">Transfer</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                       {new Date(tx.date).toLocaleDateString()} • <span className="text-gray-400">{accountName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className={`font-bold ${tx.type === 'income' ? 'text-success' : tx.type === 'transfer' ? 'text-white' : 'text-white'}`}>
                     {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}{formatCurrency(tx.amount, settings.currency, settings.privacyMode)}
                   </div>
                   <button 
                      onClick={() => onEditTransaction(tx)}
                      className="p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                   >
                      <Pencil size={16} />
                   </button>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-10 text-gray-600">No transactions yet. Add one!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;