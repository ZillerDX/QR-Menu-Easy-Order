import React, { useState, useEffect } from 'react';
import { X, Coffee, CupSoda, Utensils, Cake, Pizza, Sparkles, Heart } from 'lucide-react';
import { MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MenuCategory | null;
  language: Language;
  onSave: (category: MenuCategory) => void;
}

const iconOptions = [
  { name: "Coffee", label: "Coffee", icon: <Coffee className="w-4 h-4" /> },
  { name: "CupSoda", label: "Drink/Tea", icon: <CupSoda className="w-4 h-4" /> },
  { name: "Utensils", label: "Food", icon: <Utensils className="w-4 h-4" /> },
  { name: "Cake", label: "Bakery", icon: <Cake className="w-4 h-4" /> },
  { name: "Pizza", label: "Snacks", icon: <Pizza className="w-4 h-4" /> },
  { name: "Sparkles", label: "Special", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Heart", label: "Healthy", icon: <Heart className="w-4 h-4" /> },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  language,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('Coffee');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setNameEn(category.nameEn);
      setIcon(category.icon || 'Coffee');
    } else {
      setName('');
      setNameEn('');
      setIcon('Coffee');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalCategory: MenuCategory = {
      id: category?.id || `cat-${Date.now()}`,
      name,
      nameEn: nameEn || name,
      icon,
    };

    onSave(finalCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <h3 className="font-extrabold text-base">
            {category ? (language === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category') : (language === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              {t('adminCategoryNameTh', language)} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น เมนูเส้น, สลัดเพื่อสุขภาพ"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              {t('adminCategoryNameEn', language)}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Noodle Dishes, Salads"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              {t('adminCategoryIcon', language)}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setIcon(opt.name)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    icon === opt.name
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition text-xs"
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold shadow-md shadow-orange-500/25 transition text-xs"
            >
              {t('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
