import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Simulator from './screens/Simulator';
import LockScreen from './screens/LockScreen';
import TransactionModal from './components/TransactionModal';
import { CategoryChart, MoodChart, NetWorthChart } from './components/Charts';
import { loadTransactions, saveTransactions, loadSettings, exportData } from './services/storage';
import { Transaction, AppSettings } from './types';
import { Download, Upload, CreditCard } from 'lucide-react';

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const handleAddTransaction = (txData: any) => {
    const newTx: Transaction = {
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setTransactions([newTx, ...transactions]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          transactions={transactions} 
          settings={settings} 
          onTogglePrivacy={() => setSettings(s => ({...s, privacyMode: !s.privacyMode}))} 
        />;
      
      case 'analytics':
        return (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold">Deep Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface p-6 rounded-2xl border border-gray-800">
                <h3 className="mb-4 font-bold text-gray-400">Spending by Category</h3>
                <CategoryChart transactions={transactions} theme="dark" />
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
                <button className="text-primary hover:underline">+ New Goal</button>
             </div>
             <div className="grid md:grid-cols-2 gap-4">
               {/* Mock Goals */}
               <div className="bg-surface p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">Emergency Fund</span>
                    <span className="text-success">35%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[35%]"></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">350 / 1000 JOD</div>
               </div>
               <div className="bg-surface p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">New Laptop</span>
                    <span className="text-primary">25%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[25%]"></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">500 / 2000 JOD</div>
               </div>
             </div>
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
          onOpenAdd={() => setIsAddOpen(true)}
          onLock={() => setIsLocked(true)}
        >
          {renderContent()}
        </Layout>
      )}

      <TransactionModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddTransaction}
      />
    </>
  );
};

export default App;