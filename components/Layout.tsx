import React from 'react';
import { 
  LayoutDashboard, PieChart, Target, Settings, Plus, 
  BrainCircuit, Wallet, LogOut, CreditCard, Layers
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAdd: () => void;
  onLock: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onOpenAdd, onLock }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'wallets', icon: <CreditCard size={20} />, label: 'Wallets' },
    { id: 'analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { id: 'categories', icon: <Layers size={20} />, label: 'Categories' },
    { id: 'simulator', icon: <BrainCircuit size={20} />, label: 'AI Simulator' },
    { id: 'goals', icon: <Target size={20} />, label: 'Goals' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-black font-bold text-xl">
            <Wallet size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-success">
            Money Brain
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(0,210,255,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-800 pt-6">
          <button 
            onClick={onLock}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative h-full overflow-y-auto bg-black scroll-smooth pb-24 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-gray-800 z-40 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}

          {/* Floating Action Button within Nav */}
          <div className="relative -top-6">
            <button
              onClick={onOpenAdd}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-white transform transition-transform active:scale-95 border-4 border-black"
            >
              <Plus size={28} />
            </button>
          </div>

          {navItems.slice(2, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Desktop FAB */}
      <button
        onClick={onOpenAdd}
        className="hidden md:flex fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent shadow-[0_10px_40px_rgba(112,0,255,0.4)] items-center justify-center text-white hover:scale-105 transition-transform z-50"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Layout;