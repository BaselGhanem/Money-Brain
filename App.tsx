import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Wallets from './screens/Wallets';
import Categories from './screens/Categories';
import Simulator from './screens/Simulator';
import LockScreen from './screens/LockScreen';
import TransactionModal from './components/TransactionModal';
import AccountModal from './components/AccountModal';
import CategoryModal from './components/CategoryModal';
import { CategoryChart, MoodChart, NetWorthChart } from './components/Charts';
import { loadTransactions, saveTransactions, loadSettings, exportData, loadAccounts, saveAccounts, loadGoals, saveGoals, loadCategories, saveCategories } from './services/storage';
import { Transaction, AppSettings, Account, SavingsGoal, CategoryItem } from './types';
import { Download, Upload, CreditCard, Trash2 } from 'lucide-react';

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  useEffect(() => {
    setTransactions(loadTransactions());
    setAccounts(loadAccounts());
    setGoals(loadGoals());
    setCategories(loadCategories());
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  // Transaction Handlers
  const handleSaveTransaction = (txData: any) => {
    if (txData.id) {
       // Edit existing
       setTransactions(prev => prev.map(t => t.id === txData.id ? { ...txData } : t));
    } else {
       // Add new
       const newTx: Transaction = {
         ...txData,
         id: Date.now().toString(),
         date: new Date().toISOString()
       };
       setTransactions([newTx, ...transactions]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
     setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openAddTransaction = () => {
     setEditingTransaction(null);
     setIsAddOpen(true);
  }

  const openEditTransaction = (tx: Transaction) => {
     setEditingTransaction(tx);
     setIsAddOpen(true);
  }

  // Account Handlers
  const handleSaveAccount = (accData: Account) => {
     if (accounts.some(a => a.id === accData.id)) {
        setAccounts(prev => prev.map(a => a.id === accData.id ? accData : a));
     } else {
        setAccounts([...accounts, accData]);
     }
     setEditingAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
     setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const openAddAccount = () => {
     setEditingAccount(null);
     setIsAccountModalOpen(true);
  };

  const openEditAccount = (acc: Account) => {
     setEditingAccount(acc);
     setIsAccountModalOpen(true);
  }

  // Category Handlers
  const handleSaveCategory = (catData: CategoryItem) => {
     if (categories.some(c => c.id === catData.id)) {
        setCategories(prev => prev.map(c => c.id === catData.id ? catData : c));
     } else {
        setCategories([...categories, catData]);
     }
     setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
     setCategories(prev => prev.filter(c => c.id !== id));
  };

  const openAddCategory = () => {
     setEditingCategory(null);
     setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: CategoryItem) => {
     setEditingCategory(cat);
     setIsCategoryModalOpen(true);
  };

  // Simple Goal Handler
  const handleAddGoal = () => {
    const name = window.prompt("Goal Name (e.g., New Car):");
    const targetStr = window.prompt("Target Amount (e.g., 5000):");
    
    if (name && targetStr) {
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        name,
        target: parseFloat(targetStr),
        current: 0,
        color: '#00d2ff'
      };
      setGoals([...goals, newGoal]);
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm("Delete this goal?")) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          transactions={transactions} 
          accounts={accounts}
          categories={categories}
          settings={settings} 
          onTogglePrivacy={() => setSettings(s => ({...s, privacyMode: !s.privacyMode}))} 
          onEditTransaction={openEditTransaction}
        />;
      
      case 'wallets':
        return <Wallets 
           accounts={accounts} 
           transactions={transactions}
           categories={categories}
           onAddAccount={openAddAccount}
           onEditAccount={openEditAccount}
           onEditTransaction={openEditTransaction}
           currency={settings.currency}
        />;

      case 'categories':
        return <Categories 
           categories={categories}
           onAdd={openAddCategory}
           onEdit={openEditCategory}
        />;

      case 'analytics':
        return (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold">Deep Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface p-6 rounded-2xl border border-gray-800">
                <h3 className="mb-4 font-bold text-gray-400">Spending by Category</h3>
                <CategoryChart transactions={transactions} categories={categories} theme="dark" />
              </div>
              <div className="bg-surface p-6 rounded-2xl border border-gray-800">
                <h3 className="mb-4 font-bold text-gray-400">Emotional Spending</h3>
                <MoodChart transactions={transactions} theme="dark" />
              </div>
              <div className="md:col-span-2 bg-surface p-6 rounded-2xl border border-gray-800">
                <h3 className="mb-4 font-bold text-gray-400">Net Worth Trend (7 Days)</h3>
                <NetWorthChart transactions={transactions} theme="dark" />
              </div>
            </div>
          </div>
        );

      case 'simulator':
        return <Simulator />;

      case 'goals':
        return (
           <div className="animate-slide-up space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Savings Goals</h2>
                <button 
                  onClick={handleAddGoal}
                  className="text-primary hover:underline font-bold"
                >
                  + New Goal
                </button>
             </div>
             
             {goals.length === 0 ? (
               <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800 rounded-2xl bg-surface/50">
                 <p className="mb-2 text-lg">No active savings goals.</p>
                 <p className="text-sm">Click "+ New Goal" to start saving for your dreams!</p>
               </div>
             ) : (
               <div className="grid md:grid-cols-2 gap-4">
                 {goals.map(g => (
                    <div key={g.id} className="bg-surface p-6 rounded-2xl border border-gray-800 relative group">
                        <button 
                          onClick={() => handleDeleteGoal(g.id)}
                          className="absolute top-4 right-4 text-gray-600 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-lg">{g.name}</span>
                          <span className="text-primary font-mono">{Math.round((g.current / g.target) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" 
                            style={{ width: `${Math.min((g.current / g.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-400 flex justify-between">
                          <span>{g.current} {settings.currency} saved</span>
                          <span>Target: {g.target} {settings.currency}</span>
                        </div>
                    </div>
                 ))}
               </div>
             )}
           </div>
        );

      case 'settings':
        return (
          <div className="animate-slide-up space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold">System Settings</h2>
            
            <div className="bg-surface rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-primary" />
                  <span>Currency</span>
                </div>
                <span className="text-gray-400">{settings.currency}</span>
              </div>
              <div 
                className="p-4 border-b border-gray-800 flex items-center justify-between hover:bg-white/5 cursor-pointer"
                onClick={exportData}
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-success" />
                  <span>Export Data (JSON)</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-warning" />
                  <span>Import Data</span>
                </div>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-600 mt-10">
              Money Brain v3.0 Ultimate • Secured by Biometrics
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isLocked && <LockScreen pin={settings.pin} onUnlock={() => setIsLocked(false)} />}
      
      {!isLocked && (
        <Layout 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onOpenAdd={openAddTransaction}
          onLock={() => setIsLocked(true)}
        >
          {renderContent()}
        </Layout>
      )}

      <TransactionModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        accounts={accounts}
        categories={categories}
        editingTransaction={editingTransaction}
      />

      <AccountModal
         isOpen={isAccountModalOpen}
         onClose={() => setIsAccountModalOpen(false)}
         onSave={handleSaveAccount}
         onDelete={handleDeleteAccount}
         editingAccount={editingAccount}
      />

      <CategoryModal
         isOpen={isCategoryModalOpen}
         onClose={() => setIsCategoryModalOpen(false)}
         onSave={handleSaveCategory}
         onDelete={handleDeleteCategory}
         editingCategory={editingCategory}
      />
    </>
  );
};

export default App;