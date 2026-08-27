import React, { useState, useEffect } from 'react';
import { X, Coffee, Sparkles, CupSoda, Utensils, Cake, Pizza, Heart } from 'lucide-react';
import { MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MenuCategory | null;
  language: Language;
  onSave: (category: MenuCategory) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Coffee', icon: Coffee, label: 'Coffee' },
  { name: 'CupSoda', icon: CupSoda, label: 'Tea / Drink' },
  { name: 'Utensils', icon: Utensils, label: 'Food / Meal' },
  { name: 'Cake', icon: Cake, label: 'Bakery' },
  { name: 'Pizza', icon: Pizza, label: 'Snack / Fastfood' },
  { name: 'Sparkles', icon: Sparkles, label: 'Special' },
  { name: 'Heart', icon: Heart, label: 'Healthy' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  language,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MenuCategory>>({
    name: '',
    nameEn: '',
    icon: 'Coffee',
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        id: `cat-${Date.now()}`,
        name: '',
        nameEn: '',
        icon: 'Coffee',
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const finalCategory: MenuCategory = {
      id: formData.id || `cat-${Date.now()}`,
      name: formData.name || '',
      nameEn: formData.nameEn || formData.name || '',
      icon: formData.icon || 'Coffee',
    };

    onSave(finalCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <h3 className="font-black text-base">
            {category ? (language === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category') : (language === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-black text-stone-800 mb-1.5">
              {t('adminCategoryNameTh', language)} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ชาและเครื่องดื่ม"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 mb-1.5">
              {t('adminCategoryNameEn', language)}
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Tea & Beverages"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-black text-stone-800 mb-2">
              {t('adminCategoryIcon', language)}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = formData.icon === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.name })}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-2xs font-black'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition text-xs sm:text-sm cursor-pointer"
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black shadow-md shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer"
            >
              {t('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
