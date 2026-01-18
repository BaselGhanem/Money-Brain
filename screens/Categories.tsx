import React from 'react';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { CategoryItem } from '../types';
import { ICON_MAP } from '../constants';

interface CategoriesProps {
  categories: CategoryItem[];
  onAdd: () => void;
  onEdit: (cat: CategoryItem) => void;
}

const Categories: React.FC<CategoriesProps> = ({ categories, onAdd, onEdit }) => {
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
             onClick={() => onEdit(cat)}
             className="bg-surface border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-elevated transition-colors group relative"
           >
             <div 
               className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-110"
               style={{ backgroundColor: cat.color }}
             >
               {ICON_MAP[cat.icon] || <HelpCircle />}
             </div>
             <span className="font-bold text-center">{cat.label}</span>
             
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 p-1.5 rounded-full">
                   <Pencil size={12} className="text-white"/>
                </div>
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