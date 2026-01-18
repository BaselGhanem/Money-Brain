import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, HelpCircle } from 'lucide-react';
import { CategoryItem } from '../types';
import { ICON_MAP, CATEGORY_COLORS } from '../constants';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem) => void;
  onDelete?: (id: string) => void;
  editingCategory?: CategoryItem | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, onDelete, editingCategory }) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('Star');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (editingCategory) {
      setLabel(editingCategory.label);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
    } else {
      setLabel('');
      setIcon('Star');
      setColor(CATEGORY_COLORS[0]);
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;
    
    onSave({
      id: editingCategory?.id || label.toLowerCase().replace(/\s+/g, '-'),
      label,
      icon,
      color,
      type: 'expense' // Default, can be extended later
    });
    onClose();
  };

  const handleDelete = () => {
    if (editingCategory && onDelete) {
       if (window.confirm(`Delete category "${editingCategory.label}"? Transactions will keep the ID but display might break.`)) {
          onDelete(editingCategory.id);
          onClose();
       }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border border-gray-800 w-full max-w-md rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editingCategory ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 uppercase block mb-1">Category Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gym, Pet Food"
              className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none"
            />
          </div>

          <div>
             <label className="text-xs text-gray-500 uppercase block mb-2">Color</label>
             <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map(c => (
                   <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c }}
                   />
                ))}
             </div>
          </div>

          <div>
             <label className="text-xs text-gray-500 uppercase block mb-2">Icon</label>
             <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                {Object.keys(ICON_MAP).map(iconKey => (
                   <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${
                         icon === iconKey 
                           ? 'bg-white text-black border-white' 
                           : 'bg-elevated text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                   >
                      {ICON_MAP[iconKey]}
                   </button>
                ))}
             </div>
          </div>

          {/* Preview */}
          <div className="bg-elevated p-4 rounded-xl flex items-center gap-4 border border-gray-800">
             <div 
               className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-lg transition-colors"
               style={{ backgroundColor: color }}
             >
                {ICON_MAP[icon] || <HelpCircle />}
             </div>
             <div>
                <div className="font-bold text-lg">{label || 'Category Name'}</div>
                <div className="text-xs text-gray-500">Preview</div>
             </div>
          </div>

          <div className="flex gap-3 pt-2">
             {editingCategory && onDelete && editingCategory.id !== 'transfer' && (
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
               className="flex-[4] bg-primary text-black font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transform transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Check size={20} />
               Save Category
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;