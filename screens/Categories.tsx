import React, { useState, useEffect } from 'react';
import { Plus, Pencil, ArrowLeft, Filter, HelpCircle } from 'lucide-react';
import { CategoryItem, Transaction, Account } from '../types';
import { ICON_MAP } from '../constants';
import { formatCurrency } from '../services/storage';

interface CategoriesProps {
  categories: CategoryItem[];
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
  onAdd: () => void;
  onEdit: (cat: CategoryItem) => void;
  onEditTransaction: (tx: Transaction) => void;
}

const Categories: React.FC<CategoriesProps> = ({ 
  categories, transactions, accounts, currency, onAdd, onEdit, onEditTransaction 
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // If the selected category is deleted, go back to grid
  useEffect(() => {
    if (selectedCategoryId && !categories.find(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(null);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  if (selectedCategory) {
    // Detail View
    const categoryTxs = transactions.filter(t => t.category === selectedCategory.id);
    // Sort desc date
    categoryTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalSpent = categoryTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalIncome = categoryTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="animate-slide-up space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setSelectedCategoryId(null)}
               className="p-3 bg-surface border border-gray-800 rounded-xl hover:bg-white/10 transition-colors"
             >
               <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-3">
                <div 
                   className="w-10 h-10 rounded-full flex items-center justify-center text-black shadow-lg"
                   style={{ backgroundColor: selectedCategory.color }}
                >
                   {ICON_MAP[selectedCategory.icon] || <HelpCircle size={18}/>}
                </div>
                <div>
                   <h2 className="text-2xl font-bold">{selectedCategory.label}</h2>
                   <p className="text-gray-400 text-sm">{categoryTxs.length} Transactions</p>
                </div>
             </div>
          </div>
          <button 
             onClick={() => onEdit(selectedCategory)}
             className="p-3 bg-surface border border-gray-800 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
             <Pencil size={20} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-surface p-6 rounded-2xl border border-gray-800">
              <span className="text-gray-400 text-sm">Total Spent</span>
              <div className="text-2xl font-bold text-danger mt-1">
                 {formatCurrency(totalSpent, currency, false)}
              </div>
           </div>
           <div className="bg-surface p-6 rounded-2xl border border-gray-800">
              <span className="text-gray-400 text-sm">Total Income</span>
              <div className="text-2xl font-bold text-success mt-1">
                 {formatCurrency(totalIncome, currency, false)}
              </div>
           </div>
        </div>

        {/* List */}
        <div className="space-y-3">
           {categoryTxs.map(tx => {
              const accountName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
              return (
                <div key={tx.id} className="bg-surface hover:bg-elevated transition-colors p-4 rounded-xl flex items-center justify-between group border border-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-elevated p-3 rounded-full text-gray-400">
                       {ICON_MAP[selectedCategory.icon] || <HelpCircle size={18}/>}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-primary transition-colors">
                         {tx.desc}
                      </div>
                      <div className="text-xs text-gray-500">
                         {new Date(tx.date).toLocaleDateString()} • {accountName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-success' : 'text-white'}`}>
                       {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, false)}
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
           
           {categoryTxs.length === 0 && (
             <div className="text-center py-10 text-gray-600">
                <Filter size={32} className="mx-auto mb-2 opacity-50"/>
                <p>No transactions in this category yet.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Categories</h2>
          <p className="text-gray-400">Organize your spending habits</p>
        </div>
        <button 
           onClick={onAdd}
           className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200"
        >
           <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
           <div 
             key={cat.id} 
             onClick={() => setSelectedCategoryId(cat.id)}
             className="bg-surface border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-elevated transition-colors group relative"
           >
             <div 
               className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-110"
               style={{ backgroundColor: cat.color }}
             >
               {ICON_MAP[cat.icon] || <HelpCircle />}
             </div>
             <span className="font-bold text-center">{cat.label}</span>
             
             <div className="text-xs text-gray-500">
               {transactions.filter(t => t.category === cat.id).length} items
             </div>
           </div>
        ))}

        <button 
           onClick={onAdd}
           className="bg-surface/30 border-2 border-dashed border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all text-gray-500"
        >
           <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5">
              <Plus size={24} />
           </div>
           <span className="font-bold">New Category</span>
        </button>
      </div>
    </div>
  );
};

export default Categories;