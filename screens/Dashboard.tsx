import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Eye, EyeOff, Search, BrainCircuit } from 'lucide-react';
import { Transaction, AppSettings } from '../types';
import { formatCurrency } from '../services/storage';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  settings: AppSettings;
  onTogglePrivacy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, settings, onTogglePrivacy }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((a, c) => a + c.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + c.amount, 0);
  const balance = income - expense;
  
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
            <span className="text-gray-400 text-sm font-medium">Total Balance</span>
            <div className="text-4xl font-bold mt-2 text-white">
              {formatCurrency(balance, settings.currency, settings.privacyMode)}
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

      {/* AI Insight Pill */}
      <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-start gap-3">
        <BrainCircuit size={24} className="text-accent shrink-0 mt-1" />
        <div>
          <h3 className="text-accent font-bold text-sm">AI Insight</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Spending on <span className="text-white font-semibold">Dining</span> is 15% higher than last week. Consider cooking at home this weekend to boost your savings rate.
          </p>
        </div>
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
            const catInfo = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[0];
            return (
              <div key={tx.id} className="bg-surface hover:bg-elevated transition-colors p-4 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: catInfo.color }}
                  >
                    {catInfo.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{tx.desc}</div>
                    <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {catInfo.label}</div>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-white'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency, settings.privacyMode)}
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